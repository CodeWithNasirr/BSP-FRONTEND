import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import axios from "axios";
import API_BASE_URL from "../../config";
const MainChat = () => {
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const location = useLocation();

  // Extract conversationId from the URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const conversationId = queryParams.get("conversationId");

  useEffect(() => { 
    if (conversationId) {
      axios.get(`${API_BASE_URL}/api/mark_messages_as_read/${conversationId}/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }).catch((error) => {
        alert(`Error: ${error.response?.data?.error || "Something went wrong"}`);
      });
    }
  }, [conversationId]);

  // Function to update query params instead of route path
  const handleSelectConversation = (conversationId) => {
    navigate(`/chats?conversationId=${conversationId}`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left: Chat List */}
      <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
        <ChatList onSelectConversation={handleSelectConversation} />
      </div>

      {/* Right: Chat Window */}
      <div className="flex-1 flex flex-col bg-cover bg-center" style={{ backgroundImage: `url('${API_BASE_URL}/media/FILES/whatsapp-bg-02.png')` }}>
        {conversationId ? (
          <ChatWindow conversationId={conversationId} />
        ) : (
          <div className="flex flex-col h-full items-center justify-center">
            <h4 className="text-xl font-semibold text-gray-700 mb-4">
              Select a chat to continue!
            </h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainChat;
