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
  });
  const [activeDropdownId, setActiveDropdownId] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const updateLocalStorageUserInfo = (key, value) => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (!storedUserInfo) return;
    const parsed = JSON.parse(storedUserInfo);
    parsed[key] = value;
    localStorage.setItem("userInfo", JSON.stringify(parsed));
  };

  const fetchContactsAndGroups = debounce(async (pageNum, search = '') => {
    setLoading(true);
    try {
      const [contactsRes, groupsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/contacts/?page=${pageNum}&search=${encodeURIComponent(search)}`, {
          headers: { Authorization: `Token ${token}` },
        }),
        axios.get(`${API_BASE_URL}/api/add-group/`, {
          headers: { Authorization: `Token ${token}` },
        }),
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

    fetchContactsAndGroups(c_page, searchQuery);
  }, [c_page, searchQuery, token, setContacts, setGroups]);

  const deleteContact = async (contact_id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/delete-contact/`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        data: { contact_id },
      });

      toast.success(response.data.message, {
        autoClose: 2000,
      });

      const contactsRes = await axios.get(`${API_BASE_URL}/api/contacts/?page=${c_page}&search=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Token ${token}` },
      });
      setContacts(contactsRes.data.results || []);
      setSelectedContacts([]);
      setActiveDropdownId(false);
      setContAllSelected(false);
      updateLocalStorageUserInfo("contacts", contactsRes.data.results);

      setSelectedContact((prev) => {
        if (prev && prev.id === contact_id[0]) {
          return null;
        }
        return prev;
      });

      setActiveDropdownId(false);
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
    }
  };

  const removeContactFromGroup = async (contact_id, group_id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/remove-contact-from-group/`, {
        contact_id,
        group_id,
      }, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      });
      toast.success(response.data.Message);
      const contactsRes = await axios.get(`${API_BASE_URL}/api/contacts/?page=${c_page}&search=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Token ${token}` },
      });
      setContacts(contactsRes.data.results || []);
      updateLocalStorageUserInfo("contacts", contactsRes.data.results);
      setSelectedContact((prev) => {
        if (prev && prev.id === contact_id) {
          return { ...prev, Group: [] };
        }
        return prev;
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to remove contact from group");
    }
  };

  const addContactToGroup = async (contact_id, group_id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/add-contact-to-group/`, {
        contact_id,
        group_id,
      }, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      });
      toast.success(response.data.Message);
      const contactsRes = await axios.get(`${API_BASE_URL}/api/contacts/?page=${c_page}&search=${encodeURIComponent(searchQuery)}`, {
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
    };
    const filteredData = Object.fromEntries(
      Object.entries(requestData).filter(([_, value]) => 
        typeof value === "string" ? value.trim() !== "" : value
      )
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
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong");
      setFormData({
        firstName: '',
        lastName: '',
        phone_number: '',
        email: '',
        group_name: '',
      });
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
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setC_Page(1);
  };

  return (
    <div className="flex flex-col w-full min-w-0 h-full">
      <div className="flex flex-col bg-white">
        {/* Header */}
        <div className="px-4 pt-4 flex justify-between items-center">
          <div className="flex space-x-1 text-lg sm:text-xl">
            <h2>Contacts</h2>
            <span className="text-slate-500">{contacts.length}</span>
          </div>
          <div className="flex space-x-2 items-center">
            <a
              title="Add Contact"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowAddContactForm(!showAddContactForm);
                setSelectedContact(null);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="sm:w-22 sm:h-22"
              >
                <g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
                  <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12Zm10-8a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z"></path>
                  <path d="M13 7a1 1 0 1 0-2 0v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7Z"></path>
                </g>
              </svg>
            </a>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-2">
          <div className="border border-[#f0f2f5] rounded-md mt-4 flex items-center py-1">
            <span className="pl-2 py-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                className="sm:w-20 sm:h-20"
              >
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
              className="w-full outline-none rounded-xl py-1 pl-2 text-sm sm:text-base"
              placeholder="Search name, phone, or email"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Tabs and Select All */}
        <div className="flex justify-between px-4 border-b border-slate-200 pb-2">
          <div className="flex items-center space-x-2">
            <label htmlFor="myCheckbox" className="cursor-pointer flex items-center space-x-1 sm:space-x-2">
              <input
                type="checkbox"
                id="myCheckbox"
                checked={isContSelected}
                onChange={handleSelectAll}
                className="w-4 h-4 border border-gray-400 rounded-md"
              />
              <span className="text-xs sm:text-sm">Select all ({selectedContacts.length})</span>
            </label>
          </div>
          <div className="relative inline-block text-left">
            <button
              className="p-1 sm:p-2 hover:bg-gray-200 cursor-pointer rounded-full"
              onClick={() => toggleDropdown(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                className="sm:w-20 sm:h-20"
              >
                <path
                  fill="currentColor"
                  d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2Z"
                ></path>
              </svg>
            </button>
            {activeDropdownId && (
              <div className="absolute right-0 z-10 mt-1 w-28 sm:w-32 rounded-md bg-white shadow-lg">
                <div className="px-1 py-1">
                  <Link
                    to=""
                    className="text-black hover:bg-blue-600 hover:text-white flex w-full rounded-md px-2 py-1 text-xs sm:text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      if (selectedContacts.length === 1) {
                        const contact = contacts.find((c) => c.id === selectedContacts[0]);
                        viewContact(contact);
                      }
                    }}
                  >
                    View
                  </Link>
                  <button
                    className="text-black hover:bg-blue-600 hover:text-white flex w-full rounded-md px-2 py-1 text-xs sm:text-sm text-left"
                    onClick={() => deleteContact(selectedContacts)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="h-12">
          <div className="flex justify-between text-sm border-b border-slate-200">
            <button
              onClick={() => setActiveTab("contact")}
              className={`pt-2 w-1/2 text-center pb-1 cursor-pointer ${activeTab === "contact" ? "bg-slate-50 border-b-2 border-slate-700" : ""} text-xs sm:text-sm`}
            >
              All Contacts
            </button>
            <button
              onClick={() => {
                setActiveTab("group");
                setSelectedContacts([]);
                setContAllSelected(false);
              }}
              className={`pt-2 w-1/2 text-center pb-1 cursor-pointer ${activeTab === "group" ? "bg-slate-50 border-b-2 border-slate-700" : ""} text-xs sm:text-sm`}
            >
              Group
            </button>
          </div>
        </div>

        {/* Contact List */}
        {loading ? (
          <div className="text-center my-10 animate-pulse text-sm">Loading contacts...</div>
        ) : (
          <>
            <div className="flex-grow overflow-y-auto h-[calc(100vh-16rem)] sm:h-[calc(100vh-18rem)]">
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex space-x-2 hover:bg-gray-50 cursor-pointer items-center px-3 py-2 border-b border-slate-200"
                  onClick={() => viewContact(contact)}
                >
                  <div className="flex items-center justify-center">
                    <label htmlFor={`contact_${contact.id}`} className="cursor-pointer">
                      <input
                        type="checkbox"
                        id={`contact_${contact.id}`}
                        checked={selectedContacts.includes(contact.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectContact(contact.id);
                        }}
                        className="w-4 h-4 rounded"
                      />
                    </label>
                  </div>
                  <div className="w-12">
                    <div className="rounded-full bg-blue-600/10 text-blue-600 flex justify-center items-center h-10 w-10 text-sm">
                      {contact.initial_name}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base">{contact.full_name}</h3>
                    <p className="text-slate-500 text-xs truncate">{contact.phone_number}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 px-3 text-sm">
              <button
                onClick={() => setC_Page((prev) => Math.max(prev - 1, 1))}
                disabled={!c_pagination.previous}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 text-xs sm:text-sm"
              >
                Previous
              </button>
              <span className="text-xs sm:text-sm">Page {c_page} of {Math.ceil(c_pagination.count / 10)}</span>
              <button
                onClick={() => setC_Page((prev) => prev + 1)}
                disabled={!c_pagination.next}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 text-xs sm:text-sm"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Default View */}
      {!showAddContactForm && !selectedContact && (
        <div className="bg-zinc-100 flex flex-col items-center py-6">
          <div className="border border-slate-200 py-6 w-11/12 sm:w-[30em] rounded-xl bg-white">
            <h2 className="text-center text-lg sm:text-2xl text-slate-500 mb-4">Select Contact</h2>
            <div className="flex justify-center">
              <div className="border-r border-slate-500 h-8"></div>
            </div>
            <h2 className="text-center text-sm sm:text-base text-slate-600">OR</h2>
            <div className="flex justify-center">
              <div className="border-r border-slate-500 h-8"></div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center px-4 sm:px-10 mt-4">
              <Link
                className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-white"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowAddContactForm(!showAddContactForm);
                }}
              >
                Add Contact
              </Link>
              <Link
                className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-white"
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

      {/* Add Contact Form */}
      {showAddContactForm && (
        <div className="bg-zinc-100 flex flex-col">
          <div className="bg-white border-b border-slate-200 flex items-center justify-between px-4 py-3 sm:px-10 sm:py-4">
            <h1 className="text-lg sm:text-xl">Add Contact</h1>
            <a
              className="rounded-md bg-slate-200 px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-500 hover:bg-slate-300"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowAddContactForm(!showAddContactForm);
              }}
            >
              Cancel
            </a>
          </div>
          <div className="flex justify-center py-4">
            <form className="w-11/12 sm:w-[30em]" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center">
                <div className="rounded-full w-24 h-24 sm:w-40 sm:h-40 m-4">
                  <svg
                    className="text-gray-500"
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
                    className="cursor-not-allowed rounded-md bg-slate-200 px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-200"
                  >
                    Upload Image
                  </label>
                </a>
              </div>
              <div className="grid gap-y-3 sm:gap-x-6 sm:gap-y-4 sm:grid-cols-6 pb-4 border-b border-slate-200">
                <div className="sm:col-span-3">
                  <label htmlFor="firstName" className="block text-xs sm:text-sm leading-6 text-gray-900">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1 sm:py-1.5 px-3 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 text-xs sm:text-sm sm:leading-6 ring-gray-300"
                    type="text"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="lastName" className="block text-xs sm:text-sm leading-6 text-gray-900">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1 sm:py-1.5 px-3 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 text-xs sm:text-sm sm:leading-6 ring-gray-300"
                    type="text"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="phone_number" className="block text-xs sm:text-sm leading-6 text-gray-900">
                    Phone
                  </label>
                  <input
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1 sm:py-1.5 px-3 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 text-xs sm:text-sm sm:leading-6 ring-gray-300"
                    type="text"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-xs sm:text-sm leading-6 text-gray-900">
                    Email
                  </label>
                  <input
                    name="email"
                    value={formData.email}
                    placeholder="Optional"
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1 sm:py-1.5 px-3 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 text-xs sm:text-sm sm:leading-6 ring-gray-300"
                    type="text"
                  />
                </div>
                <div className="sm:col-span-6">
                  <label htmlFor="group_name" className="block text-xs sm:text-sm leading-6 text-gray-900">
                    Group
                  </label>
                  <select
                    name="group_name"
                    value={formData.group_name}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1 sm:py-1.5 px-3 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 text-xs sm:text-sm sm:leading-6 ring-gray-300"
                  >
                    <option value="">Select option</option>
                    {groups.map((group, index) => (
                      <option key={index}>{group.group_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3 mb-6 flex space-x-3 justify-center">
                <a
                  className="rounded-full bg-indigo-600 hover:bg-indigo-500 px-4 py-1 sm:px-5 sm:py-2 text-xs sm:text-sm font-semibold text-white"
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
                  className="rounded-full bg-indigo-600 hover:bg-indigo-500 px-4 py-1 sm:px-5 sm:py-2 text-xs sm:text-sm font-semibold text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Details */}
      {selectedContact && (
        <div className="bg-zinc-100 flex flex-col">
          <div className="bg-white border-b border-slate-200 flex items-center justify-between px-4 py-3 sm:px-10 sm:py-4">
            <h1 className="text-lg sm:text-xl">Contact Details</h1>
            <a
              className="rounded-md bg-slate-200 px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-500 hover:bg-slate-300"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedContact(null);
              }}
            >
              Close
            </a>
          </div>
          <div className="flex justify-center py-4">
            <div className="w-11/12 sm:w-[30em] p-4 sm:p-8 bg-white rounded-xl shadow-md">
              <div className="flex flex-col items-center">
                <div className="rounded-full w-24 h-24 sm:w-40 sm:h-40 m-4">
                  <svg
                    className="text-gray-500"
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
              </div>
              <div className="grid gap-y-3 sm:gap-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-gray-900 text-sm sm:text-base">{selectedContact.full_name}</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-gray-900 text-sm sm:text-base">{selectedContact.phone_number}</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900 text-sm sm:text-base">{selectedContact.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Group</label>
                  <p className="mt-1 text-gray-900 text-sm sm:text-base">{selectedContact.Group[0]?.group_name || 'None'}</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Add to Group</label>
                  <select
                    className="mt-1 block w-full rounded-md border-0 py-1 sm:py-1.5 px-3 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 text-xs sm:text-sm sm:leading-6 ring-gray-300"
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
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Remove from Group</label>
                    <select
                      className="mt-1 block w-full rounded-md border-0 py-1 sm:py-1.5 px-3 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 text-xs sm:text-sm sm:leading-6 ring-gray-300"
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
              <div className="mt-4 flex justify-center sm:justify-end space-x-3">
                <button
                  className="rounded-full px-4 py-1 sm:px-5 sm:py-2 text-xs sm:text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => setSelectedContact(null)}
                >
                  Close
                </button>
                <button
                  className="rounded-full px-4 py-1 sm:px-5 sm:py-2 text-xs sm:text-sm bg-red-600 text-white hover:bg-red-500"
                  onClick={() => deleteContact([selectedContact.id])}
                >
                  Delete Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;