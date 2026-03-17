import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { assest } from '../../assets/assets';
import RequireSubscription from '../Subscriptions/RequireSubscription';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const MainChat = () => {
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const recipientFromUrl = queryParams.get('recipient');

  const [recipient, setRecipient] = useState(recipientFromUrl || null);
  const [isChatOpen, setIsChatOpen] = useState(!!recipientFromUrl);
  const [chatListKey, setChatListKey] = useState(0);

  useEffect(() => {
    setRecipient(recipientFromUrl);
    setIsChatOpen(!!recipientFromUrl);
    if (!recipientFromUrl) {
      setChatListKey(prev => prev + 1);
    }
  }, [recipientFromUrl]);

  useEffect(() => {
    if (recipient && token) {
      axios
        .get(`${API_BASE_URL}/api/chats/${recipient}/mark-read/`, {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        })
        .then(() => {
          // console.log(`✅ Marked messages as read for ${recipient}`);
        })
        .catch((error) => {
          console.error('Error marking messages as read:', error);
        });
    }
  }, [recipient, token]);

  const handleSelectConversation = (recipientPhone) => {
    setRecipient(recipientPhone);
    setIsChatOpen(true);
    navigate(`/chats?recipient=${recipientPhone}`);
  };

  const handleBack = () => {
    setRecipient(null);
    setIsChatOpen(false);
    navigate('/chats');
    setChatListKey(prev => prev + 1);
  };

  return (
    <RequireSubscription>
      <div className="flex flex-col h-screen bg-gray-100">
        <div className="flex flex-1 overflow-hidden">
          {/* 
            ChatList panel:
            - Mobile: full width when no chat open, hidden when chat open
            - md (768px+): fixed 320px width, always visible
            - lg (1024px+): fixed 360px width
            - xl (1280px+): fixed 400px width
          */}
          <div
            className={`bg-white border-r border-gray-200 flex flex-col overflow-hidden
              ${isChatOpen 
                ? 'hidden md:flex md:w-[320px] lg:w-[360px] xl:w-[400px]' 
                : 'w-full md:w-[320px] lg:w-[360px] xl:w-[400px]'
              }
              flex-shrink-0`}
          >
            <ChatList 
              key={chatListKey} 
              onSelectConversation={handleSelectConversation} 
            />
          </div>

          {/* 
            ChatWindow panel:
            - Mobile: full width when chat open, hidden when no chat
            - md+: takes remaining space with min-w-0 to prevent overflow
          */}
          <div
            className={`flex flex-col min-w-0 bg-cover bg-center
              ${isChatOpen 
                ? 'w-full flex-1' 
                : 'hidden md:flex flex-1'
              }`}
            style={{ backgroundImage: `url(${assest.whatsapp_bg})` }}
          >
            {recipient ? (
              <ChatWindow key={recipient} recipient={recipient} />
            ) : (
              !isChatOpen && (
                <div className="flex flex-col h-full items-center justify-center p-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-6">
                    <svg 
                      className="w-16 h-16 text-emerald-600" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                    Welcome to Chats
                  </h4>
                  <p className="text-gray-500 text-center max-w-md">
                    Select a conversation from the list to start messaging
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </RequireSubscription>
  );
};

export default MainChat;