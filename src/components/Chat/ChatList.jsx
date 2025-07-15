import React, { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/solid';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { toast } from 'react-toastify';

const ChatList = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [socket, setSocket] = useState(null);
  const token = localStorage.getItem('authToken');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ next: null, previous: null, count: 0 });

 // WebSocket connection
  useEffect(() => {
    if (!token) return;

    const connectWebSocket = () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      const backendHost = API_BASE_URL.replace('http://', '').replace('https://', '');
      const wsUrl = `${wsProtocol}${backendHost}/ws/chatlist/?token=${token}`;

      const newSocket = new WebSocket(wsUrl);

      newSocket.onopen = () => {
        // console.log('ChatList WebSocket connected');
        setSocket(newSocket);
      };

      newSocket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'connection_success') {
   
          } else if (data.message?.action === 'refresh_chatlist') {
            fetchChatList(page); // Refresh chat list
          }
        } catch (error) {
          // console.error('Error parsing WebSocket message:', error);
        }
      };

      newSocket.onclose = (e) => {
        // console.log(`ChatList WebSocket disconnected: ${e.code} - ${e.reason}`);
        setTimeout(() => {
          // console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 3000);
      };

      newSocket.onerror = (error) => {
        // console.error('ChatList WebSocket error:', error);
      };

      return newSocket;
    };

    const ws = connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [token, page]);

  // Fetch chat list
  const fetchChatList = async (pageNum) => {
    // setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/chats/?page=${pageNum}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const chatData = response.data;
      // console.log(chatData)
      setConversations(chatData.results || []);
      setPagination({
        next: chatData.next,
        previous: chatData.previous,
        count: chatData.count,
      });
    } catch (error) {
      // console.error('Error fetching chat list:', error);
      // toast.error('Failed to fetch chat list');
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    if (token) {
      fetchChatList(page);
    }
  }, [page, token, searchQuery]);

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Search Bar */}
      <div className="p-2 md:p-4 bg-gray-50 flex items-center space-x-2 sticky top-0 z-10">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or mobile number"
            className="w-full p-2 md:p-2 pl-8 md:pl-10 bg-gray-200 rounded-md text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="absolute top-2.5 left-2 md:left-2.5 h-4 md:h-5 w-4 md:w-5 text-gray-500" />
        </div>
        <button className="p-2 md:p-2 bg-teal-100 text-teal-600 rounded-full hover:bg-teal-200">
          <Bars3Icon className="h-4 md:h-5 w-4 md:w-5" />
        </button>
      </div>

      {/* Chat List */}
      {loading ? (
        <p className="animate-pulse text-center py-4 md:py-6 text-lg md:text-2xl text-gray-600">
          Loading Chats...
        </p>
      ) : (
        <div className="flex-grow overflow-y-auto h-[70vh] md:h-[calc(100vh-100px)]">
          {conversations.length > 0 ? (
            <ul className="w-full">
              {conversations.map((conv) => (
                <li
                  key={conv.recipient}
                  className="cursor-pointer border-b border-gray-200 p-2 md:p-4 hover:bg-gray-50"
                  onClick={() => onSelectConversation(conv.recipient)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm md:text-base">{conv.user_name}</span>
                    <span className="text-xs md:text-sm text-gray-500">
                      {conv.last_message_at
                        ? new Date(conv.last_message_at).toLocaleTimeString()
                        : ""}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600">{conv.last_message_text}</p>
                  {conv.unread_count > 0 && (
                    <span className="inline-block bg-blue-500 text-white text-xs px-1 md:px-2 py-0.5 md:py-1 rounded-full">
                      {conv.unread_count} unread
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <h5 className="text-lg md:text-xl text-center font-medium text-gray-600 p-4">
              No chats yet!
            </h5>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between mt-2 md:mt-4 px-2 md:px-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={!pagination.previous}
          className="px-2 md:px-4 py-1 md:py-2 bg-gray-200 rounded text-sm md:text-base disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm md:text-base">
          Page {page} of {Math.ceil(pagination.count / 10)}
        </span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={!pagination.next}
          className="px-2 md:px-4 py-1 md:py-2 bg-gray-200 rounded text-sm md:text-base disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ChatList;