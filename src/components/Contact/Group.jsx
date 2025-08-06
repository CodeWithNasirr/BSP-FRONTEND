import axios from "axios";
import React, { useState } from "react";
import API_BASE_URL from "../../config";
import { toast } from 'react-toastify';
import { Link } from "react-router-dom";

const Groups = ({
  activeTab,
  setActiveTab,
  groups,
  setGroups,
  setSelectedContacts,
  setContAllSelected,
  token,
}) => {
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  const [formData, setFormData] = useState({ group_name: "" });
  const [isGrpSelected, setGroupSelected] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/add-group/`, formData, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      });
      toast.success(response.data.Message);
      setGroups((prev) => [...prev, response.data.data]);
      setFormData({ group_name: "" });
    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong");
      setFormData({ group_name: "" });
    }
  };

  const deleteGroup = async (groupIds) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/add-group/`, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
        data: { group_id: groupIds.length === 1 ? groupIds[0] : groupIds },
      });
      toast.success(response.data.Message, {
        onClose: () => window.location.reload(),
        autoClose: 2000,
      });
      setActiveDropdownId(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete group(s)");
    }
  };

  const handleSelectAll = () => {
    setGroupSelected(!isGrpSelected);
    setSelectedGroup(isGrpSelected ? [] : groups.map((group) => group.id));
  };

  const handleSelectGroup = (id) => {
    setSelectedGroup((prev) =>
      prev.includes(id) ? prev.filter((groupId) => groupId !== id) : [...prev, id]
    );
  };

  const toggleDropdown = (dropdownId) => {
    setActiveDropdownId(activeDropdownId === dropdownId ? null : dropdownId);
  };

  return (
    <div className="md:h-screen flex flex-col w-full min-w-0">
      <div className="md:bg-inherit bg-white md:flex md:flex-grow capitalize">
        <div className="md:w-[30%] flex-col h-full bg-white border-r border-slate-200 md:flex">
          <div className="px-4 pt-4">
            <div className="flex justify-between mt-2">
              <div className="flex space-x-1 text-xl">
                <h2>Groups</h2>
                <span className="text-slate-500">{groups.length}</span>
              </div>
              <div className="flex space-x-2 items-center">
                <a
                  title="Add Group"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowAddGroupForm(!showAddGroupForm);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                  >
                    <g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
                      <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12Zm10-8a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z"></path>
                      <path d="M13 7a1 1 0 1 0-2 0v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7Z"></path>
                    </g>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="px-4 pb-2">
            <div className="border border-[#f0f2f5] rounded-md mt-6 flex items-center py-[2px]">
              <span className="pl-3 py-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
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
                className="w-full outline-none rounded-xl py-2 pl-2 mr-2 text-sm"
                placeholder="Search name"
              />
            </div>
          </div>

          <div className="flex justify-between px-4 border-b border-slate-200 pb-2">
            <div className="flex items-center space-x-2">
              <label htmlFor="myCheckbox" className="cursor-pointer flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="myCheckbox"
                  checked={isGrpSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 border border-gray-400 rounded-md"
                />
                <span className="text-sm">Select all {selectedGroup.length}</span>
              </label>
            </div>
            <div className="relative inline-block text-left">
              <button
                className="p-2 hover:bg-gray-200 cursor-pointer rounded-full"
                onClick={() => toggleDropdown(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2Z"
                  ></path>
                </svg>
              </button>
              {activeDropdownId && (
                <div className="absolute right-0 origin-top-right z-10 mt-2 w-32 divide-y divide-gray-300 rounded-md bg-white shadow-lg ring-opacity-5 focus:outline-none">
                  <div className="px-1 py-1" role="none">
                    <Link
                      to=""
                      className="text-black hover:bg-blue-600 hover:text-white flex w-full rounded-md px-2 py-2 text-sm"
                    >
                      View
                    </Link>
                    <button
                      className="text-black hover:bg-blue-600 hover:text-white cursor-pointer flex w-full rounded-md px-2 py-2 text-sm text-left"
                      onClick={() => deleteGroup(selectedGroup)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-[5vh]">
            <div className="flex justify-between text-sm border-b border-slate-200">
              <button
                onClick={() => {
                  setActiveTab("contact");
                  setSelectedGroup([]);
                  setGroupSelected(false);
                }}
                className={`pt-3 w-1/2 text-center pb-1 cursor-pointer ${activeTab === "contact" ? "bg-slate-50 border-b-2 border-slate-700" : ""}`}
              >
                All Contacts
              </button>
              <button
                onClick={() => setActiveTab("group")}
                className={`pt-3 w-1/2 text-center pb-1 cursor-pointer ${activeTab === "group" ? "bg-slate-50 border-b-2 border-slate-700" : ""}`}
              >
                Group
              </button>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto h-[65vh]">
            {groups.map((group, index) => (
              <div
                key={index}
                className="flex space-x-2 hover:bg-gray-50 cursor-pointer items-center px-4 py-3 border-b border-slate-200"
              >
                <div className="flex items-center justify-center mt-1">
                  <label htmlFor={`group_${group.id}`} className="cursor-pointer">
                    <input
                      type="checkbox"
                      id={`group_${group.id}`}
                      checked={selectedGroup.includes(group.id)}
                      onChange={() => handleSelectGroup(group.id)}
                      className="w-4 h-4 rounded-full"
                    />
                  </label>
                </div>
                <div className="w-[15%]">
                  <div className="rounded-full bg-blue-600/10 text-blue-600 flex justify-center items-center h-12 w-12">
                    {group.initial_name}
                  </div>
                </div>
                <div className="w-[75%]">
                  <h3>{group.group_name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!showAddGroupForm && (
          <div className="md:w-[70%] bg-zinc-100 md:h-[100vh] md:overflow-y-hidden flex justify-center items-center">
            <div className="border border-slate-200 pt-20 py-10 w-[30em] rounded-xl bg-white">
              <h2 className="text-center text-2xl text-slate-500 mb-6">Select Group</h2>
              <div className="flex justify-center">
                <div className="border-r border-slate-500 h-10"></div>
              </div>
              <h2 className="text-center text-slate-600">OR</h2>
              <div className="flex justify-center">
                <div className="border-r border-slate-500 h-10"></div>
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <a
                  className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowAddGroupForm(!showAddGroupForm);
                  }}
                >
                  Add Group
                </a>
                <a
                  className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm"
                  href="#"
                >
                  Bulk Upload
                </a>
              </div>
            </div>
          </div>
        )}
 
        {showAddGroupForm && (
          <div className="md:w-[70%] bg-zinc-100 md:h-[100vh] md:overflow-y-hidden">
            <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10">
              <h1 className="text-xl font-semibold">Add Group</h1>
            </div>
            <div className="flex flex-1 justify-center items-start py-10 overflow-y-auto">
              <form
                className="w-full max-w-lg bg-white p-8 rounded-xl shadow-md"
                onSubmit={handleSubmit}
              >
                <div className="mb-6">
                  <label
                    htmlFor="group_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Group Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="group_name"
                    name="group_name"
                    type="text"
                    required
                    value={formData.group_name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="e.g. VIP Customers"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="rounded-full px-5 py-2 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAddGroupForm(!showAddGroupForm);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full px-5 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;