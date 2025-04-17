import React, { useState,useRef, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
const ChatWindow = ({conversationId}) => {
  const [messages, setMessages] = useState([]);
  console.log(messages)
  const [userName,setUserName]= useState([]);
  const [recipient,setRecipient]=useState([])
  const token = localStorage.getItem("authToken");
  const chatContainerRef=useRef(null);

  useEffect(() => {
    let interval;
    if (conversationId) {
      interval = setInterval(() => {
        axios.get(`${API_BASE_URL}/get_chathistroy/${conversationId}/`, {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        })
        .then(response => {
          setMessages(response.data.Data.messages || []);
          setUserName(response.data.Data);
          setRecipient(response.data.Data.phone_number);
        })
        .catch(error => {
          console.error("Polling failed:", error);
        });
      }, 3000); // Poll every 3 seconds
    }
  
    return () => clearInterval(interval);
  }, [conversationId]);

  // Auto Scroll 
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  

  const [formData,setFormData]=useState({
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
   
    const updatedFormData = {
      ...formData,
      recipient: recipient, 
    };
    try {
      const response = await axios.post(`${API_BASE_URL}/send-message/`, updatedFormData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // console.log(response)
      setFormData({
        message_text:"",
        recipient:""
      })
    
      // window.location.reload()
      // console.log("Message sent successfully:", response.data);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
  return( 
    <div className="flex flex-col">
       <div className="h-[40rem] flex flex-col " > 
         {/* Chat Header */}
        <div className="flex justify-center text-emerald-600  p-2 sticky top-0 z-10">
          {/* <span id="online-count" className="pr-1">3</span>online */}
          <span className='border-b border-gray-200'>{userName.user_name}</span>
        </div>

        {/* Chat Content */}
        <div id='chat_container' ref={chatContainerRef} className="overflow-y-auto grow">
          <ul id='chat_messages' className="flex flex-col justify-end gap-2 p-4">
            {messages.map(msg=>( 
              <li key={msg.id}>
                {msg.direction === "OUTBOUND"?
                (<> 
                  <div className='flex justify-end mb-1'>
                 <div className="bg-green-200 rounded-l-lg rounded-tr-lg p-4 max-w-[60%]">
                 {msg.header_text && <h1 className='font-semibold'>{msg.header_text}</h1>}
                
                  {/* Media Content */}
                  {msg.media_type === 'image' && msg.media_url ? (
                    <div className="mb-2">
                       <img 
                        src={`http://127.0.0.1:8000/media/${msg.media_url}`}  // now points to a saved file!
                        crossOrigin="anonymous"
                        alt="Sent media"
                        className="max-w-full h-auto rounded-lg max-h-60 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.png';
                          e.target.className += ' opacity-50 grayscale';
                        }}
                        loading="lazy"
                      />
                     </div>
                  ) : null}
                  <span>{msg.text_content}</span>
                  <div className="text-xs text-gray-500 mt-1">
                    <span className='font-light   '>{msg.footer_text}</span><br />
                  {new Date(msg.timestamp).toLocaleTimeString()} &middot; {msg.status}
                </div>
                
                 </div> 
                
                <div className="flex items-end">
                  <svg height="13" width="8">
                    <path fill="#bbf7d0" d="M6.3,10.4C1.5,8.7,0.9,5.5,0,0.2L0,13l5.2,0C7,13,9.6,11.5,6.3,10.4z" />
                  </svg>
                </div>
                  </div>
                  <div className="flex justify-end items-center ">
                  <span className="bg-zinc-100 rounded-l-lg rounded-tr-lg max-w-[61%] w-full text-center text-blue-500">
                    {msg.button_text}
                  </span>
                  </div>
                  </>
                
                
                ):(
                  // Inbound Message (received from contact)
                <div className='flex justify-start'>
                <div className="flex items-end">
                  <svg height="13" width="8">
                    <path fill="white" d="M2.8,13L8,13L8,0.2C7.1,5.5,6.5,8.7,1.7,10.4C-1.6,11.5,1,13,2.8,13z" />
                  </svg>
                </div>
                <div className="bg-white p-4 max-w-[75%] rounded-r-lg rounded-tl-lg">
                {/* Media Content for received messages */}
                {msg.media_type === 'image' && msg.media_url ? (
                   <div className="mb-2 relative">
                   <img 
                      src={`http://127.0.0.1:8000/media/${msg.media_url}`}
                      crossOrigin="anonymous"
                      alt="Sent media"
                      className="max-w-full h-auto rounded-lg max-h-60 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.png';
                        // e.target.className += ' opacity-50 grayscale';
                      }}
                      loading="lazy"
                    />
                   {/* Optional: Add download button */}
                   {/* <a 
                     href={`http://127.0.0.1:8000/api/media/${msg.media_url}/`} 
                     download
                     className="absolute bottom-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                     title="Download image"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                     </svg>
                   </a> */}
                 </div>
               ) : null}

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
      {/* Chat Input */}
      <div className="sticky bottom-0 z-10 py-5">
        <form id="chat_message_form"  className="w-full flex" onSubmit={handleSubmit}>
          <input required
            value={formData.message_text}
            onChange={handleChange}
            type="text"
            name="message_text"
            placeholder="Add message ..."
            maxLength="150"
            className="flex-1 p-2 bg-zinc-100 text-black rounded-lg outline-none"
          />
          <input type="hidden" name='recipient' value={recipient}
            onChange={handleChange} />
          <button type="submit" className="ml-2 px-4 py-2 hover:cursor-pointer bg-blue-500 text-white rounded-lg">
            Send
          </button>
        </form>
      </div>
    </div>
      </div>
  )
};

export default ChatWindow;

