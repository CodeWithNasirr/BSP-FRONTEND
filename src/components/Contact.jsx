import axios from "axios";
import React,{useState,useEffect} from "react";
import API_BASE_URL from "../config";
import { toast } from 'react-toastify'
const Contacts = () => {
  const token = localStorage.getItem("authToken");
  const[activeTab,setActiveTab]=useState("contact")

  const[contact,setContact]=useState([]);
  const[group,setGroup]=useState([]);

  useEffect(()=>{
    axios
    .get(`${API_BASE_URL}/get_contacts`, {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then((response)=>{
      setContact(response.data.data)
      if (response.data.data > 0){
        setGroup(response.data.data[0].Group)
      }
    })
    .catch((error)=>{
      // console.error("Error creating Contacts:", error.response.data);
      // alert("Failed to create Contacts");
      toast.error(error.response.data.error)
    })
    // console.log(contact.data[0].Group)
    // console.log(contact)
    // console.log(group)
  },[]);


  const delete_contact = async (contact_id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/delete_contact/${contact_id}/`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      toast.success(response.data.message, {
              onClose: () => {
                window.location.reload();
              },
              autoClose: 2000 // Close toast after 2 seconds
            });
      setActiveDropdownId(false)
      

    } catch (error) {
      alert("Error: " + (error.response?.data?.error || error.message));
    }
  };

  // Contact add logic
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone_number: '',
    email: '',
    group_name: '',
    // street: '',
    // city: '',
    // state: '',
    // zipCode: '',
    // country: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({...prevState,[name]: value,}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Generate full_name from firstName and lastName
  const fullName = `${formData.firstName} ${formData.lastName}`.trim();

  // Prepare only the required fields for the API request
  const requestData = {
    full_name: fullName,
    phone_number: formData.phone_number,
    email: formData.email,
    group_name: formData.group_name,
  };
  // Filter out empty fields
  const filteredData = Object.fromEntries(
    Object.entries(requestData).filter(([_, value]) => 
      typeof value === "string" ? value.trim() !== "" : value // Keep files
    )
  );
  console.log(filteredData)
    try{
      const response = await axios.post(`${API_BASE_URL}/get_contacts/`,filteredData, {
        headers: {
           Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      })
      toast.success(response.data.Message)
      // Update state instead of reloading
      setContact((prevContacts) => [...prevContacts, response.data.data]);
      // window.location.reload();
      setFormData({
        firstName: '',
        lastName: '',
        phone_number: '',
        email: '',
        group_name: '',
      });
    }
    catch(error){
      console.log(error.response.data)
      toast.error(error.response.data.error)
      setFormData({
        firstName: '',
        lastName: '',
        phone_number: '',
        email: '',
        group_name: '',
      });
    }
   
  };



  // Contact Slider Logic Here
  const [isContSelected, setContAllSelected] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  // console.log(selectedContacts)
  const handleSelectAll = () => {
    setContAllSelected(!isContSelected);
    
    if (!isContSelected) {
      // Select all contacts
      setSelectedContacts(contact.map((contact) => contact.id)); 
    } else {
      // Deselect all
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (id) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter((contactId) => contactId !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  // Group Logic Here
  const [isGrpSelected,setGroupSelected]=useState(false);
  const [selectedGroup,setSelectedGroup]=useState([]);

  const handle_All_Grp=()=>{
    setGroupSelected(!isGrpSelected);
    
    if (!isGrpSelected){
      setSelectedGroup(group.map((groups)=>groups.id));
    }
    else{
      setSelectedGroup([]);
    }

  }

  const handle_select_group=(id)=>{
    if (selectedGroup.includes(id)){
      setSelectedGroup(selectedGroup.filter((GroupID)=>GroupID !== id ));
    }
    else{
      setSelectedGroup([...selectedGroup,id])
    }
  }

  // DropDown Menu
  const [activeDropdownId, setActiveDropdownId] = useState(false);
  const toggleDropdown = (dropdownId) => {
      setActiveDropdownId(activeDropdownId === dropdownId ? null : dropdownId);
    };

  


  return (
    <div className="md:h-screen flex flex-col w-full min-w-0">
      <div className="md:bg-inherit bg-white md:flex md:flex-grow capitalize">
        {/* Sidebar */}
        <div className="md:w-[30%] flex-col h-full bg-white border-r border-slate-200 md:flex">
          <div className="px-4 pt-4">
            <div className="flex justify-between mt-2">
              {activeTab === "contact" && (
                <div className="flex space-x-1 text-xl">
                  <h2>Contacts</h2>
                  <span className="text-slate-500">{contact.length}</span>
                </div>
              )}
              {activeTab === "group" && (
                <div className="flex space-x-1 text-xl">
                  <h2>Groups</h2>
                  <span className="text-slate-500">{group.length}</span>
                </div>
              )}

              {activeTab === "contact" && (
                <div className="flex space-x-2 items-center">
                  <a
                    title="Add Contact"
                    href=""
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAddContactForm(!showAddContactForm);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      >
                        <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12Zm10-8a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z"></path>
                        <path d="M13 7a1 1 0 1 0-2 0v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7Z"></path>
                      </g>
                    </svg>
                  </a>
                </div>
              )}
              {activeTab === "group" && (
                <div className="flex space-x-2 items-center">
                  <a
                    title="Add Group"
                    href=""
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      >
                        <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12Zm10-8a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z"></path>
                        <path d="M13 7a1 1 0 1 0-2 0v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7Z"></path>
                      </g>
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          {activeTab === "contact" && (
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
                  placeholder="Search name or phone or email"
                />
              </div>
            </div>
          )}
          {activeTab === "group" && (
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
          )}

          {/* Select Area.. */}
          <div className="flex justify-between  px-4 border-b border-slate-200 pb-2">
            {activeTab === "contact" && (
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="myCheckbox"
                  className="cursor-pointer flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    id="myCheckbox"
                    checked={isContSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 border border-gray-400 rounded-md"
                  />
                  <span className="text-sm">
                    Select all {selectedContacts.length}
                  </span>
                </label>
              </div>
            )}
            {activeTab === "group" && (
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="myCheckbox"
                  className="cursor-pointer flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    id="myCheckbox"
                    checked={isGrpSelected}
                    onChange={handle_All_Grp}
                    className="w-4 h-4 border border-gray-400 rounded-md"
                  />
                  <span className="text-sm">
                    Select all {selectedGroup.length}{" "}
                  </span>
                </label>
              </div>
            )}

            <div className="relative inline-block text-left">
              {/* SVG Button */}
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
              {/* Dropdown Menu */}
              {activeTab === 'contact' && activeDropdownId && (<div className="absolute right-0 origin-top-right z-10 mt-2 w-32 divide-y divide-gray-300 rounded-md bg-white shadow-lg ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1" role="none">
                  <a
                    href={``}
                    className="text-black hover:bg-blue-600 hover:text-white flex w-full rounded-md px-2 py-2 text-sm"
                  >
                    View
                  </a>
                  <button
                    className="text-black hover:bg-blue-600 hover:text-white cursor-pointer flex w-full rounded-md px-2 py-2 text-sm text-left"
                    onClick={() =>delete_contact(selectedContacts)}
                  >
                    Delete
                  </button>
                </div>
              </div>) }
              {activeTab === "group" && activeDropdownId && (<div className="absolute right-0 origin-top-right z-10 mt-2 w-32 divide-y divide-gray-300 rounded-md bg-white shadow-lg ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1" role="none">
                  <a
                    href={``}
                    className="text-black hover:bg-blue-600 hover:text-white flex w-full rounded-md px-2 py-2 text-sm"
                  >
                    View
                  </a>
                  <button
                    className="text-black hover:bg-blue-600 hover:text-white cursor-pointer flex w-full rounded-md px-2 py-2 text-sm text-left"
                    // onClick={() =>}
                  >
                    Delete
                  </button>
                </div>
              </div>)}

            </div>
          </div>

          {/* Nav Bar */}
          <div className="h-[5vh]">
            <div className="flex justify-between text-sm border-b border-slate-200">
              <button
                onClick={() => {
                  setActiveTab("contact");
                  setSelectedGroup([]);
                  setGroupSelected(false);
                }}
                className={`pt-3 w-1/2 text-center pb-1 cursor-pointer ${
                  activeTab === "contact"
                    ? "bg-slate-50  border-b-2 border-slate-700"
                    : ""
                }`}
              >
                All Contacts
              </button>
              <button
                onClick={() => {
                  setActiveTab("group");
                  setSelectedContacts([]);
                  setContAllSelected(false);
                }}
                className={`pt-3 w-1/2 text-center pb-1 cursor-pointer ${
                  activeTab === "group"
                    ? "bg-slate-50  border-b-2 border-slate-700"
                    : ""
                }  `}
              >
                Group
              </button>
            </div>
          </div>

          {/* Contacts List */}
          {activeTab === "contact" && (
            <div className="flex-grow overflow-y-auto h-[65vh]">
              {contact.map((contact, index) => (
                <div
                  key={index}
                  className="flex space-x-2 hover:bg-gray-50 cursor-pointer items-center px-4 py-3 border-b border-slate-200"
                >
                  <div className="flex items-center justify-center mt-1">
                    <label
                      htmlFor={`contact_${contact.id}`}
                      className="cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        id={`contact_${contact.id}`}
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleSelectContact(contact.id)}
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
                    <p className="text-slate-500 text-xs truncate">
                      {contact.phone_number}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Group List */}
          {activeTab === "group" && (
            <div className="flex-grow overflow-y-auto h-[65vh]">
              {group.map((group, index) => (
                <div
                  key={index}
                  className="flex space-x-2 hover:bg-gray-50 cursor-pointer items-center px-4 py-3 border-b border-slate-200"
                >
                  <div className="flex items-center justify-center mt-1">
                    <label
                      htmlFor={`group_${group.id}`}
                      className="cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        id={`group_${group.id}`}
                        checked={selectedGroup.includes(group.id)}
                        onChange={() => handle_select_group(group.id)}
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
          )}
        </div>
        {!showAddContactForm && (
          <div className="md:w-[70%]  bg-zinc-100 md:h-[100vh] md:overflow-y-hidden flex justify-center items-center">
            {/* Contact Content */}
            {activeTab === "contact" && (
              <div className="border border-slate-200 pt-20 py-10 w-[30em] rounded-xl bg-white">
                <h2 className="text-center text-2xl text-slate-500 mb-6">
                  Select Contact
                </h2>
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
                    href=""
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAddContactForm(!showAddContactForm);
                    }}
                  >
                    Add Contact
                  </a>
                  <a
                    className="rounded-md bg-indigo-600 hover:bg-indigo-500 cursor-not-allowed px-3 py-2 text-sm font-semibold text-white shadow-sm"
                    // href="#"
                  >
                    Bulk Upload
                  </a>
                </div>
              </div>
            )}

            {activeTab === "group" && (
              <div className="border border-slate-200 pt-20 py-10 w-[30em] rounded-xl bg-white">
                <h2 className="text-center text-2xl text-slate-500 mb-6">
                  Select Group
                </h2>
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
                    // href=""
                  >
                    Add Group
                  </a>
                  <a
                    className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm"
                    // href=""
                  >
                    Bulk Upload
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Contact */}
        {showAddContactForm && (
          <div className="md:w-[70%] bg-zinc-100 md:h-[100vh] md:overflow-y-hidden">
            <div>
              <div>
                <div className="h-20 bg-white border-b border-slate-200  md:flex items-center justify-between px-10 hidden">
                  <h1 className="text-xl">Add Contact</h1>
                  <a
                    className="inline-flex justify-center rounded-md border border-transparent bg-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 mr-4"
                    href=""
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAddContactForm(!showAddContactForm);
                    }}
                  >
                    Cancel
                  </a>
                </div>
                <div className="flex justify-center md:h-[90vh] md:overflow-y-scroll">
                  <form className="w-[30em]" onSubmit={handleSubmit}>
                    <div className="flex justify-center items-center">
                      <div className="rounded-full w-40 h-40 m-4">
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
                      {/* <input type="file" className="sr-only " accept=".jpg, .png" id="file-upload" /> */}
                      <a title="This Feature is not Unlocked....">
                        <label
                          htmlFor="file-upload"
                          className="cursor-not-allowed inline-flex justify-center rounded-md border border-transparent bg-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 mr-4"
                        >
                          Upload Image
                        </label>{" "}
                      </a>
                    </div>
                    <div className="grid gap-x-6 gap-y-4 sm:grid-cols-6 pb-6 border-b border-slate-200">
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="firstName"
                          className="block text-sm leading-6 text-gray-900"
                        >
                          First Name
                        </label>
                        <input
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                          type="text" required
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="lastName"
                          className="block text-sm leading-6 text-gray-900"
                        >
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
                        <label
                          htmlFor="phone_number"
                          className="block text-sm leading-6 text-gray-900"
                        >
                          Phone
                        </label>
                        <input
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                          type="text" required
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="email"
                          className="block text-sm leading-6 text-gray-900"
                        >
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
                      <div className="sm:col-span-6">
                        <label
                          htmlFor="group_name"
                          className="block text-sm leading-6 text-gray-900"
                        >
                          Group
                        </label>
                        <select
                          name="group_name"
                          value={formData.group_name}
                          onChange={handleChange}
                          className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        >
                          <option value="">Select option</option>
                          {group.map((group, index) => (
                            <option key={index}>{group.group_name}</option>
                          ))}
                          {/* Add options here */}
                        </select>
                      </div>
                    </div>
                    {/* <div className="grid gap-x-6 gap-y-4 sm:grid-cols-6 pt-4 pb-6 ">
                <div className="sm:col-span-6">
                  <label htmlFor="street" className="block text-sm leading-6 text-gray-900">Street</label>
                  <input name="street" value={formData.street} onChange={handleChange} className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300" type="text" />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="city" className="block text-sm leading-6 text-gray-900">City</label>
                  <input name="city" value={formData.city} onChange={handleChange} className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300" type="text" />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="state" className="block text-sm leading-6 text-gray-900">State</label>
                  <input name="state" value={formData.state} onChange={handleChange} className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300" type="text" />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="zipCode" className="block text-sm leading-6 text-gray-900">Zip Code</label>
                  <input name="zipCode" value={formData.zipCode} onChange={handleChange} className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300" type="text" />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="country" className="block text-sm leading-6 text-gray-900">Country</label>
                  <input name="country" value={formData.country} onChange={handleChange} className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300" type="text" />
                </div>
              </div> */}
                    <div className="mt-4 mb-10 pb-10 flex space-x-4">
                      <a
                        className="rounded-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer px-5 py-2 text-white text-sm font-semibold flex items-center"
                        href=""
                        onClick={(e) => {
                          e.preventDefault();
                          setShowAddContactForm(!showAddContactForm);
                        }}
                      >
                        Cancel
                      </a>
                      <button
                        type="submit"
                        className="rounded-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer px-5 py-2 text-white text-sm font-semibold flex items-center"
                      >
                        <span>Save</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
