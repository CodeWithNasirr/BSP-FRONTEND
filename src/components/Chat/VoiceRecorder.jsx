// ═══════════════════════════════════════════════════════════════════════════════
// components/VoiceRecorder.jsx
// WhatsApp-style voice message recorder
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useCallback, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const MAX_RECORDING_DURATION = 120; // 2 minutes max
const WAVEFORM_BARS = 40;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const VoiceRecorder = ({ onSend, onCancel, disabled = false }) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [waveformData, setWaveformData] = useState(new Array(WAVEFORM_BARS).fill(0));
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // REFS
  // ═══════════════════════════════════════════════════════════════════════════
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const animationRef = useRef(null);
  const audioRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════════════════════
  const cleanup = useCallback(() => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Clear media recorder
    mediaRecorderRef.current = null;
    analyserRef.current = null;
    chunksRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [cleanup, audioUrl]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FORMAT TIME
  // ═══════════════════════════════════════════════════════════════════════════
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // WAVEFORM VISUALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  const updateWaveform = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample the frequency data into waveform bars
    const step = Math.floor(dataArray.length / WAVEFORM_BARS);
    const newWaveform = [];

    for (let i = 0; i < WAVEFORM_BARS; i++) {
      const start = i * step;
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += dataArray[start + j] || 0;
      }
      // Normalize to 0-1 range
      newWaveform.push(Math.min(1, (sum / step) / 128));
    }

    setWaveformData(newWaveform);
    animationRef.current = requestAnimationFrame(updateWaveform);
  }, [isRecording]);

  // ═══════════════════════════════════════════════════════════════════════════
  // START RECORDING
  // ═══════════════════════════════════════════════════════════════════════════
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setPermissionDenied(false);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      streamRef.current = stream;

      // Setup audio context for visualization
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Setup MediaRecorder
      // Try to use webm/opus for better compression, fallback to other formats
      const mimeTypes = [
            'audio/ogg;codecs=opus', // 👈 WhatsApp compatible
            'audio/ogg',
            'audio/webm;codecs=opus',
            ];


      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error('No supported audio format found');
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000,
      });

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: selectedMimeType });
        setAudioBlob(blob);

        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      // Start recording
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= MAX_RECORDING_DURATION) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      // Start waveform animation
      animationRef.current = requestAnimationFrame(updateWaveform);

    } catch (err) {
      console.error('Failed to start recording:', err);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError('Failed to start recording. Please try again.');
      }

      cleanup();
    }
  }, [cleanup, updateWaveform]);

  // ═══════════════════════════════════════════════════════════════════════════
  // STOP RECORDING
  // ═══════════════════════════════════════════════════════════════════════════
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    setIsPaused(false);

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Stop stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // CANCEL RECORDING
  // ═══════════════════════════════════════════════════════════════════════════
  const cancelRecording = useCallback(() => {
    cleanup();
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioBlob(null);
    setWaveformData(new Array(WAVEFORM_BARS).fill(0));

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    onCancel?.();
  }, [cleanup, audioUrl, onCancel]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SEND VOICE MESSAGE
  // ═══════════════════════════════════════════════════════════════════════════
  const sendVoiceMessage = useCallback(() => {
    if (!audioBlob) return;

    // Create a File object from the blob
    const extension = audioBlob.type.includes('webm') ? 'webm' :
                      audioBlob.type.includes('ogg') ? 'ogg' :
                      audioBlob.type.includes('mp4') ? 'm4a' : 'mp3';

    const file = new File([audioBlob], `voice_${Date.now()}.${extension}`, {
      type: audioBlob.type,
    });

    onSend?.(file, duration);

    // Reset state
    cancelRecording();
  }, [audioBlob, duration, onSend, cancelRecording]);

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYBACK CONTROLS
  // ═══════════════════════════════════════════════════════════════════════════
  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Audio element event handlers
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setPlaybackProgress((audio.currentTime / audio.duration) * 100);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setPlaybackProgress(0);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER - IDLE STATE (Mic Button)
  // ═══════════════════════════════════════════════════════════════════════════
  if (!isRecording && !audioBlob) {
    return (
      <div className="relative">
        {/* Error Message */}
        {error && (
          <div className="absolute bottom-full mb-2 left-0 right-0 bg-red-100 text-red-700 text-xs p-2 rounded-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Mic Button */}
        <button
          type="button"
          onClick={startRecording}
          disabled={disabled || permissionDenied}
          className={`
            flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200
            ${disabled || permissionDenied
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600'
            }
          `}
          title={permissionDenied ? 'Microphone access denied' : 'Record voice message'}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER - RECORDING STATE
  // ═══════════════════════════════════════════════════════════════════════════
  if (isRecording) {
    return (
      <div className="flex items-center gap-3 bg-red-50 rounded-full px-3 py-2 w-full sm:min-w-[280px]">

        {/* Cancel Button */}
        <button
          type="button"
          onClick={cancelRecording}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
          title="Cancel recording"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Recording Indicator */}
        <div className="flex items-center gap-2 flex-1">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-red-600 min-w-[40px]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Waveform */}
        <div className="flex items-center gap-0.5 h-8 flex-1 overflow-hidden max-w-[120px] sm:max-w-none">

          {waveformData.map((value, index) => (
            <div
              key={index}
              className="w-1 bg-red-400 rounded-full transition-all duration-75"
              style={{
                height: `${Math.max(4, value * 32)}px`,
              }}
            />
          ))}
        </div>

        {/* Stop Button */}
        <button
          type="button"
          onClick={stopRecording}
          className="flex items-center justify-center w-10 h-10 flex-shrink-0 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          title="Stop recording"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER - PREVIEW STATE
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex items-center gap-3 bg-green-50 rounded-full px-4 py-2 min-w-[280px]">
      {/* Delete Button */}
      <button
        type="button"
        onClick={cancelRecording}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
        title="Delete recording"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlayback}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
      >
        {isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Progress Bar */}
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-1 bg-green-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-100"
            style={{ width: `${playbackProgress}%` }}
          />
        </div>
        <span className="text-xs text-green-700 min-w-[40px]">
          {formatTime(duration)}
        </span>
      </div>

      {/* Send Button */}
      <button
        type="button"
        onClick={sendVoiceMessage}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
        title="Send voice message"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  );
};

export default VoiceRecorder;