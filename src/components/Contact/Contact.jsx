import axios from "axios";
import React, { useState, useEffect } from "react";
import API_BASE_URL from "../../config";
import { toast } from 'react-toastify';
import { Link } from "react-router-dom";
import DownloadCSVTemplate from "./Sample_csv";
import ExportContactsButton from "./Export_Contact";
import debounce from "lodash/debounce";

const Contacts = ({
  activeTab,
  setActiveTab,
  contacts,
  setContacts,
  groups,
  setGroups,
  isContSelected,
  setContAllSelected,
  selectedContacts,
  setSelectedContacts,
  token,
}) => {
  const [loading, setLoading] = useState(false);
  const [c_page, setC_Page] = useState(1);
  const [c_pagination, setC_Pagination] = useState({ next: null, previous: null, count: 0 });
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone_number: '',
    email: '',
    group_name: '',
    location: '',
    tags: '',
    total_purchases: 0,
    total_spent:0,
  });
  const [activeDropdownId, setActiveDropdownId] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [segments, setSegments] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const updateLocalStorageUserInfo = (key, value) => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (!storedUserInfo) return;
    const parsed = JSON.parse(storedUserInfo);
    parsed[key] = value;
    localStorage.setItem("userInfo", JSON.stringify(parsed));
  };
  // console.log(groups)
  const fetchContactsAndGroups = debounce(async (pageNum, search = '', segmentId = '') => {
    try {
      const [contactsRes, groupsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/contacts/?page=${pageNum}&search=${encodeURIComponent(search)}&segment=${segmentId}&group=${selectedGroup}`, {
          headers: { Authorization: `Token ${token}` },
        }),
        axios.get(`${API_BASE_URL}/api/add-group/`, { headers: { Authorization: `Token ${token}` } }),
      ]);

      setContacts(contactsRes.data.results || []);
      setC_Pagination({
        next: contactsRes.data.next,
        previous: contactsRes.data.previous,
        count: contactsRes.data.count,
      });
      setGroups(groupsRes.data.data);
      updateLocalStorageUserInfo("contacts", contactsRes.data.results);
    } catch (error) {
      toast.error("Failed to fetch contacts or groups");
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      const parsed = JSON.parse(storedUserInfo);
      if (parsed.contacts) setContacts(parsed.contacts);
    }

    fetchContactsAndGroups(c_page, searchQuery, selectedSegment,selectedGroup);
  }, [c_page, searchQuery, selectedSegment,selectedGroup, token]);

  useEffect(() => {
    async function fetchSegments() {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/segments/`, { headers: { Authorization: `Token ${token}` } });
        setSegments(res.data.data || []);
      } catch (err) {
        toast.error('Failed to fetch segments');
      }
    }
    fetchSegments();
  }, [token]);

  const deleteContact = async (contact_id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/delete-contact/`, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
        data: { contact_id },
      });
      toast.success(response.data.message);
      const contactsRes = await axios.get(`${API_BASE_URL}/api/contacts/?page=${c_page}&search=${encodeURIComponent(searchQuery)}&segment=${selectedSegment}&group=${selectedGroup}`, {
        headers: { Authorization: `Token ${token}` },
      });
      setContacts(contactsRes.data.results || []);
      setSelectedContacts([]);
      setActiveDropdownId(false);
      setContAllSelected(false);
      updateLocalStorageUserInfo("contacts", contactsRes.data.results);
      setSelectedContact(null);
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
    }
  };

  const removeContactFromGroup = async (contact_id, group_id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/remove-contact-from-group/`, { contact_id, group_id }, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      });
      toast.success(response.data.Message);
      const contactsRes = await axios.get(`${API_BASE_URL}/api/contacts/?page=${c_page}&search=${encodeURIComponent(searchQuery)}&segment=${selectedSegment}&group=${selectedGroup}`, {
        headers: { Authorization: `Token ${token}` },
      });
      setContacts(contactsRes.data.results || []);
      updateLocalStorageUserInfo("contacts", contactsRes.data.results);
      setSelectedContact((prev) => {
        if (prev && prev.id === contact_id) return { ...prev, Group: [] };
        return prev;
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to remove contact from group");
    }
  };

  const addContactToGroup = async (contact_id, group_id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/add-contact-to-group/`, { contact_id, group_id }, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      });
      toast.success(response.data.Message);
      const contactsRes = await axios.get(`${API_BASE_URL}/api/contacts/?page=${c_page}&search=${encodeURIComponent(searchQuery)}&segment=${selectedSegment}&group=${selectedGroup}`, {
        headers: { Authorization: `Token ${token}` },
      });
      setContacts(contactsRes.data.results || []);
      updateLocalStorageUserInfo("contacts", contactsRes.data.results);
      setSelectedContact((prev) => {
        if (prev && prev.id === contact_id) {
          const group = groups.find((g) => g.id === group_id);
          return { ...prev, Group: [{ group_name: group.group_name, id: group.id }] };
        }
        return prev;
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add contact to group");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const requestData = {
      full_name: fullName,
      phone_number: formData.phone_number,
      email: formData.email,
      group_name: formData.group_name,
      location: formData.location,
      tags: formData.tags,
      total_purchases: formData.total_purchases,
      total_spent : formData.total_spent,
    };
    const filteredData = Object.fromEntries(
      Object.entries(requestData).filter(([_, value]) => typeof value === "string" ? value.trim() !== "" : value != null)
    );

    try {
      const response = await axios.post(`${API_BASE_URL}/api/contacts/`, filteredData, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      });
      toast.success(response.data.Message);
      setContacts((prev) => {
        const updated = [...prev, response.data.data];
        updateLocalStorageUserInfo("contacts", updated);
        return updated;
      });
      setFormData({
        firstName: '',
        lastName: '',
        phone_number: '',
        email: '',
        group_name: '',
        location: '',
        tags: '',
        total_purchases: 0,
        total_spent :0,
      });
      setShowAddContactForm(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong");
      setFormData({
        firstName: '',
        lastName: '',
        phone_number: '',
        email: '',
        group_name: '',
        location: '',
        tags: '',
        total_purchases: 0,
        total_spent : 0,
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const requestData = {
      full_name: fullName,
      phone_number: formData.phone_number,
      email: formData.email,
      group_name: formData.group_name,
      location: formData.location,
      tags: formData.tags,
      total_purchases: formData.total_purchases,
      total_spent : formData.total_spent,
    };
    const filteredData = Object.fromEntries(
      Object.entries(requestData).filter(([_, value]) => typeof value === "string" ? value.trim() !== "" : value != null)
    );

    try {
      const response = await axios.put(`${API_BASE_URL}/api/contacts/${selectedContact.id}/`, filteredData, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      });
      toast.success(response.data.Message);
      const contactsRes = await axios.get(`${API_BASE_URL}/api/contacts/?page=${c_page}&search=${encodeURIComponent(searchQuery)}&segment=${selectedSegment}&group=${selectedGroup}`, {
        headers: { Authorization: `Token ${token}` },
      });
      setContacts(contactsRes.data.results || []);
      updateLocalStorageUserInfo("contacts", contactsRes.data.results);
      setFormData({
        firstName: '',
        lastName: '',
        phone_number: '',
        email: '',
        group_name: '',
        location: '',
        tags: '',
        total_purchases: 0,
        total_spent:0,
      });
      setSelectedContact(null);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update contact");
    }
  };

  const handleSelectAll = () => {
    setContAllSelected(!isContSelected);
    setSelectedContacts(isContSelected ? [] : contacts.map((contact) => contact.id));
  };

  const handleSelectContact = (id) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((contactId) => contactId !== id) : [...prev, id]
    );
  };

  const toggleDropdown = (dropdownId) => {
    setActiveDropdownId(activeDropdownId === dropdownId ? null : dropdownId);
  };

  const viewContact = (contact) => {
    setSelectedContact(contact);
    setFormData({
      firstName: contact.full_name.split(' ')[0] || '',
      lastName: contact.full_name.split(' ').slice(1).join(' ') || '',
      phone_number: contact.phone_number || '',
      email: contact.email || '',
      group_name: contact.Group[0]?.group_name || '',
      location: contact.location || '',
      tags: contact.tags?.join(', ') || '',
      total_purchases: contact.total_purchases || 0,
      total_spent: contact.total_spent || 0,
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setC_Page(1);
  };

  return (
    <div className="max-h-screen md:h-screen flex flex-col w-full min-w-0">
      <div className="md:bg-inherit bg-white md:flex md:flex-grow capitalize">
        <div className="md:w-[30%] flex flex-col max-h-full bg-white border-r border-slate-200">
  {/* HEADER */}
  <div className="px-4 pt-4 flex justify-between items-center">
    <div className="flex space-x-1 text-xl items-center">
      <h2 className="font-semibold">Contacts</h2>
      <span className="text-slate-500">({contacts.length})</span>
    </div>
    <button
      title="Add Contact"
      onClick={() => {
        setShowAddContactForm(true);
        setSelectedContact(null);
        setFormData({
          firstName: '',
          lastName: '',
          phone_number: '',
          email: '',
          group_name: '',
          location: '',
          tags: '',
          total_purchases: 0,
          total_spent: 0,
        });
      }}
      className="text-blue-600 hover:bg-blue-50 p-2 rounded-full"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
        <g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
          <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12Zm10-8a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z"></path>
          <path d="M13 7a1 1 0 1 0-2 0v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7Z"></path>
        </g>
      </svg>
    </button>
  </div>

  {/* SEARCH BAR */}
  <div className="px-4 pb-2 mt-4 flex items-center border border-gray-200 rounded-md">
    <span className="pl-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="m15 15l6 6m-11-4a7 7 0 1 1 0-14a7 7 0 0 1 0 14Z"
        ></path>
      </svg>
    </span>
    <input
      type="text"
      value={searchQuery}
      onChange={handleSearchChange}
      placeholder="Search by name, phone, or email"
      className="w-full py-2 px-2 text-sm outline-none rounded-md"
    />
    <button
      onClick={() => setShowFilters(!showFilters)}
      className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
      title="Toggle Filters"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"></polygon>
      </svg>
    </button>
  </div>

  {/* FILTERS */}
  {showFilters && (
    <div className="px-4 pb-4 space-y-4 border-b border-gray-200">
      <div>
        <label className="block text-sm text-gray-700 mb-1">Filter by Segment</label>
        <select
          value={selectedSegment}
          onChange={(e) => { setSelectedSegment(e.target.value); setC_Page(1); }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          {segments.map((seg) => (
            <option key={seg.segment_id} value={seg.segment_id}>{seg.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Filter by Group</label>
        <select
          value={selectedGroup}
          onChange={(e) => { setSelectedGroup(e.target.value); setC_Page(1); }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>{group.group_name}</option>
          ))}
        </select>
      </div>
    </div>
  )}

  {/* BULK ACTIONS */}
  <div className="flex justify-between px-4 py-2 border-b border-gray-200">
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={isContSelected}
        onChange={handleSelectAll}
        className="w-4 h-4 border border-gray-400 rounded-md"
      />
      <span className="text-sm">Select all ({selectedContacts.length})</span>
    </label>

    {/* Dropdown */}
    <div className="relative">
      <button
        className="p-2 hover:bg-gray-100 rounded-full"
        onClick={() => toggleDropdown(!activeDropdownId)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
          <path fill="currentColor"
            d="M12 16a2 2 0 0 1 2 0a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2Z">
          </path>
        </svg>
      </button>
      {activeDropdownId && (
        <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-md z-20">
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-600 hover:text-white rounded-t-md"
            onClick={() => {
              if (selectedContacts.length === 1) {
                const contact = contacts.find((c) => c.id === selectedContacts[0]);
                viewContact(contact);
              }
            }}
          >
            Edit
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-red-600 hover:text-white rounded-b-md"
            onClick={() => deleteContact(selectedContacts)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  </div>

  {/* TABS */}
  <div className="flex justify-between text-sm border-b border-gray-200">
    <button
      onClick={() => setActiveTab("contact")}
      className={`w-1/2 py-3 text-center ${activeTab === "contact" ? "bg-slate-50 border-b-2 border-slate-700" : ""}`}
    >
      All Contacts
    </button>
    <button
      onClick={() => {
        setActiveTab("group");
        setSelectedContacts([]);
        setContAllSelected(false);
      }}
      className={`w-1/2 py-3 text-center ${activeTab === "group" ? "bg-slate-50 border-b-2 border-slate-700" : ""}`}
    >
      Groups
    </button>
  </div>

          {loading ? (
            <div className="text-center my-30 animate-pulse">Loading contacts...</div>
          ) : (
            <>
              <div className="flex-grow overflow-y-auto h-[45vh]">
                {contacts.map((contact, index) => (
                  <div
                    key={index}
                    className="flex space-x-2 hover:bg-gray-50 cursor-pointer items-center px-4 py-3 border-b border-slate-200"
                    onClick={() => viewContact(contact)}
                  >
                    <div className="flex items-center justify-center mt-1">
                      <label htmlFor={`contact_${contact.id}`} className="cursor-pointer">
                        <input
                          type="checkbox"
                          id={`contact_${contact.id}`}
                          checked={selectedContacts.includes(contact.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectContact(contact.id);
                          }}
                          className="w-4 h-4 rounded-full"
                        />
                      </label>
                    </div>
                    <div className="w-[15%]">
                      <div className="rounded-full bg-blue-600/10 text-blue-600 flex justify-center items-center h-12 w-12">
                        {contact.initial_name}
                      </div>
                    </div>
                    <div className="w-[75%]">
                      <h3>{contact.full_name}</h3>
                      <p className="text-slate-500 text-xs truncate">{contact.phone_number}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 px-4">
                <button
                  onClick={() => setC_Page((prev) => Math.max(prev - 1, 1))}
                  disabled={!c_pagination.previous}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>Page {c_page} of {Math.ceil(c_pagination.count / 10)}</span>
                <button
                  onClick={() => setC_Page((prev) => prev + 1)}
                  disabled={!c_pagination.next}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {!showAddContactForm && !selectedContact && (
          <div className="md:w-[70%] bg-zinc-100 md:h-[100vh] md:overflow-y-hidden flex justify-center items-center">
            <div className="border border-slate-200 pt-20 py-10 w-[30em] rounded-xl bg-white">
              <h2 className="text-center text-2xl text-slate-500 mb-6">Select Contact</h2>
              <div className="flex justify-center">
                <div className="border-r border-slate-500 h-10"></div>
              </div>
              <h2 className="text-center text-slate-600">OR</h2>
              <div className="flex justify-center">
                <div className="border-r border-slate-500 h-10"></div>
              </div>
              <div className="grid grid-cols-2 gap-5 text-center px-10">
                <Link
                  className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowAddContactForm(!showAddContactForm);
                    setFormData({
                      firstName: '',
                      lastName: '',
                      phone_number: '',
                      email: '',
                      group_name: '',
                      location: '',
                      tags: '',
                      total_purchases: 0,
                      total_spent: 0,
                      
                    });
                  }}
                >
                  Add Contact
                </Link>
                <Link
                  className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm"
                  to="/bulk-upload"
                >
                  Bulk Upload
                </Link>
                <DownloadCSVTemplate />
                <ExportContactsButton />
              </div>
            </div>
          </div>
        )}

        {showAddContactForm && (
          <div className="w-full md:w-[70%] bg-zinc-100 h-auto md:h-[100vh] overflow-y-auto md:overflow-y-hidden">
            <div>
              <div className="hidden md:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-10">
                <h1 className="text-xl">Add Contact</h1>
                <a
                  className="inline-flex justify-center rounded-md border border-transparent bg-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 mr-4"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowAddContactForm(!showAddContactForm);
                  }}
                >
                  Cancel
                </a>
              </div>

              <div className="flex justify-center md:h-[90vh] md:overflow-y-scroll p-4">
                <form className="w-full max-w-[30em]" onSubmit={handleSubmit}>
                  <div className="flex flex-col sm:flex-row justify-center items-center sm:space-x-4">
                    <div className="rounded-full w-32 h-32 sm:w-40 sm:h-40 m-4">
                      <svg
                        className="text-gray-500 w-full h-full"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <a title="This Feature is not Unlocked....">
                      <label
                        htmlFor="file-upload"
                        className="cursor-not-allowed inline-flex justify-center rounded-md border border-transparent bg-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 mt-2 sm:mt-0"
                      >
                        Upload Image
                      </label>
                    </a>
                  </div>

                  <div className="grid gap-x-6 gap-y-4 sm:grid-cols-6 pb-6 border-b border-slate-200">
                    <div className="sm:col-span-3">
                      <label htmlFor="firstName" className="block text-sm leading-6 text-gray-900">
                        First Name
                      </label>
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="text"
                        required
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="lastName" className="block text-sm leading-6 text-gray-900">
                        Last Name
                      </label>
                      <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="text"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="phone_number" className="block text-sm leading-6 text-gray-900">
                        Phone
                      </label>
                      <input
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="text"
                        required
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="email" className="block text-sm leading-6 text-gray-900">
                        Email
                      </label>
                      <input
                        name="email"
                        value={formData.email}
                        placeholder="Optional"
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="text"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="location" className="block text-sm leading-6 text-gray-900">
                        Location
                      </label>
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="text"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="tags" className="block text-sm leading-6 text-gray-900">
                        Tags (comma separated)
                      </label>
                      <input
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="text"
                        placeholder="VIP, Customer"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="total_purchases" className="block text-sm leading-6 text-gray-900">
                        Total Purchases
                      </label>
                      <input
                        name="total_purchases"
                        value={formData.total_purchases}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="number"
                        min="0"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="total_spent" className="block text-sm leading-6 text-gray-900">
                        Total Spent (₹)
                      </label>
                      <input
                        name="total_spent"
                        value={formData.total_spent}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <label htmlFor="group_name" className="block text-sm leading-6 text-gray-900">
                        Group
                      </label>
                      <select
                        name="group_name"
                        value={formData.group_name}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                      >
                        <option value="">Select option</option>
                        {groups.map((group, index) => (
                          <option key={index}>{group.group_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 mb-10 pb-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <a
                      className="rounded-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer px-5 py-2 text-white text-sm font-semibold flex items-center justify-center"
                      href="#"
                      onClick={(e) => { 
                        e.preventDefault();
                        setShowAddContactForm(!showAddContactForm);
                      }}
                    >
                      Cancel
                    </a>
                    <button
                      type="submit"
                      className="rounded-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer px-5 py-2 text-white text-sm font-semibold flex items-center justify-center"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {selectedContact && (
          <div className="w-full md:w-[70%] bg-zinc-100 h-auto md:h-[100vh] overflow-y-auto md:overflow-y-hidden">
            <div>
              <div className="hidden md:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-10">
                <h1 className="text-xl">Edit Contact</h1>
                <a
                  className="inline-flex justify-center rounded-md border border-transparent bg-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 mr-4"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedContact(null);
                  }}
                >
                  Cancel
                </a>
              </div>

              <div className="flex justify-center md:h-[90vh] md:overflow-y-scroll p-4">
                <form className="w-full max-w-[30em]" onSubmit={handleEditSubmit}>
                  <div className="flex flex-col sm:flex-row justify-center items-center sm:space-x-4">
                    <div className="rounded-full w-32 h-32 sm:w-40 sm:h-40 m-4">
                      <svg
                        className="text-gray-500 w-full h-full"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <a title="This Feature is not Unlocked....">
                      <label
                        htmlFor="file-upload"
                        className="cursor-not-allowed inline-flex justify-center rounded-md border border-transparent bg-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 mt-2 sm:mt-0"
                      >
                        Upload Image
                      </label>
                    </a>
                  </div>

                  <div className="grid gap-x-6 gap-y-4 sm:grid-cols-6 pb-6 border-b border-slate-200">
                    <div className="sm:col-span-3">
                      <label htmlFor="firstName" className="block text-sm leading-6 text-gray-900">
                        First Name
                      </label>
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="text"
                        required
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="lastName" className="block text-sm leading-6 text-gray-900">
                        Last Name
                      </label>
                      <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="text"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="phone_number" className="block text-sm leading-6 text-gray-900">
                        Phone
                      </label>
                      <input
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="text"
                        required
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="email" className="block text-sm leading-6 text-gray-900">
                        Email
                      </label>
                      <input
                        name="email"
                        value={formData.email}
                        placeholder="Optional"
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="text"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="location" className="block text-sm leading-6 text-gray-900">
                        Location
                      </label>
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="text"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="tags" className="block text-sm leading-6 text-gray-900">
                        Tags (comma separated)
                      </label>
                      <input
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="text"
                        placeholder="VIP, Customer"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="total_purchases" className="block text-sm leading-6 text-gray-900">
                        Total Purchases
                      </label>
                      <input
                        name="total_purchases"
                        value={formData.total_purchases}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="number"
                        min="0"
                      />
                    </div>

                     <div className="sm:col-span-3">
                      <label htmlFor="total_spent" className="block text-sm leading-6 text-gray-900">
                        Total Spent (₹)
                      </label>
                      <input
                        name="total_spent"
                        value={formData.total_spent}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="group_name" className="block text-sm leading-6 text-gray-900">
                        Group
                      </label>
                      <select
                        name="group_name"
                        value={formData.group_name}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                      >
                        <option value="">Select option</option>
                        {groups.map((group, index) => (
                          <option key={index}>{group.group_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-gray-700">Add to Group</label>
                      <select
                        className="mt-1 block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        onChange={(e) => {
                          const selectedGroupName = e.target.value;
                          if (selectedGroupName) {
                            const group = groups.find((g) => g.group_name === selectedGroupName);
                            if (group) {
                              addContactToGroup(selectedContact.id, group.id);
                            }
                          }
                        }}
                      >
                        <option value="">Select group to add</option>
                        {groups
                          .filter((group) => !selectedContact.Group.some((g) => g.group_name === group.group_name))
                          .map((group, index) => (
                            <option key={index} value={group.group_name}>{group.group_name}</option>
                          ))}
                      </select>
                    </div>
                    {selectedContact.Group[0]?.group_name && (
                      <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700">Remove from Group</label>
                        <select
                          className="mt-1 block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                          onChange={(e) => {
                            const selectedGroupName = e.target.value;
                            if (selectedGroupName) {
                              const group = groups.find((g) => g.group_name === selectedGroupName);
                              if (group) {
                                removeContactFromGroup(selectedContact.id, group.id);
                              }
                            }
                          }}
                        >
                          <option value="">Select group to remove</option>
                          {selectedContact.Group.map((group, index) => (
                            <option key={index} value={group.group_name}>{group.group_name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 mb-10 pb-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <a
                      className="rounded-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer px-5 py-2 text-white text-sm font-semibold flex items-center justify-center"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedContact(null);
                      }}
                    >
                      Cancel
                    </a>
                    <button
                      type="submit"
                      className="rounded-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer px-5 py-2 text-white text-sm font-semibold flex items-center justify-center"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="rounded-full px-5 py-2 text-sm bg-red-600 text-white hover:bg-red-500"
                      onClick={() => deleteContact([selectedContact.id])}
                    >
                      Delete Contact
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;