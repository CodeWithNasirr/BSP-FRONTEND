import React, { useState,useRef, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { assest } from '../../assets/assets';
const ChatWindow = ({recipient}) => {
  const [messages, setMessages] = useState([]);
  // console.log(messages)
  const [socket, setSocket] = useState(null);
  const token = localStorage.getItem("authToken");
  const chatContainerRef=useRef(null); 

// WebSocket connection
  useEffect(() => {
    if (!recipient || !token) return;

    const connectWebSocket = () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      const backendHost = API_BASE_URL.replace('http://', '').replace('https://', '');
      const wsUrl = `${wsProtocol}${backendHost}/ws/chat/${recipient}/?token=${token}`;

      const newSocket = new WebSocket(wsUrl);

      newSocket.onopen = () => {
        console.log('WebSocket connected');
        setSocket(newSocket);
      };

      newSocket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'connection_success') {
        
          } else if (data.message?.action === 'new_message') {
            const newMessage = data.message.data;
            // Deduplicate by message_id
            setMessages((prev) =>
              prev.some((msg) => msg.message_id === newMessage.message_id)
                ? prev
                : [...prev, newMessage]
            );
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      newSocket.onclose = (e) => {
        console.log(`WebSocket disconnected: ${e.code} - ${e.reaso0}`);
        setTimeout(() => {
          console.log('Attempting to reconnect...');
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

  // Fetch initial messages
  useEffect(() => {
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
          if (!acc.some((m) => m.message_id === msg.message_id)) {
            acc.push(msg);
          }
          return acc;
        }, []);
        setMessages(uniqueMessages);
      } catch (error) {
        console.error('Initial chat fetch failed:', error);
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
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const cancelImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const confirmImageSend = (e) => {
    // You could also call handleSubmit here if image needs form submission
    handleSubmit(e);
    cancelImage(); // Reset after sending
  };

  const [formData,setFormData]=useState({
    url:"",
    message_text:"",
    recipient:""
  })

  const handleChange=(e)=>{
    const {name,value}=e.target;
    setFormData((prevent)=>({
      ...prevent,[name]:value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      if (selectedImage) {
        // Build multipart/form-data for image message
        const imageFormData = new FormData();
        imageFormData.append("recipient", recipient);
        imageFormData.append("message_text", formData.message_text);
        imageFormData.append("url", selectedImage); // backend should expect 'url' field
  
        const response = await axios.post(
          `${API_BASE_URL}/api/whatsapp/send-message/`,
          imageFormData,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
  
        // Reset everything after success
        setFormData({
          url: "",
          message_text: "",
          recipient: "",
        });
        cancelImage(); // clears preview and selected file
      } else {
        // Send normal text message
        const updatedFormData = {
          ...formData,
          recipient: recipient,
        };
  
        const response = await axios.post(
          `${API_BASE_URL}/api/whatsapp/send-message/`,
          updatedFormData,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        setFormData({
          url: "",
          message_text: "",
          recipient: "",
        });
      }
  
      // Optionally reload or trigger a refresh state
      // window.location.reload();
  
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  return( 
    <div className="flex flex-col">
       <div className="h-[40rem] flex flex-col " > 
         {/* Chat Header */}
        <div className="flex justify-center text-emerald-600  p-2 sticky top-0 z-10">
          {/* <span id="online-count" className="pr-1">3</span>online */}
          <span className='border-b border-gray-200'>{recipient}</span>
        </div>

        {/* Chat Content */}
        <div id='chat_container' ref={chatContainerRef} className="overflow-y-auto grow">
        <ul id='chat_messages' className="flex flex-col justify-end gap-2 p-4">
            {[...messages]
              .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
              .map(msg => (
                <li key={msg.id}>
                  {msg.direction === "OUTBOUND" ? (
                    <>
                      <div className='flex justify-end mb-1'>
                        <div className="bg-green-200 rounded-l-lg rounded-tr-lg p-4 max-w-[60%]">
                          {msg.header_text && <h1 className='font-semibold'>{msg.header_text}</h1>}
                          
                          {/* Media Content */}
                          {msg.media_url && (
                            <div className="mb-2">
                              <img 
                                src={`${msg.media_url}`}
                                crossOrigin="anonymous"
                                alt="Sent media"
                                className="max-w-full h-auto rounded-lg max-h-60 object-contain"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  // e.target.src = '/placeholder-image.png';
                                }}
                                loading="lazy"
                              />
                      
                            </div>
                          )}
                          
                          <span>{msg.text_content}</span>
                          <div className="text-xs text-gray-500 mt-1">
                            <span className='font-light'>{msg.footer_text}</span><br />
                            {new Date(msg.timestamp).toLocaleTimeString()} &middot; {msg.status}
                          </div>
                        </div> 
                        
                        <div className="flex items-end">
                          <svg height="13" width="8">
                            <path fill="#bbf7d0" d="M6.3,10.4C1.5,8.7,0.9,5.5,0,0.2L0,13l5.2,0C7,13,9.6,11.5,6.3,10.4z" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex justify-end items-center">
                        <span className="bg-zinc-100 rounded-l-lg rounded-tr-lg max-w-[61%] w-full text-center text-blue-500">
                          {msg.button_text}
                        </span>
                      </div>
                    </>
                  ) : (
                    // Inbound Message (received from contact)
                    <div className='flex justify-start'>
                      <div className="flex items-end">
                        <svg height="13" width="8">
                          <path fill="white" d="M2.8,13L8,13L8,0.2C7.1,5.5,6.5,8.7,1.7,10.4C-1.6,11.5,1,13,2.8,13z" />
                        </svg>
                      </div>
                      <div className="bg-white p-4 max-w-[75%] rounded-r-lg rounded-tl-lg">
                        {msg.media_type === 'image' && msg.media_url && (
                          <div className="mb-2 relative">
                            <img 
                              src={`${msg.media_url}`}
                              crossOrigin="anonymous"
                              alt="Sent media"
                              className="max-w-full h-auto rounded-lg max-h-60 object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                              }}
                              loading="lazy"
                            />
                          </div>
                        )}

                        <span>{msg.text_content}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()} &middot; {msg.status}
                        </div>
                      </div>
                    </div>
                  )}
                </li>
            ))}
          </ul>
        
        </div>


      {/* Chat Input */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 shadow-sm px-4 py-3">
      <form
        id="chat_message_form"
        className="w-full flex items-center gap-2"
        onSubmit={handleSubmit}
      >
        {/* Upload Icon Button */}
        <label
          htmlFor="file-upload"
          className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full cursor-pointer transition"
          title="Upload Image"
        >
          <svg
            className="w-5 h-5"
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
          accept=".jpg, .png"
          id="file-upload"
          name="url"
        />

        {/* Text Input */}
        <input
          
          value={formData.message_text}
          onChange={handleChange}
          type="text"
          name="message_text"
          placeholder="Type your message..."
          maxLength="150"
          className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input type="hidden" name="recipient" value={recipient} onChange={handleChange} />

        <button
          type="submit"
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition"
        >
          Send
        </button>
      </form>

      {/* Image Preview Modal */}
      {imagePreview && (
        <div className="mt-4 bg-gray-50 border rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview Selected Image:</p>
          <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-lg mb-3" />
          <div className="flex justify-end gap-2">
            <button
              onClick={cancelImage}
              type="button"
              className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={confirmImageSend}
              type="button"
              className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Send Image
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
      </div>
  )
};

export default ChatWindow;