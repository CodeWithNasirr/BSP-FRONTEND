import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { assest } from '../../assets/assets';
import RequireSubscription from '../Subscriptions/RequireSubscription';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FIXED MAINCHAT - Proper handling of visibility and navigation
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * KEY FIXES:
 * ✅ Notify ChatList when user navigates back (trigger refresh)
 * ✅ Proper handling of mark-as-read
 * ✅ Maintain cache when switching between views
 */

const MainChat = () => {
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const recipientFromUrl = queryParams.get('recipient');

  const [recipient, setRecipient] = useState(recipientFromUrl || null);
  const [isChatOpen, setIsChatOpen] = useState(!!recipientFromUrl);
  
  // ✅ NEW: Track when user returns to chatlist
  const [chatListKey, setChatListKey] = useState(0);

  // Sync recipient with URL changes
  useEffect(() => {
    setRecipient(recipientFromUrl);
    setIsChatOpen(!!recipientFromUrl);
    
    // ✅ FIX: Increment key when returning to chatlist to trigger refresh check
    if (!recipientFromUrl) {
      setChatListKey(prev => prev + 1);
    }
  }, [recipientFromUrl]);

  // Mark messages as read when opening a chat
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
          console.log(`✅ Marked messages as read for ${recipient}`);
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
    
    // ✅ FIX: Increment key to signal ChatList to check for updates
    setChatListKey(prev => prev + 1);
  };

  return (
    <RequireSubscription>
      <div className="flex flex-col h-screen bg-gray-100">
        {/* Mobile back button */}
        {isChatOpen && (
          <div className="p-2 md:hidden bg-white border-b border-gray-200 sticky top-0 z-10 flex items-center">
            <button
              onClick={handleBack}
              className="mr-2 p-1 md:p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            >
              <ArrowLeftIcon className="h-4 md:h-5 w-4 md:w-5 text-gray-600" />
            </button>
            <span className="text-sm md:text-base font-semibold truncate">{recipient}</span>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* ChatList - ✅ Key prop forces refresh check on navigation */}
          <div
            className={`w-full md:w-1/2 bg-white border-r border-gray-200 flex flex-col ${
              isChatOpen ? 'hidden sm:hidden md:block' : 'block'
            }`}
          >
            <ChatList 
              key={chatListKey} 
              onSelectConversation={handleSelectConversation} 
            />
          </div>

          {/* ChatWindow */}
          <div
            className={`flex-1 flex flex-col bg-cover bg-center ${
              isChatOpen ? 'w-full block' : 'hidden md:block md:w-1/2'
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