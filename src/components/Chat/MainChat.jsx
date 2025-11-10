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

  // Extract recipient phone number from URL
  const queryParams = new URLSearchParams(location.search);
  const recipientFromUrl = queryParams.get('recipient');

  // State to manage chat selection and view
  const [recipient, setRecipient] = useState(recipientFromUrl || null);
  const [isChatOpen, setIsChatOpen] = useState(!!recipientFromUrl);

  // Sync recipient with URL changes
  useEffect(() => {
    setRecipient(recipientFromUrl);
    setIsChatOpen(!!recipientFromUrl);
  }, [recipientFromUrl]);

  // Mark messages as read when recipient changes
  useEffect(() => {
    if (recipient && token) {
      axios
        .get(`${API_BASE_URL}/api/chats/${recipient}/mark-read/`, {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        })
        .catch((error) => {
          console.error('Error marking messages as read:', error);
          alert(`Error: ${error.response?.data?.error || 'Something went wrong'}`);
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
  };

  return (
    <RequireSubscription>
      <div className="flex flex-col h-screen bg-gray-100">
        {/* {isChatOpen && (
          <div className="p-2 md:hidden bg-white border-b border-gray-200 sticky top-0 z-10 flex items-center">
            <button
              onClick={handleBack}
              className="mr-2 p-1 md:p-2 bg-gray-200 rounded-full hover:bg-gray-300"
            >
              <ArrowLeftIcon className="h-4 md:h-5 w-4 md:w-5 text-gray-600" />
            </button>
            <span className="text-sm md:text-base font-semibold">{recipient}</span>
          </div>
        )} */}

        <div className="flex flex-1 overflow-hidden">
          {/* ChatList - Hidden on mobile when isChatOpen, visible on md+ */}
          <div
            className={`w-full md:w-1/2 bg-white border-r border-gray-200 flex flex-col ${
              isChatOpen ? 'hidden sm:hidden md:block' : 'block'
            }`}
          >
            <ChatList onSelectConversation={handleSelectConversation} />
          </div>

          {/* ChatWindow - Full width on mobile when isChatOpen, 2/3 on md+ when not full-screen */}
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

export default MainChat;