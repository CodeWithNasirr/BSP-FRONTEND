import React, { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/solid';
import axios from 'axios';
import API_BASE_URL from '../../config';
const ChatList = ({ onSelectConversation }) => {

  const [conversations, setConversations] = useState([]);
  const token = localStorage.getItem("authToken");
  const [loading, setLoading] = useState(false);

  const updateLocalStorageUserInfo = (key, value) => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (!storedUserInfo) return;

    const parsed = JSON.parse(storedUserInfo);
    parsed[key] = value;
    localStorage.setItem("userInfo", JSON.stringify(parsed));
  };

  useEffect(() => {
    // ⏱️ Load campaigns instantly from localStorage if available
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      const parsed = JSON.parse(storedUserInfo);
      if (parsed.chat_list) {
        console.log("chat_list called...")
        setConversations(parsed.chat_list);
      }
    }
    // 🔄 Fetch fresh data in background
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/get_chatList/`, {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setConversations(response.data.Data);
        updateLocalStorageUserInfo("chat_list", response.data.Data);

      } catch (error) {
        console.error("Error fetching campaigns:", error);
        toast.error("Failed to fetch campaigns");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);



  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Search Bar */}
      <div className="p-4 bg-gray-50 flex items-center space-x-2 sticky top-0 z-10">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search name or mobile number"
            className="w-full p-2 pl-10 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="absolute top-2.5 left-2 h-5 w-5 text-gray-500" />
        </div>
        <button className="p-2 bg-teal-100 text-teal-600 rounded-full hover:bg-teal-200">
          <Bars3Icon className="h-5 w-5" />
        </button>
      </div>

      {/* Chat List (Empty State) */}
      {loading ? (
        <p className="animate-pulse text-center py-30 text-2xl text-gray-600">
          Loading Chats...
        </p>
      ) : (<div className="flex items-center justify-center">
        {conversations.length > 0 ? (
          <ul className='w-full'>
            {conversations.map(conv => (
              <li
                key={conv.id}
                className="cursor-pointer border-b border-gray-200 p-4 hover:bg-gray-50"
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="flex justify-between">
                  <span className="font-semibold">{conv.user_name}</span>
                  <span className="text-xs text-gray-500">
                    {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString() : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{conv.last_message}</p>
                {conv.unread_count > 0 && (
                  <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {conv.unread_count} unread
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : <h5 className="text-lg text-center font-medium text-gray-600">No chats yet!</h5>
        }
      </div>)
      }


      {/* Pagination/Loading */}
      {/* <div className="p-4 text-sm text-gray-500 flex items-center">
        <p>0 - 0 of</p>
        <div className="ml-2 w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div> */}
    </div>
  );
};

export default ChatList;