import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/solid';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';
import MarkPurchaseModal from './MarkPurchaseModal';

const ChatList = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  const [showTags, setShowTags] = useState(false);
  const [socket, setSocket] = useState(null);
  const token = localStorage.getItem('authToken');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ next: null, previous: null, count: 0 });
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [purchaseForm, setPurchaseForm] = useState({ amount: '', location: '', tags: [], tagInput: '' });
  const pageRef = useRef(page);
 
  // Sync ref with state
  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  
  // Fetch available tags from ContactTagsView
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/contacts/tags/`, {
          headers: { Authorization: `Token ${token}` },
        });

        // Response example: response.data.tags = [{ tag: "VIP", count: 10 }, { tag: "New", count: 5 }]
        const tagsWithCounts = response.data.tags.map((t) => ({
          name: t.tag,
          count: t.count,
        }));

        setAvailableTags(tagsWithCounts);
      } catch (error) {
        toast.error('Failed to fetch tags');
      }
    };
    fetchTags();
  }, []);

  const handleOpenPurchaseModal = (contact) => {
    setSelectedContact(contact);
    setPurchaseForm({
      amount: '',
      location: '',
      tags: contact.tags || [],
      tagInput: '',
    });
    setShowPurchaseModal(true);
  };



  // Debounced fetchChatList
  const debouncedFetchChatList = useCallback(
    debounce((pageNum, query, tags) => {
      fetchChatList(pageNum, query, tags);
    }, 300),
    []
  );
  
  // Fetch chat list with tag filtering
  const fetchChatList = async (pageNum = 1, query = searchQuery, tags = selectedTags) => {
    // setLoading(true);
    try {
      const tagsQuery = tags.length > 0 ? `&tags=${encodeURIComponent(tags.join(','))}` : '';
      const response = await axios.get(
        `${API_BASE_URL}/api/chats/?page=${pageNum}&search=${encodeURIComponent(query)}${tagsQuery}`,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const chatData = response.data;
      setConversations(chatData.results || []);
      setPagination({
        next: chatData.next,
        previous: chatData.previous,
        count: chatData.count,
      });
    } catch (error) {
      toast.error('Failed to fetch chat list');
    } finally {
      setLoading(false);
    }
  };

  // WebSocket connection
useEffect(() => {
  if (!token) return;

  let reconnectTimeout;

  const connectWebSocket = () => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const backendHost = API_BASE_URL.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}${backendHost}/ws/chatlist/?token=${token}`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => setSocket(newSocket);

    newSocket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.message?.action === 'refresh_chatlist') {
          fetchChatList(pageRef.current, searchQuery, selectedTags);
        }
      } catch (error) {
        // console.error('Error parsing WebSocket message:', error);
      }
    };

    newSocket.onclose = () => {
      reconnectTimeout = setTimeout(connectWebSocket, 3000);
    };

    newSocket.onerror = (err) => {
      // console.error('ChatList WebSocket error:', err);
      newSocket.close();
    };

    return newSocket;
  };

  const ws = connectWebSocket();

  return () => {
    if (ws) ws.close();
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
  };
}, [token]);


  // Fetch chats on page, searchQuery, or selectedTags change
  useEffect(() => {
    if (token) {
      debouncedFetchChatList(page, searchQuery, selectedTags);
    }
  }, [page, searchQuery, selectedTags, token, debouncedFetchChatList]);

  // Reset to page 1 when search query or tags change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedTags]);

  // Handle tag selection
  const handleTagChange = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Search and Tag Filter */}
      <div className="p-2 md:p-4 bg-gray-50 flex flex-col space-y-2 sticky top-0 z-10">
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
        {showTags && (
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tagObj) => (
              <button
                key={tagObj.name}
                onClick={() => handleTagChange(tagObj.name)}
                className={`px-2 py-1 rounded-full text-sm ${
                  selectedTags.includes(tagObj.name)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tagObj.name} ({tagObj.count})
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setShowTags((prev) => !prev)}
          className="p-2 md:p-2 bg-teal-100 text-teal-600 rounded-full hover:bg-teal-200 self-end"
        >
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
                    <div>
                      <span className="font-semibold text-sm md:text-base">{conv.user_name || 'unknown'}</span>
                      <span className="ml-2 text-xs text-gray-500">({conv.tags?.length || 0} tags)</span>
                    </div>
                    <span className="text-xs md:text-sm text-gray-500">
                      {formatTimestamp(conv.last_message_at)}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 overflow-hidden">{conv.last_message_text}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {conv.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPurchaseModal(conv);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Mark Purchase
                    </button>
                    {conv.unread_count > 0 && (
                      <span className="inline-block bg-blue-500 text-white text-xs px-1 md:px-2 py-0.5 md:py-1 rounded-full">
                        {conv.unread_count} unread
                      </span>
                    )}
                  </div>
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
          disabled={!pagination.previous || page === 1}
          className="px-2 md:px-4 py-1 md:py-2 bg-gray-200 rounded text-sm md:text-base disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm md:text-base">
          Page {page} of {Math.max(1, Math.ceil(pagination.count / 10))}
        </span>
        <button
          onClick={() => {
            if (pagination.next) setPage((prev) => prev + 1);
          }}
          disabled={!pagination.next}
          className="px-2 md:px-4 py-1 md:py-2 bg-gray-200 rounded text-sm md:text-base disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Mark Purchase Modal */}
      <MarkPurchaseModal
          show={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setPurchaseForm({ amount: '', location: '', tags: [], tagInput: '' });
            setSelectedContact(null);
          }}
          contact={selectedContact}
          purchaseForm={purchaseForm}
          setPurchaseForm={setPurchaseForm}
          availableTags={availableTags}
          fetchChatList={() => fetchChatList(pageRef.current, searchQuery, selectedTags)}
          token={token}
          loading={loading}
          setLoading={setLoading}
        />
      {/* {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Mark Purchase for {selectedContact?.user_name || 'Contact'}
            </h2>
            <form onSubmit={handleMarkPurchase} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  value={selectedContact?.recipient || ''}
                  disabled
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={purchaseForm.location}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, location: e.target.value })}
                  placeholder="Purchase location"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="amount"
                  value={purchaseForm.amount}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, amount: e.target.value })}
                  placeholder="Enter Purchase Amount"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <div className="mt-1 flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md">
                  {purchaseForm.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removePurchaseTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={purchaseForm.tagInput}
                    onChange={handlePurchaseTagInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addPurchaseTag(purchaseForm.tagInput.trim());
                      }
                    }}
                    placeholder="Add tags (press Enter or comma)"
                    className="flex-1 border-none focus:outline-none focus:ring-0 text-sm"
                  />
                </div>
                {availableTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableTags
                      .filter((tagObj) => tagObj.name.toLowerCase().includes((purchaseForm.tagInput || '').toLowerCase()) && !purchaseForm.tags.includes(tagObj.name))
                      .slice(0, 10)
                      .map((tagObj) => (
                        <button
                          key={tagObj.name}
                          type="button"
                          onClick={() => addPurchaseTag(tagObj.name)}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                        >
                          {tagObj.name} ({tagObj.count})
                        </button>
                      ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setPurchaseForm({ amount: '', location: '', tags: [], tagInput: '' });
                    setSelectedContact(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Mark Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ChatList;