import React, { useState } from "react";
import Contacts from "./Contact";
import Groups from "./Group";

const ContactManagement = ({ initialTab = "contact" }) => {
  const token = localStorage.getItem("authToken");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isContSelected, setContAllSelected] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]); 

  return (
    <div className="md:h-screen flex flex-col w-full min-w-0">
      <div className="md:bg-inherit bg-white md:flex md:flex-grow capitalize">
        {activeTab === "contact" && (
          <Contacts
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            contacts={contacts}
            setContacts={setContacts}
            groups={groups}
            setGroups={setGroups} 
            isContSelected={isContSelected}
            setContAllSelected={setContAllSelected}
            selectedContacts={selectedContacts}
            setSelectedContacts={setSelectedContacts}
            token={token}
          />
        )}
        {activeTab === "group" && (
          <Groups
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            groups={groups}
            setGroups={setGroups}
            setSelectedContacts={setSelectedContacts}
            setContAllSelected={setContAllSelected}
            token={token}
          />
        )}
      </div>
    </div>
  );
};

export default ContactManagement;