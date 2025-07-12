
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import axios from "axios";
import API_BASE_URL from "../../config";
import { assest } from "../../assets/assets";
import RequireSubscription from "../Subscriptions/RequireSubscription";

const MainChat = () => {
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const location = useLocation();

  // 🟡 Extract recipient phone number from URL (replaces conversationId)
  const queryParams = new URLSearchParams(location.search);
  const recipient = queryParams.get("recipient");

  useEffect(() => {
    if (recipient) {
      axios 
        .get(`${API_BASE_URL}/api/chats/${recipient}/mark-read/`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        })
        .catch((error) => {
          alert(
            `Error: ${error.response?.data?.error || "Something went wrong"}`
          );
        });
    }
  }, [recipient]);

  const handleSelectConversation = (recipientPhone) => {
    navigate(`/chats?recipient=${recipientPhone}`);
  };

  return (
    <RequireSubscription>
    <div className="flex h-screen bg-gray-100">
      {/* Left Pane: Chat List */}
      <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
        <ChatList onSelectConversation={handleSelectConversation} />
      </div>

      {/* Right Pane: Chat Window */}
      <div
        className="flex-1 flex flex-col bg-cover bg-center"
        style={{
          backgroundImage:`url(${assest.whatsapp_bg})`,
        }}
      >
        {recipient ? (
          <ChatWindow recipient={recipient} />
        ) : (
          <div className="flex flex-col h-full items-center justify-center">
            <h4 className="text-xl font-semibold text-gray-700 mb-4">
              Select a chat to continue!
            </h4>
          </div>
        )}
      </div>
    </div>
    </RequireSubscription>
  );
}; 

export default MainChat;
