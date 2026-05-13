// ─────────────────────────────────────────────────────────────────────────────
// MainChat.jsx — Fixed: ChatList never remounts
// src/components/Chat/MainChat.jsx
//
// KEY FIXES vs original:
//   ✅ Removed chatListKey / setChatListKey — was forcing ChatList to remount
//      every time user returned to list, destroying all cached state.
//   ✅ ChatList is rendered ONCE and hidden/shown with CSS only.
//      State (conversations, scroll, filters, pages) persists in memory.
//   ✅ On mobile: ChatList gets CSS `hidden` when chat is open.
//      On desktop: always visible. Component never unmounts.
//   ✅ handleBack no longer changes key — simply updates URL + isChatOpen flag.
//   ✅ mark-read call preserved exactly.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { assest } from '../../assets/assets';
import RequireSubscription from '../Subscriptions/RequireSubscription';

const MainChat = () => {
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const recipientFromUrl = queryParams.get('recipient');

  const [recipient, setRecipient] = useState(recipientFromUrl || null);
  const [isChatOpen, setIsChatOpen] = useState(!!recipientFromUrl);

  // ── REMOVED: chatListKey / setChatListKey ──────────────────────────────────
  // The original code changed this key whenever the user returned to the list,
  // which forced React to fully unmount and remount <ChatList />.
  // That destroyed: scroll position, loaded pages, conversations array, filters.
  // Fix: never change the key. ChatList lives for the lifetime of MainChat.

  // Sync state when URL changes (e.g. browser back button)
  useEffect(() => {
    setRecipient(recipientFromUrl);
    setIsChatOpen(!!recipientFromUrl);
    // ── REMOVED: setChatListKey(prev => prev + 1) ──
    // We no longer remount ChatList when navigating back.
    // ChatList's own WebSocket and state handle any updates.
  }, [recipientFromUrl]);

  // Mark messages as read when a conversation is opened (unchanged)
  useEffect(() => {
    if (recipient && token) {
      axios
        .get(`${API_BASE_URL}/api/chats/${recipient}/mark-read/`, {
          headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
        })
        .catch((error) => console.error('Error marking messages as read:', error));
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
    // ── REMOVED: setChatListKey(prev => prev + 1) ──
    // ChatList will NOT remount. It will simply become visible again via CSS.
    // Its scroll position, conversations, and loaded pages are all intact.
  };

  return (
    <RequireSubscription>
      <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-100 dark:bg-gray-950">
        <div className="flex flex-1 overflow-hidden overflow-x-hidden min-w-0">

          {/*
            ── CHAT LIST PANEL ───────────────────────────────────────────────
            CRITICAL CHANGE: No `key` prop here.
            Previously: <ChatList key={chatListKey} ... />
            Now:        <ChatList ... />              ← stays mounted forever

            On mobile (< md):
              - isChatOpen=true  → `hidden` (not visible, but NOT unmounted)
              - isChatOpen=false → `flex`   (visible)
            On desktop (≥ md): always `flex` regardless of isChatOpen.

            The `hidden` class sets display:none. The browser preserves the DOM
            node's scrollTop, and React preserves the component's state tree.
            When the user navigates back, the element becomes visible again with
            all state exactly as they left it — identical to WhatsApp Web.
          */}
          <div
            className={`
              bg-white dark:bg-gray-900
              border-r border-gray-200 dark:border-gray-800
              flex-col overflow-hidden flex-shrink-0
              w-full min-w-0
              md:w-[320px] lg:w-[360px] xl:w-[400px]
              ${isChatOpen ? 'hidden md:flex' : 'flex'}
            `}
          >
          
            {/* No key prop — ChatList mounts once and stays mounted */}
            <ChatList onSelectConversation={handleSelectConversation} />
          </div>

          {/*
            ── CHAT WINDOW PANEL ─────────────────────────────────────────────
            ChatWindow uses `key={recipient}` which is intentional:
            we WANT it to remount when switching between different recipients
            (to reset its local message state).
            But this has no effect on ChatList.
          */}
          <div
            className={`
              flex flex-col min-w-0 bg-cover bg-center
              ${isChatOpen ? 'w-full flex-1' : 'hidden md:flex flex-1'}
            `}
            style={{ backgroundImage: `url(${assest.whatsapp_bg})` }}
          >
            {recipient ? (
              // key={recipient} is correct here — resets ChatWindow per contact
              <ChatWindow key={recipient} recipient={recipient} />
            ) : (
              // Desktop empty state (only shown when no chat is selected on desktop)
              <div className="flex flex-col h-full items-center justify-center p-4">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-16 h-16 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Welcome to Chats
                </h4>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md text-sm">
                  Select a conversation from the list to start messaging
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </RequireSubscription>
  );
};

export default MainChat;