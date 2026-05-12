// ─────────────────────────────────────────────────────────────────────────────
// ContactManagement.jsx — Premium UI replacement
// src/components/Contact/ContactManagement.jsx
//
// Drop-in replacement — all hooks, API calls, and logic unchanged.
// Only the visual layer is upgraded.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from "react";
import Contacts from "./Contacts";
import Groups from "./Group";

const ContactManagement = ({ initialTab = "contact" }) => {
  const token = localStorage.getItem("authToken");
  const [activeTab, setActiveTab] = useState(initialTab);
  const handleTabChange = useCallback((tab) => setActiveTab(tab), []);

  return (
    <div className="flex flex-col w-full min-w-0 h-full overflow-hidden bg-gray-50 dark:bg-[#020617]">
      <div className="md:flex md:flex-grow capitalize">
        {activeTab === "contact" && (
          <Contacts activeTab={activeTab} setActiveTab={handleTabChange} token={token} />
        )}
        {activeTab === "group" && (
          <Groups activeTab={activeTab} setActiveTab={handleTabChange} token={token} />
        )}
      </div>
    </div>
  );
};

export default ContactManagement;