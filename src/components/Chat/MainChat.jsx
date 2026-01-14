// ═══════════════════════════════════════════════════════════════════════════════
// src/components/Chat/MainChat.jsx
// Main chat container - wraps everything with ChatProvider
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatProvider, useChatContext } from './context/ChatContext'; // 👈 IMPORT
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { assest } from '../../assets/assets';
import RequireSubscription from '../Subscriptions/RequireSubscription';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

// ─────────────────────────────────────────────────────────────────────────────
// INNER COMPONENT (uses context)
// ─────────────────────────────────────────────────────────────────────────────

const MainChatInner = () => {
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();
  const location = useLocation();

  // Get markAsRead from context for optimistic update
  const { markAsRead } = useChatContext();

  // Extract recipient from URL
  const queryParams = new URLSearchParams(location.search);
  const recipientFromUrl = queryParams.get('recipient');

  // State
  const [recipient, setRecipient] = useState(recipientFromUrl || null);
  const [isChatOpen, setIsChatOpen] = useState(!!recipientFromUrl);

  // Sync with URL
  useEffect(() => {
    setRecipient(recipientFromUrl);
    setIsChatOpen(!!recipientFromUrl);
  }, [recipientFromUrl]);

  // Mark as read when opening chat (local update only - no API call that triggers refresh)
  useEffect(() => {
    if (recipient && token) {
      // Local optimistic update - instant, no refresh, no list change
      markAsRead(recipient);
      
      // Server sync in background - silent, no WebSocket event expected
      // If your backend sends refresh_chatlist on mark-read, consider removing this
      // or updating backend to not send that event
      axios
        .get(`${API_BASE_URL}/api/chats/${recipient}/mark-read/`, {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        })
        .catch((error) => {
          console.error('Error marking messages as read:', error);
        });
    }
  }, [recipient, token, markAsRead]);

  // Handlers
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
          {/* ChatList - Hidden on mobile when chat is open */}
          <div
            className={`w-full md:w-1/2 bg-white border-r border-gray-200 flex flex-col ${
              isChatOpen ? 'hidden sm:hidden md:block' : 'block'
            }`}
          >
            <ChatList onSelectConversation={handleSelectConversation} />
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT (provides context)
// ─────────────────────────────────────────────────────────────────────────────

const MainChat = () => {
  return (
    <ChatProvider>
      <MainChatInner />
    </ChatProvider>
  );
};

export default MainChat;