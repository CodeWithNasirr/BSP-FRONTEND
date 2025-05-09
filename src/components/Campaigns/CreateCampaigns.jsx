import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { toast } from 'react-toastify';

function CreateTemplate() {
  const navigate = useNavigate();
  const [isDisabled, setIsDisabled] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [group, setGroup] = useState([]);
  const [contacts, setContacts] = useState([]); // New state for individual contacts
  const [recipientType, setRecipientType] = useState('group'); // Track recipient type
  const [formData, setFormData] = useState({
    template_name: '',
    campaigns_name: '',
    recipients: '',
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const token = localStorage.getItem('authToken');

  // Fetch templates, groups, and contacts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templateRes, groupRes, contactRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/get_temp/`, { headers: { Authorization: `Token ${token}` } }),
          axios.get(`${API_BASE_URL}/add_group`, { headers: { Authorization: `Token ${token}` } }),
          axios.get(`${API_BASE_URL}/get_contacts/`, { headers: { Authorization: `Token ${token}` } }), // New endpoint
        ]);
        setTemplates(templateRes.data.Data);
        setGroup(groupRes.data.data);
        setContacts(contactRes.data.data); // Assuming API returns contact list
      } catch (err) {
        toast.error('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  // Check WhatsApp connection status
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/check-whatsapp-status`, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      })
      .then((response) => setIsConnected(response.data.is_connected))
      .catch((error) => toast.error('Failed to fetch WhatsApp status'));
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };
      const template = templates.find((t) => t.template_name === updatedData.template_name);
      setSelectedTemplate(template);
      const isFormComplete =
        updatedData.template_name.trim() !== '' &&
        updatedData.campaigns_name.trim() !== '' &&
        updatedData.recipients.trim() !== '';
      setIsDisabled(!isFormComplete);
      return updatedData;
    });
  };

  // Handle recipient type change
  const handleRecipientTypeChange = (e) => {
    setRecipientType(e.target.value);
    setFormData((prev) => ({ ...prev, recipients: '' })); // Reset recipients
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setMediaFile(file);
    } else {
      toast.error('Please upload a valid image');
      setMediaFile(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('template_name', formData.template_name);
    formDataToSend.append('campaigns_name', formData.campaigns_name);
    formDataToSend.append('recipients', formData.recipients);
    formDataToSend.append('recipient_type', recipientType); // Send recipient type
    if (mediaFile) {
      formDataToSend.append('media_file', mediaFile);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/Send_Campaigns/`, formDataToSend, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Campaign Created Successfully!');
      setFormData({ template_name: '', campaigns_name: '', recipients: '' });
      setMediaFile(null);
      setSelectedTemplate(null);
      setRecipientType('group');
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  return (
    <div className="main bg-zinc-50">
      <form onSubmit={handleSubmit}>
        <div className="header flex justify-between px-5">
          <div className="left py-5">
            <h2 className="font-semibold text-xl mb-1">Message Campaigns</h2>
            <p className="mb-6 flex items-center text-sm leading-6 text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11v5m0 5a9 9 0 1 1 0-18a9 9 0 0 1 0 18Zm.05-13v.1h-.1V8h.1Z"
                />
              </svg>
              <span className="ml-1 mt-1">Create Campaigns</span>
            </p>
          </div>
          <div className="right gap-2 px-10 text-white flex items-center">
            <button
              className="rounded-full bg-black cursor-pointer px-5 py-2 text-white text-sm font-semibold flex items-center"
              onMouseDown={() => navigate('/campaigns')}
            >
              Back
            </button>
            <button
              className={`rounded-full px-5 py-2 text-white text-sm font-semibold flex items-center 
                ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 cursor-pointer'}`}
              disabled={isDisabled}
              type="submit"
            >
              Create Campaigns
            </button>
          </div>
        </div>

        <div className="container flex flex-col w-full max-h-[500px]">
          {!isConnected && (
            <div className="md:w-[50%] md:p-8 overflow-y-auto">
              <div className="p-4 md:p-8 overflow-y-auto">
                <div className="bg-slate-50 border border-primary shadow rounded-md p-4 py-8">
                  <div className="flex justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 48 48">
                      <path
                        fill="black"
                        d="M43.634 4.366a1.25 1.25 0 0 1 0 1.768l-4.913 4.913a9.253 9.253 0 0 1-.744 12.244l-3.343 3.343a1.25 1.25 0 0 1-1.768 0l-11.5-11.5a1.25 1.25 0 0 1 0-1.768l3.343-3.343a9.25 9.25 0 0 1 12.244-.743l4.913-4.914a1.25 1.25 0 0 1 1.768 0m-7.611 7.425a6.75 6.75 0 0 0-9.546 0l-2.46 2.459l9.733 9.732l2.46-2.459a6.75 6.75 0 0 0 0-9.546zM9.28 36.953l-4.914 4.913a1.25 1.25 0 0 0 1.768 1.768l4.913-4.913a9.253 9.253 0 0 0 12.244-.744l3.343-3.343a1.25 1.25 0 0 0 0-1.768L25.268 31.5l3.366-3.366a1.25 1.25 0 0 0-1.768-1.768L23.5 29.732L18.268 24.5l3.366-3.366a1.25 1.25 0 0 0-1.768-1.768L16.5 22.732l-1.366-1.366a1.25 1.25 0 0 0-1.768 0l-3.343 3.343a9.25 9.25 0 0 0-.743 12.244m2.51-10.476l2.46-2.46l9.732 9.733l-2.459 2.46a6.75 6.75 0 0 1-9.546 0l-.186-.187a6.75 6.75 0 0 1 0-9.546"
                      />
                    </svg>
                  </div>
                  <h3 className="text-center text-lg font-medium mb-4">Connect your WhatsApp account</h3>
                  <h4 className="text-center mb-4">
                    You need to connect your WhatsApp account first before you can create a campaign.
                  </h4>
                  <div className="flex justify-center">
                    <Link
                      to={isConnected ? '#' : '/connect-form'}
                      onClick={(e) => isConnected && e.preventDefault()}
                      className={`rounded-md cursor-pointer ${
                        isConnected ? 'bg-green-500 hover:bg-green-400' : 'bg-indigo-600 hover:bg-indigo-500'
                      } px-3 py-2 text-sm font-semibold text-white shadow-sm mx-10`}
                      disabled={isConnected}
                    >
                      {isConnected ? 'Connected WhatsApp Successfully' : 'Connect WhatsApp Business'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
          {isConnected && (
            <div className="md:w-[50%] md:p-8 overflow-y-auto">
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-6 mb-8 capitalize">
                <div className="sm:col-span-6">
                  <label htmlFor="campaigns_name" className="block text-sm leading-6 text-gray-900">
                    Campaign Name
                  </label>
                  <input
                    name="campaigns_name"
                    value={formData.campaigns_name}
                    onChange={handleChange}
                    className="block w-full bg-white rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                    type="text"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="templates" className="block text-sm leading-6 text-gray-900">
                    Templates
                  </label>
                  <select
                    className="rounded-md ring-gray-300 bg-white border-0 shadow-sm outline-none ring-1 ring-inset py-1.5 px-5 text-sm"
                    value={formData.template_name}
                    onChange={handleChange}
                    name="template_name"
                    id="template_name"
                  >
                    <option value="" disabled>Select a template</option>
                    {templates.map((template, index) => (
                      <option key={index} value={template.template_name}>
                        {template.template_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="recipient_type" className="block text-sm leading-6 text-gray-900">
                    Recipient Type
                  </label>
                  <select
                    className="rounded-md ring-gray-300 bg-white border-0 shadow-sm outline-none ring-1 ring-inset py-1.5 px-5 text-sm"
                    value={recipientType}
                    onChange={handleRecipientTypeChange}
                    name="recipient_type"
                  >
                    <option value="group">Group/All Contacts</option>
                    <option value="single">Single Contact</option>
                  </select>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="recipients" className="block text-sm leading-6 text-gray-900">
                    {recipientType === 'single' ? 'Phone Number' : 'Contacts'}
                  </label>
                  {recipientType === 'group' ? (
                    <select
                      className="rounded-md ring-gray-300 bg-white border-0 shadow-sm outline-none ring-1 ring-inset py-1.5 px-5 text-sm"
                      value={formData.recipients}
                      onChange={handleChange}
                      name="recipients"
                      id="recipients"
                    >
                      <option value="" disabled>Select Contacts</option>
                      <option value="all_contacts">All Contacts</option>
                      {group.map((group, index) => (
                        <option key={index}>{group.group_name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name="recipients"
                      value={formData.recipients}
                      onChange={handleChange}
                      className="block w-full bg-white rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                      type="text"
                      placeholder="Enter phone number (e.g., +918093537813)"
                    />
                  )}
                </div>

                {selectedTemplate && selectedTemplate.header_type?.toUpperCase() === 'IMAGE' && (
                  <div className="sm:col-span-6">
                    <label htmlFor="media_file" className="block text-sm leading-6 text-gray-900">
                      Upload Image
                    </label>
                    <input
                      name="media_file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full bg-white rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                    />
                    {mediaFile && <p className="text-sm text-gray-600 mt-2">Selected: {mediaFile.name}</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default CreateTemplate;