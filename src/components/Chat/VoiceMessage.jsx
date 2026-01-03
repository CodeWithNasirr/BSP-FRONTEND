// ═══════════════════════════════════════════════════════════════════════════════
// components/VoiceMessage.jsx
// WhatsApp-style voice message player
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const WAVEFORM_BARS = 35;
const PLAYBACK_RATES = [1, 1.5, 2];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const VoiceMessage = ({
  src,
  duration: initialDuration,
  isOutbound = false,
  timestamp,
  status,
}) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [waveformData, setWaveformData] = useState([]);

  // ═══════════════════════════════════════════════════════════════════════════
  // REFS
  // ═══════════════════════════════════════════════════════════════════════════
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERATE STATIC WAVEFORM (simulated)
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    // Generate a consistent waveform based on the src URL hash
    const generateWaveform = () => {
      const bars = [];
      // Use URL as seed for consistent waveform per message
      let seed = 0;
      for (let i = 0; i < src.length; i++) {
        seed = ((seed << 5) - seed) + src.charCodeAt(i);
        seed = seed & seed;
      }

      for (let i = 0; i < WAVEFORM_BARS; i++) {
        // Generate pseudo-random but deterministic values
        const x = Math.sin(seed + i * 0.5) * 10000;
        const value = Math.abs(x - Math.floor(x));
        // Add some variation - higher in middle, lower at edges
        const positionFactor = 1 - Math.abs((i / WAVEFORM_BARS) - 0.5) * 0.5;
        bars.push(Math.max(0.2, value * positionFactor));
      }

      setWaveformData(bars);
    };

    generateWaveform();
  }, [src]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FORMAT TIME
  // ═══════════════════════════════════════════════════════════════════════════
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIO SETUP
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Event listeners
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    const handleError = () => {
      setError(true);
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    // Load audio
    audio.src = src;
    audio.preload = 'metadata';

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.pause();
      audio.src = '';
    };
  }, [src]);

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYBACK CONTROL
  // ═══════════════════════════════════════════════════════════════════════════
  const togglePlayback = useCallback(() => {
    if (!audioRef.current || error) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Pause any other playing audio on the page
      document.querySelectorAll('audio').forEach(a => {
        if (a !== audioRef.current) a.pause();
      });
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, error]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SEEK CONTROL
  // ═══════════════════════════════════════════════════════════════════════════
  const handleSeek = useCallback((e) => {
    if (!progressRef.current || !audioRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYBACK RATE
  // ═══════════════════════════════════════════════════════════════════════════
  const cyclePlaybackRate = useCallback(() => {
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
    const newRate = PLAYBACK_RATES[nextIndex];

    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  }, [playbackRate]);

  // ═══════════════════════════════════════════════════════════════════════════
  // PROGRESS CALCULATION
  // ═══════════════════════════════════════════════════════════════════════════
  const progress = useMemo(() => {
    if (!duration) return 0;
    return (currentTime / duration) * 100;
  }, [currentTime, duration]);

  // Calculate which bars should be "played"
  const playedBars = useMemo(() => {
    return Math.floor((progress / 100) * WAVEFORM_BARS);
  }, [progress]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER - ERROR STATE
  // ═══════════════════════════════════════════════════════════════════════════
  if (error) {
    return (
      <div className={`
        flex items-center gap-3 px-3 py-2 rounded-lg min-w-[200px]
        ${isOutbound ? 'bg-green-100' : 'bg-white'}
      `}>
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-sm text-red-600">Audio unavailable</span>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div
    className={`
        flex items-center gap-3 px-3 py-2 rounded-xl w-full
        ${isOutbound ? 'bg-green-200' : 'bg-white'}
    `}
    >
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlayback}
        disabled={isLoading}
        className={`
          flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full
          transition-colors duration-200
          ${isLoading
            ? 'bg-gray-200 cursor-wait'
            : isOutbound
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }
        `}
      >
        {isLoading ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Waveform & Progress */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        {/* Waveform */}
       <div
        ref={progressRef}
        onClick={handleSeek}
        className="flex items-center gap-0.5 h-6 cursor-pointer overflow-hidden"
        >

          {waveformData.map((value, index) => (
            <div
              key={index}
              className={`
                w-1 rounded-full transition-colors duration-150
                ${index < playedBars
                  ? isOutbound ? 'bg-green-600' : 'bg-blue-500'
                  : isOutbound ? 'bg-green-400' : 'bg-gray-300'
                }
              `}
              style={{
                height: `${Math.max(4, value * 24)}px`,
              }}
            />
          ))}
        </div>

        {/* Time & Controls */}
        <div className="flex items-center justify-between">
          <span className={`text-xs ${isOutbound ? 'text-green-700' : 'text-gray-500'}`}>
            {isPlaying ? formatTime(currentTime) : formatTime(duration)}
          </span>

          {/* Playback Rate Button */}
          {isPlaying && (
            <button
              type="button"
              onClick={cyclePlaybackRate}
              className={`
                text-xs font-medium px-1.5 py-0.5 rounded
                ${isOutbound
                  ? 'bg-green-300 text-green-800 hover:bg-green-400'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              {playbackRate}x
            </button>
          )}
        </div>
      </div>

      {/* Microphone Icon (decorative) */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${isOutbound ? 'bg-green-300' : 'bg-gray-100'}
      `}>
        <svg
          className={`w-4 h-4 ${isOutbound ? 'text-green-700' : 'text-gray-500'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      </div>
    </div>
  );
};

export default VoiceMessage;