import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { assest } from '../../assets/assets';
import RequireSubscription from '../Subscriptions/RequireSubscription';

const ChatWindow = ({ recipient }) => {
  const [messages, setMessages] = useState([]);
  // console.log(messages)
  const [socket, setSocket] = useState(null);
  const token = localStorage.getItem('authToken');
  const chatContainerRef = useRef(null);
  const [isSending, setIsSending] = useState(false);

  // WebSocket connection
  useEffect(() => {
    if (!recipient || !token) return;

    const connectWebSocket = () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      const backendHost = API_BASE_URL.replace('http://', '').replace('https://', '');
      const wsUrl = `${wsProtocol}${backendHost}/ws/chat/${recipient}/?token=${token}`;

      const newSocket = new WebSocket(wsUrl);

      newSocket.onopen = () => {
        // console.log(`WebSocket connected for ${recipient}`);
        setSocket(newSocket);
      };

      newSocket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'connection_success') {
            // console.log('WebSocket connection successful');
          } else if (data.message?.action === 'new_message') {
            const newMessage = data.message.data;
            // Only append if message matches current recipient
            if (newMessage.recipient === recipient) {
              setMessages((prev) =>
                prev.some((msg) => msg.message_id === newMessage.message_id)
                  ? prev
                  : [...prev, newMessage]
              );
            }
          }
        } catch (error) {
          // console.error('Error parsing WebSocket message:', error);
        }
      };

      newSocket.onclose = (e) => {
        // console.log(`WebSocket disconnected: ${e.code} - ${e.reason}`);
        setTimeout(() => {
          // console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 3000);
      };

      newSocket.onerror = (error) => {
        // console.error('WebSocket error:', error);
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

  // Fetch initial messages and reset on recipient change
  useEffect(() => {
    // Reset messages when recipient changes
    setMessages([]);

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/chats/${recipient}/`, {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
        // Deduplicate initial messages by message_id
        const uniqueMessages = response.data.Data.reduce((acc, msg) => {
          if (!acc.some((m) => msg.message_id && m.message_id === msg.message_id)) {
            acc.push(msg);
          }
          return acc;
        }, []);
        setMessages(uniqueMessages);
      } catch (error) {
        // console.error('Initial chat fetch failed:', error);
        alert(`Error: ${error.response?.data?.error || 'Failed to fetch messages'}`);
      }
    };

    if (recipient) {
      fetchMessages();
    }
  }, [recipient, token]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      alert('Please select a JPEG or PNG image');
    }
  };

  const cancelImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const confirmImageSend = (e) => {
    handleSubmit(e);
    cancelImage();
  };

  const [formData, setFormData] = useState({
    url: '',
    message_text: '',
    recipient: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message_text.trim() && !selectedImage) {
      alert('Please enter a message or select an image');
      return;
    }
    setIsSending(true);

    try {
      if (selectedImage) {
        const imageFormData = new FormData();
        imageFormData.append('recipient', recipient);
        imageFormData.append('message_text', formData.message_text);
        imageFormData.append('url', selectedImage);

        await axios.post(
          `${API_BASE_URL}/api/whatsapp/send-message/`,
          imageFormData,
          {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        const updatedFormData = {
          recipient,
          message_text: formData.message_text,
          url: ''
        };

        await axios.post(
          `${API_BASE_URL}/api/whatsapp/send-message/`,
          updatedFormData,
          {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      setFormData({
        url: '',
        message_text: '',
        recipient: ''
      });
      cancelImage();
    } catch (error) {
      console.error('Error sending message:', error);
      alert(`Error: ${error.response?.data?.error || 'Something went wrong'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <RequireSubscription>
      <div className="flex flex-col min-h-screen">
        {/* Chat Header */}
        <div className="hidden md:flex md:justify-center md:text-emerald-600 md:p-2 md:sticky md:top-0 md:z-10">
          <span className="border-b border-gray-200">{recipient}</span>
        </div>

        {/* Chat Content */}
        <div
          id="chat_container"
          ref={chatContainerRef}
          className="overflow-y-auto grow h-[calc(70vh-50px)] md:h-[calc(100vh-150px)] p-2 md:p-4 pb-16 md:pb-4"
        >
          <ul id="chat_messages" className="flex flex-col gap-2">
            {[...messages]
              .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
              .map((msg) => (
                <li key={msg.id}>
                  {msg.direction === 'OUTBOUND' ? (
                    <>
                      <div className="flex justify-end mb-2">
                        <div className="bg-green-200 rounded-l-lg rounded-tr-lg p-2 md:p-4 max-w-[70%]">
                          {msg.header_text && (
                            <h1 className="font-semibold text-sm md:text-base">{msg.header_text}</h1>
                          )}
                          {msg.media_url && (
                            <div className="mb-2">
                              <img
                                src={`${msg.media_url}`}
                                crossOrigin="anonymous"
                                alt="Sent media"
                                className="max-w-full h-auto rounded-lg max-h-40 md:max-h-60 object-contain"
                                onError={(e) => {
                                  e.target.onerror = null;
                                }}
                                loading="lazy"
                              />
                            </div>
                          )}
                          <span className="text-sm md:text-base">{msg.text_content}</span>
                          <div className="text-xs md:text-sm text-gray-500 mt-1">
                            <span className="font-light">{msg.footer_text}</span>
                            <br />
                            {new Date(msg.timestamp).toLocaleTimeString()} · {msg.status}
                          </div>
                        </div>
                        <div className="flex items-end">
                          <svg height="10" md:height="13" width="6" md:width="8">
                            <path fill="#bbf7d0" d="M6.3,10.4C1.5,8.7,0.9,5.5,0,0.2L0,13l5.2,0C7,13,9.6,11.5,6.3,10.4z" />
                          </svg>
                        </div>
                      </div>
                      {msg.button_text && (
                        <div className="flex justify-end items-center mb-2">
                          <span className="bg-zinc-100 rounded-l-lg rounded-tr-lg min-w-[70%] text-center text-blue-500 text-sm md:text-base p-1 md:p-2">
                            {msg.button_text}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-start mb-2">
                      <div className="flex items-end">
                        <svg height="10" md:height="13" width="6" md:width="8">
                          <path fill="white" d="M2.8,13L8,13L8,0.2C7.1,5.5,6.5,8.7,1.7,10.4C-1.6,11.5,1,13,2.8,13z" />
                        </svg>
                      </div>
                      <div className="bg-white p-2 md:p-4 max-w-[75%] rounded-r-lg rounded-tl-lg">
                        {msg.media_type === 'image' && msg.media_url && (
                          <div className="mb-2">
                            <img
                              src={`${msg.media_url}`}
                              crossOrigin="anonymous"
                              alt="Received media"
                              className="max-w-full h-auto rounded-lg max-h-40 md:max-h-60 object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                              }}
                              loading="lazy"
                            />
                          </div>
                        )}
                        <span className="text-sm md:text-base">{msg.text_content}</span>
                        <div className="text-xs md:text-sm text-gray-500 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()} · {msg.status}
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
          </ul>
        </div>

        {/* Chat Input */}
        <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 shadow-sm p-2 md:p-3">
          <form
            id="chat_message_form"
            className="w-full flex items-center gap-2"
            onSubmit={handleSubmit}
          >
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full cursor-pointer transition"
              title="Upload Image"
            >
              <svg
                className="w-4 md:w-5 h-4 md:h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v6m0 0l-3-3m3 3l3-3M12 6v6"
                />
              </svg>
            </label>
            <input
              onChange={handleImageChange}
              type="file"
              className="sr-only"
              accept="image/jpeg,image/png"
              id="file-upload"
              name="url"
            />

            <input
              value={formData.message_text}
              onChange={handleChange}
              type="text"
              name="message_text"
              placeholder="Type your message..."
              maxLength="150"
              className="flex-1 px-2 md:px-4 py-1 md:py-2 bg-gray-100 rounded-full text-sm md:text-base text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input type="hidden" name="recipient" value={recipient} onChange={handleChange} />

            <button
              type="submit"
              disabled={isSending}
              className="flex items-center px-2 md:px-4 py-1 md:py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base font-medium rounded-full transition disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <svg className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l5-5-5-5v4a12 12 0 00-12 12h4z" />
                  </svg>
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </button>
          </form>

          {imagePreview && (
            <div className="mt-2 md:mt-4 bg-gray-50 border rounded-lg p-2 md:p-3">
              <p className="text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">Preview Selected Image:</p>
              <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-lg mb-2 md:mb-3" />
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelImage}
                  type="button"
                  className="px-2 md:px-3 py-1 text-sm md:text-base text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmImageSend}
                  type="button"
                  disabled={isSending}
                  className="px-2 md:px-3 py-1 text-sm md:text-base text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSending ? 'Sending Image...' : 'Send Image'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequireSubscription>
  );
};

export default ChatWindow;