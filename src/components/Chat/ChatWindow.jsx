import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import RequireSubscription from '../Subscriptions/RequireSubscription';
import { Context } from '../context/Context';
import ChatInputArea from './Chatinputarea';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import VoiceMessage from './VoiceMessage';

const ChatWindow = ({ recipient }) => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const token = localStorage.getItem('authToken');
  const chatContainerRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const { subscriptionStatus } = useContext(Context);
  const [isConversationExpired, setIsConversationExpired] = useState(false);
  
  // ========== Flow Session States ==========
  const [activeFlow, setActiveFlow] = useState(null);
  const [isFlowPaused, setIsFlowPaused] = useState(false);
  const [availableFlows, setAvailableFlows] = useState([]);
  const [selectedFlowId, setSelectedFlowId] = useState(null);
  const [selectedSessionId, setSessionFlowId] = useState(null);
  const [showFlowSelector, setShowFlowSelector] = useState(false);

  // ========== sheduler logic here  ==========
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(v => v + 1); // re-render every minute
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);


  const fetchScheduledMessages = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/scheduled/${recipient}/`,
          { headers: { Authorization: `Token ${token}` } }
        );
        setScheduledMessages(res.data || []);
      } catch (err) {
        console.error("Failed to fetch scheduled messages", err);
      }
    };
  useEffect(() => {
    if (!recipient || !token) return;
    fetchScheduledMessages();
    }, [recipient, token]);



  const handleDeleteScheduled = async (id) => {
      try {
        await axios.delete(
          `${API_BASE_URL}/api/scheduled/delete/${id}/`,
          { headers: { Authorization: `Token ${token}` } }
        );

        setScheduledMessages(prev => prev.filter(m => m.id !== id));
        toast.success("Scheduled message deleted");
      } catch (err) {
        toast.error("Failed to delete scheduled message");
      }
    };

    const getRemainingTime = (sendAt) => {
      const now = new Date();
      const target = new Date(sendAt);
      const diffMs = target - now;

      if (diffMs <= 0) return "sending now";

      const totalMinutes = Math.floor(diffMs / 60000);
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;

      if (days > 0) return `in ${days}d ${hours}h`;
      if (hours > 0) return `in ${hours}h ${minutes}m`;
      return `in ${minutes}m`;
    };

 





  // ═══════════════════════════════════════════════════════════════════════════
  // FILE TYPE CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════
  const getAllowedFileTypes = () => {
    const plan = subscriptionStatus?.plan?.toUpperCase();
    switch (plan) {
      case 'BASIC':
        return {
          types: ['image/jpeg', 'image/png'],
          accept: 'image/jpeg,image/png',
          maxSize: 5 * 1024 * 1024,
          description: 'Images (JPEG, PNG)',
          allowVoice: true,
        };
      case 'GROWTH':
        return {
          types: [
            'image/jpeg', 'image/png',
            'video/mp4', 'video/avi', 'video/mov',
            'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/x-m4a',   // ✅ ADD THIS,
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ],
          accept: 'image/jpeg,image/png,video/*,audio/*,application/pdf,.doc,.docx,.m4a',
          maxSize: 5 * 1024 * 1024,
          description: 'Images, Videos, Audio, Documents',
          allowVoice: true,
        };
      case 'BUSINESS PRO':
        return {
          types: [
            'image/jpeg', 'image/png',
            'video/mp4', 'video/avi', 'video/mov',
            'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          ],
          accept: 'image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx',
          maxSize: 16 * 1024 * 1024,
          description: 'All media types',
          allowVoice: true,
        };
      default:
        return {
          types: [],
          accept: '',
          maxSize: 0,
          description: 'No file uploads allowed',
          allowVoice: true,
        };
    }
  };

  const allowedFiles = getAllowedFileTypes();

  const isFileTypeAllowed = (file) => {
    if (allowedFiles.types.includes(file.type)) return true;

    // Fallback for audio/*
    if (file.type.startsWith('audio/') && allowedFiles.accept.includes('audio/*')) {
      return true;
    }

    return false;
  };


  const getFileCategory = (fileType) => {
    if (fileType?.startsWith('image/')) return 'image';
    if (fileType?.startsWith('video/')) return 'video';
    if (fileType?.startsWith('audio/')) return 'audio';
    if (fileType?.includes('pdf') || fileType?.includes('document') || fileType?.includes('word') || fileType?.includes('excel')) return 'document';
    return 'file';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const formatDateSeparator = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FLOW MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/flows/list/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setAvailableFlows(response.data.data || []);
      } catch (error) {
        console.error('Error fetching flows:', error);
      }
    };

    if (token) {
      fetchFlows();
    }
  }, [token]);
  
  useEffect(() => {
    const fetchFlowStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/flows/status/?phone_number=${recipient}`, {
          headers: { Authorization: `Token ${token}` }
        });
        const { success, data, message } = response.data;
        if (success && data) {
          setActiveFlow(data);
          setSelectedFlowId(data.flow || null);
          setSessionFlowId(data.id || null);
          setIsFlowPaused(data.is_paused || false);
        } else {
          setActiveFlow(null);
          setSelectedFlowId(null);
          setSessionFlowId(null);
          setIsFlowPaused(false);
        }
      } catch (error) {
        console.error("Error fetching flow status:", error.response?.data?.error || error.message);
      }
    };

    if (recipient && token) {
      fetchFlowStatus();
    }
  }, [recipient, token]);

  const handleStartFlow = async () => {
    if (!selectedFlowId) {
      alert('Please select a flow first');
      return;
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/flows/start/`,
        { phone_number: recipient, flow_id: selectedFlowId },
        { headers: { Authorization: `Token ${token}` } }
      );
      const data = response.data;
      setActiveFlow(data?.data);
      setShowFlowSelector(false);
      toast.success(data?.message || 'Flow started successfully');
    } catch (error) {
      console.error('Error starting flow:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to start flow';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleFlowAction = async (action) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/flows/update-status/`,
        { session_id: selectedSessionId, action },
        { headers: { Authorization: `Token ${token}` } }
      );

      const message = response.data.message || `Flow ${action}d successfully`;
      toast.success(message);

      if (action === 'pause') {
        setIsFlowPaused(true);
      } else if (action === 'resume') {
        setIsFlowPaused(false);
      } else if (action === 'stop') {
        setActiveFlow(null);
        setIsFlowPaused(false);
      }
    } catch (error) {
      console.error(`Error performing ${action} on flow:`, error);
      const errorMsg = error.response?.data?.error || `Failed to ${action} flow`;
      toast.error(errorMsg);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBSOCKET CONNECTION
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!recipient || !token) return;

    const connectWebSocket = () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      const backendHost = API_BASE_URL.replace('http://', '').replace('https://', '');
      const wsUrl = `${wsProtocol}${backendHost}/ws/chat/${recipient}/?token=${token}`;

      const newSocket = new WebSocket(wsUrl);

      newSocket.onopen = () => {
        setSocket(newSocket);
      };

      newSocket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          const msg = data.message;
          if (!msg) return;

          const action = msg.action;
          const payload = msg.data;

          if (action === "new_message") {
            setMessages(prev => {
              if (prev.some(m => m.message_id === payload.message_id)) {
                return prev;
              }

              // Replace optimistic VOICE message
              if (payload.media_type === "audio") {
                const index = prev.findIndex(
                  m => m.temp_id && m.media_type === "audio" && m.direction === "OUTBOUND"
                );
                if (index !== -1) {
                  const updated = [...prev];
                  updated[index] = payload;
                  return updated;
                }
              }

              // Replace optimistic TEXT / FILE message
              const tempIndex = prev.findIndex(m => m.temp_id);
              if (tempIndex !== -1) {
                const updated = [...prev];
                updated[tempIndex] = payload;
                return updated;
              }

              return [...prev, payload];
            });
            return;
          }

          if (action === "update_status") {
            setMessages((prev) =>
              prev.map((m) =>
                m.message_id === payload.message_id
                  ? { ...m, status: payload.status }
                  : m
              )
            );
            return;
          }
        } catch (error) {
          console.error("WS parse error:", error);
        }
      };

      newSocket.onclose = (e) => {
        setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return newSocket;
    };

    const ws = connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [recipient, token]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH INITIAL MESSAGES
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    setMessages([]);
    setIsConversationExpired(false);

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/chats/${recipient}/`, {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = response.data;
        const uniqueMessages = data.Data.reduce((acc, msg) => {
          if (!acc.some((m) => msg.message_id && m.message_id === msg.message_id)) {
            acc.push(msg);
          }
          return acc;
        }, []);
        setMessages(uniqueMessages);
        setIsConversationExpired(data.expired);
      } catch (error) {
        console.error('Initial chat fetch failed:', error);
        toast.error(error.response?.data?.error || 'Failed to fetch messages');
      }
    };

    if (recipient) {
      fetchMessages();
    }
  }, [recipient, token]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE HANDLERS (Used by ChatInputArea)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Handle text/interactive message from ChatInputArea
   */
  const handleSendText = async ({ message_text, buttons = [],scheduleAt = null }) => {
    if (!message_text.trim()) return;

    // 🕒 SCHEDULED
    if (scheduleAt) {
      await axios.post(
        `${API_BASE_URL}/api/chat/schedule-message/`,
        {
          recipient,
          message_text,
          buttons,
          send_at: scheduleAt,
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      toast.success("Message scheduled");
      await fetchScheduledMessages();
      return;
    }

    const tempId = "temp_" + Date.now();

    const optimisticMessage = {
      id: tempId,
      temp_id: tempId,
      message_id: null,
      text_content: message_text,
      media_url: null,
      buttons: buttons,
      direction: "OUTBOUND",
      status: "sending",
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setIsSending(true);

    try {
      const body = {
        recipient,
        message_text: message_text,
        buttons: buttons.length > 0 ? buttons : undefined,
        url: "",
      };


      await axios.post(`${API_BASE_URL}/api/whatsapp/send-message/`, body, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
     
      setMessages(prev =>
        prev.map(m => (m.temp_id === tempId ? { ...m, status: "sent" } : m))
      );
    }
     catch (error) {
      console.error("Error sending text message:", error);
      setMessages(prev =>
        prev.map(m => (m.temp_id === tempId ? { ...m, status: "failed" } : m))
      );
      toast.error(error.response?.data?.error || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle file upload from ChatInputArea
   */
  const handleSendFile = async ({ file, caption = "" , scheduleAt = null }) => {
    if (!file) return;

    if (!isFileTypeAllowed(file)) {
      toast.error(`File type not allowed. Your ${subscriptionStatus?.plan || 'current'} plan supports: ${allowedFiles.description}`);
      return;
    }

    if (file.size > allowedFiles.maxSize) {
      toast.error(`File too large. Maximum: ${formatFileSize(allowedFiles.maxSize)}`);
      return;
    }

    // 🕒 SCHEDULED
    if (scheduleAt) {
      const formData = new FormData();
      formData.append("recipient", recipient);
      formData.append("message_text", caption);
      formData.append("url", file);
      formData.append("send_at", scheduleAt);

      await axios.post(
        `${API_BASE_URL}/api/chat/schedule-message/`,
        formData,
        { headers: { Authorization: `Token ${token}` } }
      );

      toast.success("File scheduled");
      await fetchScheduledMessages();
      return;
    }



    const tempId = "temp_" + Date.now();

    const optimisticMessage = {
      id: tempId,
      temp_id: tempId,
      message_id: null,
      text_content: caption,
      media_url: URL.createObjectURL(file),
      media_type: getFileCategory(file.type),
      direction: "OUTBOUND",
      status: "sending",
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append("recipient", recipient);
      formData.append("message_text", caption);
      formData.append("url", file);

      await axios.post(`${API_BASE_URL}/api/whatsapp/send-message/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

   
      setMessages(prev =>
        prev.map(m => (m.temp_id === tempId ? { ...m, status: "sent" } : m))
      );
     

    } catch (error) {
      console.error("Error sending file:", error);
      setMessages(prev =>
        prev.map(m => (m.temp_id === tempId ? { ...m, status: "failed" } : m))
      );
      toast.error(error.response?.data?.error || "Failed to send file");
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle voice message from ChatInputArea
   */
  const handleSendVoice = async (audioFile, duration,scheduleAt = null) => {
    // 🕒 SCHEDULED
    if (scheduleAt) {
      const formData = new FormData();
      formData.append("recipient", recipient);
      formData.append("url", audioFile);
      formData.append("voice_duration", duration);
      formData.append("send_at", scheduleAt);

      await axios.post(
        `${API_BASE_URL}/api/chat/schedule-message/`,
        formData,
        { headers: { Authorization: `Token ${token}` } }
      );

      toast.success("Voice message scheduled");
      await fetchScheduledMessages();
      return;
    }

    const tempId = "temp_" + Date.now();

    const optimisticMessage = {
      id: tempId,
      temp_id: tempId,
      message_id: null,
      text_content: "",
      media_type: "audio",
      media_url: URL.createObjectURL(audioFile),
      voice_duration: duration,
      direction: "OUTBOUND",
      status: "sending",
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const formData = new FormData();
      formData.append("recipient", recipient);
      formData.append("message_text", "");
      formData.append("url", audioFile);


      await axios.post(`${API_BASE_URL}/api/whatsapp/send-message/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessages(prev =>
        prev.map(m => (m.temp_id === tempId ? { ...m, status: "sent" } : m))
      );
    } catch (error) {
      console.error("Voice message error:", error);
      setMessages(prev =>
        prev.map(m => (m.temp_id === tempId ? { ...m, status: "failed" } : m))
      );
      toast.error(error.response?.data?.error || "Failed to send voice message");
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  const ChatImage = ({ src, alt }) => {
    const [error, setError] = React.useState(false);

    if (error) {
      return (
        <div className="text-sm text-red-500 italic mt-2">
          Image not loaded
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        className="max-w-full h-auto rounded-lg max-h-40 md:max-h-60 object-contain"
        loading="lazy"
        onError={() => setError(true)}
      />
    );
  };

  const renderMediaContent = (msg, isOutbound = false) => {
    const plan = subscriptionStatus?.plan?.toUpperCase();
    
    if (msg.media_url) {
      if (plan === 'BASIC' && msg.media_type !== 'image') {
        return (
          <div className="mb-2 p-3 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 7a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7zM6 3a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Media content (Upgrade to view)</span>
            </div>
          </div>
        );
      }

      if (msg.media_type === "image") {
        return (
          <div className="mb-2">
            <ChatImage
              src={msg.media_url}
              alt={isOutbound ? "Sent media" : "Received media"}
            />
          </div>
        );
      }

      if (msg.media_type === 'audio') {
        return (
          <div className="mb-2">
            <VoiceMessage
              src={msg.media_url}
              duration={msg.voice_duration}
              isOutbound={isOutbound}
              timestamp={msg.timestamp}
              status={msg.status}
            />
          </div>
        );
      }

      if (msg.media_type === 'video') {
        return (
          <div className="mb-2">
            <video
              src={msg.media_url}
              controls
              className="max-w-full h-auto rounded-lg max-h-40 md:max-h-60"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>
        );
      }

      if (msg.media_type === 'document') {
        return (
          <div className="mb-2 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="text-sm font-medium text-gray-900">Document</div>
                <a 
                  href={msg.media_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Click to view
                </a>
              </div>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  const renderInteractiveButtons = (msg) => {
    if (!msg.buttons || msg.buttons.length === 0) return null;

    const isReadOnly = !!msg.button_text;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {msg.buttons.map((btn, index) => {
          const label = btn.title || btn.text || "Button";
          
          return (
            <button
              key={btn.id || index}
              disabled={isReadOnly}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors duration-200 shadow-sm ${
                isReadOnly
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = new Date(msg.timestamp).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(msg);
    return acc;
  }, {});

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <RequireSubscription>
      <div className="flex flex-col min-h-screen">
        {/* Header with Flow Controls */}
        <div className="p-2 bg-white border-b border-gray-200 sticky top-0 z-50 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="block md:hidden p-1.5 bg-gray-200 rounded-full hover:bg-gray-300 transition"
            >
              <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm md:text-base font-semibold text-gray-800 truncate max-w-[150px] md:max-w-[250px]">
              {recipient}
            </span>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 justify-end">
            {!activeFlow ? (
              <button
                onClick={() => setShowFlowSelector(!showFlowSelector)}
                className="bg-green-500 hover:bg-green-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm transition-colors duration-200"
              >
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="hidden sm:inline">Start Flow</span>
                  <span className="sm:hidden">Start</span>
                </span>
              </button>
            ) : (
              <>
                {isFlowPaused ? (
                  <button
                    onClick={() => handleFlowAction('resume')}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm transition-colors duration-200"
                  >
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <span className="hidden sm:inline">Resume</span>
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleFlowAction('pause')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm transition-colors duration-200"
                  >
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="hidden sm:inline">Pause</span>
                    </span>
                  </button>
                )}
                <button
                  onClick={() => handleFlowAction('stop')}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm ml-1 md:ml-2 transition-colors duration-200"
                >
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">Stop</span>
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Flow Selector Dropdown */}
        {showFlowSelector && (
          <div className="bg-blue-50 border-b border-blue-200 p-3">
            <div className="flex items-center gap-3">
              <select
                value={selectedFlowId || ''}
                onChange={(e) => setSelectedFlowId(e.target.value)}
                className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a flow...</option>
                {availableFlows.map((flow) => (
                  <option key={flow.id} value={flow.id}>{flow.name}</option>
                ))}
              </select>
              <button
                onClick={handleStartFlow}
                disabled={!selectedFlowId}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Start
              </button>
              <button
                onClick={() => setShowFlowSelector(false)}
                className="text-gray-600 hover:text-gray-800 px-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Active Flow Status Bar */}
        {activeFlow && (
          <div className={`border-b p-3 ${isFlowPaused ? 'bg-yellow-50' : 'bg-green-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isFlowPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {activeFlow.flow_name || 'Active Flow'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {isFlowPaused ? 'Paused' : 'Running'} • Node: {activeFlow.current_node_id || 'Starting'}
                  </div>
                </div>
              </div>
              {activeFlow.progress !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-600">{activeFlow.progress}% Complete</div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${isFlowPaused ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${activeFlow.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scheduled Messages Status Bar */}
        {scheduledMessages.length > 0 && (
          <div className="sticky top-[56px] z-40 bg-yellow-50 border-b border-yellow-200 px-3 py-2">
            <div className="flex flex-col gap-2">
              {scheduledMessages.map(msg => (
                <div
                  key={msg.id}
                  className="flex items-center justify-between text-xs bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full shadow"
                >
                  <span>
                    ⏰ Scheduled {getRemainingTime(msg.send_at)}
                  </span>
                  <button
                    onClick={() => handleDeleteScheduled(msg.id)}
                    className="ml-2 text-red-600 hover:text-red-800 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="overflow-y-auto grow h-[calc(70vh-50px)] md:h-[calc(100vh-150px)] p-2 md:p-4 pb-16 md:pb-4"
        >

          <ul className="flex flex-col gap-3">
            {Object.keys(groupedMessages)
              .sort((a, b) => new Date(a) - new Date(b))
              .map((date) => (
                <React.Fragment key={date}>
                  <li className="text-center my-2">
                    <span className="inline-block bg-gray-200 text-gray-700 text-sm px-4 py-1 rounded-full">
                      {formatDateSeparator(date)}
                    </span>
                  </li>
                  {groupedMessages[date]
                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                    .map((msg) => (
                      <li key={msg.id}>
                        {msg.direction === 'OUTBOUND' ? (
                          <div className="flex justify-end mb-3">
                            <div className="bg-green-200 p-3 rounded-l-lg rounded-tr-lg max-w-[85%] md:max-w-[420px]">
                              {msg.header_text && (
                                <h1 className="font-semibold text-sm md:text-base">{msg.header_text}</h1>
                              )}
                              {renderMediaContent(msg, true)}
                              <span className="text-sm md:text-base break-words whitespace-pre-wrap">{msg.text_content}</span>
                              {renderInteractiveButtons(msg)}
                              <div className="text-xs md:text-sm text-gray-600 mt-1 flex justify-end">
                                <span>{formatTimestamp(msg.timestamp)} · {msg.status}</span>
                              </div>
                            </div>
                            <div className="flex items-end">
                              <svg height="13" width="8">
                                <path fill="#bbf7d0" d="M6.3,10.4C1.5,8.7,0.9,5.5,0,0.2L0,13l5.2,0C7,13,9.6,11.5,6.3,10.4z" />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-start mb-3">
                            <div className="flex items-end">
                              <svg height="13" width="8">
                                <path fill="white" d="M2.8,13L8,13L8,0.2C7.1,5.5,6.5,8.7,1.7,10.4C-1.6,11.5,1,13,2.8,13z" />
                              </svg>
                            </div>
                            <div className="bg-white p-3 md:p-4 max-w-[75%] rounded-r-lg rounded-tl-lg shadow-sm">
                              {renderMediaContent(msg, false)}
                              <span className="text-sm md:text-base break-all break-words whitespace-pre-wrap overflow-hidden">{msg.text_content}</span>
                              {renderInteractiveButtons(msg)}
                              <div className="text-xs md:text-sm text-gray-600 mt-1">
                                {formatTimestamp(msg.timestamp)} · {msg.status}
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                </React.Fragment>
              ))}
          </ul>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            CHAT INPUT - Using the new ChatInputArea component
        ═══════════════════════════════════════════════════════════════════ */}
        <ChatInputArea
          recipient={recipient}
          onSendText={handleSendText}
          onSendFile={handleSendFile}
          onSendVoice={handleSendVoice}
          isConversationExpired={isConversationExpired}
          isSending={isSending}
          allowedFiles={allowedFiles}
          subscriptionStatus={subscriptionStatus}
        />
      </div>
    </RequireSubscription>
  );
};

export default ChatWindow;