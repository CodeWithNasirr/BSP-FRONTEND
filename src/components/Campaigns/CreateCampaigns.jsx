import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { toast } from 'react-toastify';
import { Context } from '../context/Context';
import RequireSubscription from "../Subscriptions/RequireSubscription";
import VariableSubstitutionSection from './VariableSubstitutionSection';
import TemplateViewModal from '../Templates/TemplateViewModal.jsx';


function CreateCampaigns() {
  const navigate = useNavigate();
  const [isDisabled, setIsDisabled] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [segments, setSegments] = useState([]);
  const [recipientType, setRecipientType] = useState('group');
  const [scheduleType, setScheduleType] = useState('immediate');
  const [formData, setFormData] = useState({
    template_name: '',
    campaigns_name: '',
    recipients: '',
    variable_values: {},
    variable_methods: {},
    scheduled_time: '',
  });
  const [loading, setLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const token = localStorage.getItem('authToken');
  const [variables, setVariables] = useState([]);
  const { isConnected } = useContext(Context);

  // Fetch templates, groups, contacts, and segments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templateRes, groupRes, contactRes, segmentRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/whatsapp/templates/`, { headers: { Authorization: `Token ${token}` } }),
          axios.get(`${API_BASE_URL}/api/add-group/`, { headers: { Authorization: `Token ${token}` } }),
          axios.get(`${API_BASE_URL}/api/contacts/`, { headers: { Authorization: `Token ${token}` } }),
          axios.get(`${API_BASE_URL}/api/segments/`, { headers: { Authorization: `Token ${token}` } }),
        ]);
        setTemplates(templateRes.data.Data);
        setGroups(groupRes.data.data);
        setContacts(contactRes.data.data);
        setSegments(segmentRes.data.data);
      } catch (err) {
        toast.error('Failed to fetch data');
      }
    };
    fetchData();
  }, [token]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };
      const template = templates.find((t) => t.template_name === updatedData.template_name);
      // Open modal only when template_name changes and a template is selected
      if (name === 'template_name' && template) {
        setSelectedTemplate(template);
        setIsModalOpen(true);
      } else if (name === 'template_name' && !template) {
        setSelectedTemplate(null);
        setIsModalOpen(false);
      }
      const isFormComplete =
        updatedData.template_name.trim() !== '' &&
        updatedData.campaigns_name.trim() !== '' &&
        updatedData.recipients.trim() !== '' &&
        (scheduleType === 'immediate' || (scheduleType === 'scheduled' && updatedData.scheduled_time.trim() !== ''));
      setIsDisabled(!isFormComplete);
      return updatedData;
    });
  };

  // Handle recipient type change
  const handleRecipientTypeChange = (e) => {
    setRecipientType(e.target.value);
    setFormData((prev) => ({ ...prev, recipients: '' }));
  };

  // Handle schedule type change
  const handleScheduleTypeChange = (e) => {
    setScheduleType(e.target.value);
    setFormData((prev) => ({ ...prev, scheduled_time: '' }));
    const isFormComplete =
      formData.template_name.trim() !== '' &&
      formData.campaigns_name.trim() !== '' &&
      formData.recipients.trim() !== '' &&
      (e.target.value === 'immediate' || formData.scheduled_time.trim() !== '');
    setIsDisabled(!isFormComplete);
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

  // Extract variables from selected template
  useEffect(() => {
    const template = templates.find((t) => t.template_name === formData.template_name);
    setSelectedTemplate(template);
    setIsModalOpen(!!template); // Update modal visibility
    if (template?.body_text) {
      const regex = /{{\d+}}/g;
      const matches = template.body_text.match(regex) || [];
      setVariables([...new Set(matches)]);
    } else {
      setVariables([]);
    }
  }, [formData.template_name, templates]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('template_name', formData.template_name);
    formDataToSend.append('campaigns_name', formData.campaigns_name);
    formDataToSend.append('recipients', formData.recipients);
    formDataToSend.append('recipient_type', recipientType);
    if (recipientType === 'segment') {
      formDataToSend.append('segment_id', formData.recipients);
    }
    formDataToSend.append('variable_values', JSON.stringify(formData.variable_values));
    formDataToSend.append('variable_methods', JSON.stringify(formData.variable_methods || {}));
    if (scheduleType === 'scheduled' && formData.scheduled_time) {
      const istDateTime = `${formData.scheduled_time}:00+05:30`;
      formDataToSend.append('scheduled_time', istDateTime);
    }
    if (mediaFile) {
      formDataToSend.append('media_file', mediaFile);
    }
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/apis/campaigns/send/`, formDataToSend, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Campaign Created Successfully!');
      setFormData({ template_name: '', campaigns_name: '', recipients: '', variable_values: {}, variable_methods: {}, scheduled_time: '' });
      setMediaFile(null);
      setSelectedTemplate(null);
      setIsModalOpen(false); // Close modal on submit
      setRecipientType('group');
      setScheduleType('immediate');
      navigate('/campaigns');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <RequireSubscription>
      <div className="main bg-zinc-50 min-h-screen px-4 sm:px-6 flex">
        {/* Form Section */}
        <div className="w-full lg:w-[50%]">
          <form onSubmit={handleSubmit}>
            <div className="header flex flex-col sm:flex-row justify-between px-4 sm:px-5">
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
              <div className="right gap-2 px-4 sm:px-10 text-white flex flex-col sm:flex-row items-center">
                <button
                  className="rounded-full bg-black cursor-pointer px-5 py-2 text-white text-sm font-semibold flex items-center mb-2 sm:mb-0"
                  onMouseDown={() => navigate('/campaigns')}
                  type="button"
                >
                  Back
                </button>
                <button
                  className={`rounded-full px-5 py-2 text-white text-sm font-semibold flex items-center 
                    ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 cursor-pointer'}`}
                  disabled={isDisabled}
                  type="submit"
                >
                  {loading ? 'Sending...' : 'Create Campaigns'}
                </button>
              </div>
            </div>

            <div className="container flex flex-col w-full max-h-[500px]">
              {!isConnected && (
                <div className="w-full sm:md:w-[50%] p-4 sm:p-8 overflow-y-auto">
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
                        } px-3 py-2 text-sm font-semibold text-white shadow-sm mx-4 sm:mx-10`}
                        disabled={isConnected}
                      >
                        {isConnected ? 'Connected WhatsApp Successfully' : 'Connect WhatsApp Business'}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              {isConnected && (
                <div className="w-full p-4 sm:p-8 overflow-y-auto">
                  <div className="grid gap-x-4 sm:gap-x-6 gap-y-4 sm:grid-cols-6 mb-8 capitalize">
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
                      <label htmlFor="template_name" className="block text-sm leading-6 text-gray-900">
                        Templates
                      </label>
                      <select
                        className="block w-full rounded-md ring-gray-300 bg-white border-0 shadow-sm outline-none ring-1 ring-inset py-1.5 px-4 text-sm"
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
                        className="block w-full rounded-md ring-gray-300 bg-white border-0 shadow-sm outline-none ring-1 ring-inset py-1.5 px-4 text-sm"
                        value={recipientType}
                        onChange={handleRecipientTypeChange}
                        name="recipient_type"
                      >
                        <option value="group">Group/All Contacts</option>
                        <option value="single">Single Contact</option>
                        <option value="segment">Segment</option>
                      </select>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="recipients" className="block text-sm leading-6 text-gray-900">
                        {recipientType === 'single' ? 'Phone Number' : recipientType === 'segment' ? 'Segment' : 'Contacts'}
                      </label>
                      {recipientType === 'group' ? (
                        <select
                          className="block w-full rounded-md ring-gray-300 bg-white border-0 shadow-sm outline-none ring-1 ring-inset py-1.5 px-4 text-sm"
                          value={formData.recipients}
                          onChange={handleChange}
                          name="recipients"
                          id="recipients"
                        >
                          <option value="" disabled>Select Contacts</option>
                          <option value="all_contacts">All Contacts</option>
                          {groups.map((group, index) => (
                            <option key={index} value={group.group_name}>
                              {group.group_name}
                            </option>
                          ))}
                        </select>
                      ) : recipientType === 'segment' ? (
                        <select
                          className="block w-full rounded-md ring-gray-300 bg-white border-0 shadow-sm outline-none ring-1 ring-inset py-1.5 px-4 text-sm"
                          value={formData.recipients}
                          onChange={handleChange}
                          name="recipients"
                          id="recipients"
                        >
                          <option value="" disabled>Select Segment</option>
                          {segments.map((segment, index) => (
                            <option key={index} value={segment.segment_id}>
                              {segment.name}
                            </option>
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

                    <div className="sm:col-span-6">
                      <label className="block text-sm leading-6 text-gray-900">Schedule Type</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="schedule_type"
                            value="immediate"
                            checked={scheduleType === 'immediate'}
                            onChange={handleScheduleTypeChange}
                            className="mr-2"
                          />
                          Send Immediately
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="schedule_type"
                            value="scheduled"
                            checked={scheduleType === 'scheduled'}
                            onChange={handleScheduleTypeChange}
                            className="mr-2"
                          />
                          Schedule Campaign
                        </label>
                      </div>
                    </div>

                    {scheduleType === 'scheduled' && (
                      <div className="sm:col-span-6">
                        <label htmlFor="scheduled_time" className="block text-sm leading-6 text-gray-900">
                          Scheduled Date and Time (IST)
                        </label>
                        <input
                          name="scheduled_time"
                          value={formData.scheduled_time}
                          onChange={handleChange}
                          className="block w-full bg-white rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                          type="datetime-local"
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                    )}

                    <VariableSubstitutionSection
                      variables={variables}
                      formData={formData}
                      setFormData={setFormData}
                    />

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

        {/* Template Preview Section */}
        <div className="hidden lg:block lg:w-[50%] p-4 sm:p-8">
          <TemplateViewModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            template={selectedTemplate}
          />
        </div>
      </div>
    </RequireSubscription>
  );
}

export default CreateCampaigns;