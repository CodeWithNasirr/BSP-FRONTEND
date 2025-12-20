// ═══════════════════════════════════════════════════════════════════════════════
// contacts/ContactManagement.jsx
// Parent component that manages Contacts and Groups tabs
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback } from "react";
import Contacts from "./Contacts";
import Groups from "./Group";

/**
 * Contact Management Container
 * 
 * Handles:
 * - Tab switching between Contacts and Groups
 * - Shared state that needs to persist across tabs
 */
const ContactManagement = ({ initialTab = "contact" }) => {
  const token = localStorage.getItem("authToken");
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="md:h-screen flex flex-col w-full min-w-0">
      <div className="md:bg-inherit bg-white md:flex md:flex-grow capitalize">
        {activeTab === "contact" && (
          <Contacts
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            token={token}
          />
        )}

        {activeTab === "group" && (
          <Groups
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            token={token}
          />
        )}
      </div>
    </div>
  );
};

export default ContactManagement;