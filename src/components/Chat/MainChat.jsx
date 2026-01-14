// ═══════════════════════════════════════════════════════════════════════════════
// src/components/Chat/MainChat.jsx
// ⭐ SIMPLIFIED: Removed duplicate mark-as-read logic (handled by WebSocket now)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { assest } from '../../assets/assets';
import RequireSubscription from '../Subscriptions/RequireSubscription';

const MainChatInner = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const recipientFromUrl = queryParams.get('recipient');

  const [recipient, setRecipient] = useState(recipientFromUrl || null);
  const [isChatOpen, setIsChatOpen] = useState(!!recipientFromUrl);

  // Sync with URL
  useEffect(() => {
    setRecipient(recipientFromUrl);
    setIsChatOpen(!!recipientFromUrl);
  }, [recipientFromUrl]);

  // ⭐ REMOVED: No more duplicate mark-as-read API call here
  // Mark-as-read is now handled by:
  // 1. Optimistic update in ChatList when user clicks
  // 2. Backend sends WebSocket event to update all clients

  const handleSelectConversation = (recipientPhone) => {
    setRecipient(recipientPhone);
    setIsChatOpen(true);
    navigate(`/chats?recipient=${recipientPhone}`);
  };

  const handleBack = () => {
    setRecipient(null);
    setIsChatOpen(false);
    navigate('/chats');
  };

  return (
    <RequireSubscription>
      <div className="flex flex-col h-screen bg-gray-100">
        <div className="flex flex-1 overflow-hidden">
          <div
            className={`w-full md:w-1/2 bg-white border-r border-gray-200 flex flex-col ${
              isChatOpen ? 'hidden sm:hidden md:block' : 'block'
            }`}
          >
            <ChatList onSelectConversation={handleSelectConversation} />
          </div>

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
                <div className="flex flex-col h-full items-center justify-center">
                  <h4 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
                    Select a chat to continue!
                  </h4>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </RequireSubscription>
  );
};

const MainChat = () => {
  return (
    <ChatProvider>
      <MainChatInner />
    </ChatProvider>
  );
};

export default MainChat;