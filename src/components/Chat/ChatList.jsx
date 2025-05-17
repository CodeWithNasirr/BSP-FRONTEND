import React, { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/solid';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { toast } from 'react-toastify';

const ChatList = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const token = localStorage.getItem("authToken");
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ next: null, previous: null, count: 0 });

  const fetchChatList = async (pageNum) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/get_chatList/?page=${pageNum}`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const chatData = response.data;
      setConversations(chatData.results || []);
      setPagination({
        next: chatData.next,
        previous: chatData.previous,
        count: chatData.count,
      });
    } catch (error) {
      console.error("Error fetching chat list:", error);
      toast.error("Failed to fetch chat list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatList(page);
  }, [page, token]); // Refetch when page or token changes

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

      {/* Chat List */}
      {loading ? (
        <p className="animate-pulse text-center py-30 text-2xl text-gray-600">
          Loading Chats...
        </p>
      ) : (
        <div className="flex-grow items-center justify-center overflow-y-auto h-[100vh]">
          {conversations.length > 0 ? (
            <ul className="w-full">
              {conversations.map((conv) => (
                <li
                  key={conv.recipient}
                  className="cursor-pointer border-b border-gray-200 p-4 hover:bg-gray-50"
                  onClick={() => onSelectConversation(conv.recipient)}
                >
                  <div className="flex justify-between">
                    <span className="font-semibold">{conv.user_name}</span>
                    <span className="text-xs text-gray-500">
                      {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString() : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{conv.last_message_text}</p>
                  {conv.unread_count > 0 && (
                    <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {conv.unread_count} unread
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <h5 className="text-lg text-center font-medium text-gray-600">No chats yet!</h5>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4 px-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={!pagination.previous}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {Math.ceil(pagination.count / 10)} {/* Adjust based on page size */}
        </span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={!pagination.next}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ChatList;