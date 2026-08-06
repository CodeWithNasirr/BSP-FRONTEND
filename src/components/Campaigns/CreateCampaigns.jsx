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
    template_name: '', campaigns_name: '', recipients: '',
    variable_values: {}, variable_methods: {}, scheduled_time: '',
  });
  const [loading, setLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = localStorage.getItem('authToken');
  const [variables, setVariables] = useState([]);
  const { isConnected, subscriptionStatus } = useContext(Context);
  const isBasicPlan = subscriptionStatus?.is_active && subscriptionStatus?.plan === 'BASIC';

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

  useEffect(() => {
    const isFormComplete = validateForm(formData, scheduleType, selectedTemplate, mediaFile, variables);
    setIsDisabled(!isFormComplete);
  }, [formData, scheduleType, selectedTemplate, mediaFile, variables]);

  const validateForm = (formData, scheduleType, selectedTemplate, mediaFile, requiredVariables = []) => {
    const hasEmptyVariables =
      requiredVariables.length > 0 &&
      requiredVariables.some((varToken) => {
        const val = formData.variable_values?.[varToken];
        return val === '' || val === null || val === undefined;
      });
    const templateRequiresMedia = ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(selectedTemplate?.header_type?.toUpperCase());
    const mediaMissing = templateRequiresMedia && !mediaFile;
    const isFormComplete =
      formData.template_name.trim() !== '' &&
      formData.campaigns_name.trim() !== '' &&
      formData.recipients.trim() !== '' &&
      !hasEmptyVariables &&
      !mediaMissing &&
      (scheduleType === 'immediate' || (scheduleType === 'scheduled' && formData.scheduled_time?.trim() !== ''));
    return isFormComplete;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };
      const candidateTemplate = templates.find((t) => t.template_name === updatedData.template_name) || selectedTemplate;
      let candidateVariables = variables;
      if (name === 'template_name') {
        if (candidateTemplate?.body_text) {
          const regex = /{{\d+}}/g;
          candidateVariables = [...new Set(candidateTemplate.body_text.match(regex) || [])];
        } else {
          candidateVariables = [];
        }
      }
      const isFormComplete = validateForm(updatedData, scheduleType, candidateTemplate, mediaFile, candidateVariables);
      setIsDisabled(!isFormComplete);
      return updatedData;
    });
  };

  const handleRecipientTypeChange = (e) => {
    setRecipientType(e.target.value);
    setFormData((prev) => ({ ...prev, recipients: '' }));
  };

  const handleScheduleTypeChange = (e) => {
    const newSchedule = e.target.value;
    setScheduleType(newSchedule);
    setFormData((prev) => {
      const updatedData = { ...prev, scheduled_time: '' };
      const isFormComplete = validateForm(updatedData, newSchedule, selectedTemplate, mediaFile);
      setIsDisabled(!isFormComplete);
      return updatedData;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const headerType = selectedTemplate?.header_type?.toUpperCase();
    const isValidType =
      (headerType === 'IMAGE' && file.type.startsWith('image/')) ||
      (headerType === 'VIDEO' && file.type.startsWith('video/')) ||
      (headerType === 'DOCUMENT' &&
        (file.type === 'application/pdf' || file.type === 'application/msword' ||
         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
         file.type === 'text/plain' || file.type === 'application/vnd.ms-excel' ||
         file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
         file.type === 'application/vnd.ms-powerpoint' ||
         file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'));
    if (!isValidType) {
      toast.error(`Please upload a valid ${headerType?.toLowerCase()} file.`);
      setMediaFile(null);
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size should not exceed 5MB');
      setMediaFile(null);
      return;
    }
    setMediaFile(file);
    toast.success(`Image "${file.name}" selected successfully`);
    setFormData((prev) => {
      const isFormComplete = validateForm(prev, scheduleType, selectedTemplate, file);
      setIsDisabled(!isFormComplete);
      return prev;
    });
  };

  useEffect(() => {
    const template = templates.find((t) => t.template_name === formData.template_name);
    setSelectedTemplate(template);
    setIsModalOpen(!!template);
    if (template?.body_text) {
      const regex = /{{\d+}}/g;
      const matches = template.body_text.match(regex) || [];
      setVariables([...new Set(matches)]);
    } else {
      setVariables([]);
    }
  }, [formData.template_name, templates]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('template_name', formData.template_name);
    formDataToSend.append('campaigns_name', formData.campaigns_name);
    formDataToSend.append('recipients', formData.recipients);
    formDataToSend.append('recipient_type', recipientType);
    if (recipientType === 'segment') formDataToSend.append('segment_id', formData.recipients);
    formDataToSend.append('variable_values', JSON.stringify(formData.variable_values));
    formDataToSend.append('variable_methods', JSON.stringify(formData.variable_methods || {}));
    if (scheduleType === 'scheduled' && formData.scheduled_time) {
      formDataToSend.append('scheduled_time', `${formData.scheduled_time}:00+05:30`);
    }
    if (mediaFile) formDataToSend.append('media_file', mediaFile);
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/apis/campaigns/send/`, formDataToSend, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Campaign Created Successfully!');
      setFormData({ template_name: '', campaigns_name: '', recipients: '', variable_values: {}, variable_methods: {}, scheduled_time: '' });
      setMediaFile(null);
      setSelectedTemplate(null);
      setIsModalOpen(false);
      setRecipientType('group');
      setScheduleType('immediate');
      navigate('/campaigns');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const inputBaseClass = `
    block w-full rounded-xl border-0 py-2.5 px-4 text-gray-900 dark:text-gray-100 shadow-sm 
    outline-none ring-1 ring-inset ring-gray-300 dark:ring-white/10 
    bg-white dark:bg-[#111827] placeholder:text-gray-400 dark:placeholder:text-gray-600 
    sm:text-sm sm:leading-6 focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200
  `;
  const selectBaseClass = `
    block w-full rounded-xl border-0 py-2.5 px-4 text-gray-900 dark:text-gray-100 shadow-sm 
    outline-none ring-1 ring-inset ring-gray-300 dark:ring-white/10 
    bg-white dark:bg-[#111827] sm:text-sm sm:leading-6 
    focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200
  `;
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <RequireSubscription>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] flex flex-col lg:flex-row transition-colors duration-300">
        {/* Form Section */}
        <div className="w-full lg:w-[50%] h-screen overflow-y-auto">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="font-bold text-xl text-gray-900 dark:text-white">Message Campaigns</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-400">
                      <path d="M12 11v5m0 5a9 9 0 1 1 0-18a9 9 0 0 1 0 18Zm.05-13v.1h-.1V8h.1Z" />
                    </svg>
                    Create Campaigns
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => navigate('/campaigns')}
                    className="rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-gray-100 px-5 py-2 text-sm font-bold transition-all active:scale-95">
                    Back
                  </button>
                  <button type="submit" disabled={isDisabled || loading}
                    className={`rounded-full px-5 py-2 text-white text-sm font-bold transition-all active:scale-95 shadow-lg
                      ${isDisabled || loading ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed' : 'bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 shadow-indigo-500/25'}`}>
                    {loading ? 'Sending...' : 'Create Campaigns'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              {!isConnected && (
                <div className="max-w-xl mx-auto">
                  <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-6 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48" className="text-gray-600 dark:text-gray-400">
                        <path fill="currentColor" d="M43.634 4.366a1.25 1.25 0 0 1 0 1.768l-4.913 4.913a9.253 9.253 0 0 1-.744 12.244l-3.343 3.343a1.25 1.25 0 0 1-1.768 0l-11.5-11.5a1.25 1.25 0 0 1 0-1.768l3.343-3.343a9.25 9.25 0 0 1 12.244-.743l4.913-4.914a1.25 1.25 0 0 1 1.768 0m-7.611 7.425a6.75 6.75 0 0 0-9.546 0l-2.46 2.459l9.733 9.732l2.46-2.459a6.75 6.75 0 0 0 0-9.546zM9.28 36.953l-4.914 4.913a1.25 1.25 0 0 0 1.768 1.768l4.913-4.913a9.253 9.253 0 0 0 12.244-.744l3.343-3.343a1.25 1.25 0 0 0 0-1.768L25.268 31.5l3.366-3.366a1.25 1.25 0 0 0-1.768-1.768L23.5 29.732L18.268 24.5l3.366-3.366a1.25 1.25 0 0 0-1.768-1.768L16.5 22.732l-1.366-1.366a1.25 1.25 0 0 0-1.768 0l-3.343 3.343a9.25 9.25 0 0 0-.743 12.244m2.51-10.476l2.46-2.46l9.732 9.733l-2.459 2.46a6.75 6.75 0 0 1-9.546 0l-.186-.187a6.75 6.75 0 0 1 0-9.546"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Connect your WhatsApp account</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">You need to connect your WhatsApp account first before you can create a campaign.</p>
                    <Link to={isConnected ? '#' : '/connect-form'} onClick={(e) => isConnected && e.preventDefault()}
                      className={`inline-block rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95
                        ${isConnected ? 'bg-green-500 dark:bg-green-500 hover:bg-green-400' : 'bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400'}`}>
                      {isConnected ? 'Connected WhatsApp Successfully' : 'Connect WhatsApp Business'}
                    </Link>
                  </div>
                </div>
              )}

              {isConnected && (
                <div className="max-w-2xl">
                  <div className="grid gap-x-4 sm:gap-x-6 gap-y-5 sm:grid-cols-6 mb-8">
                    <div className="sm:col-span-6">
                      <label htmlFor="campaigns_name" className={labelClass}>Campaign Name</label>
                      <input name="campaigns_name" value={formData.campaigns_name} onChange={handleChange} className={inputBaseClass} type="text" placeholder="e.g. Summer Sale 2024" />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="template_name" className={labelClass}>Templates</label>
                      <select className={selectBaseClass} value={formData.template_name} onChange={handleChange} name="template_name" id="template_name">
                        <option value="" disabled className="dark:bg-[#111827]">Select a template</option>
                        {templates.map((template, index) => {
                          const isMediaTemplate = ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(template.header_type?.toUpperCase());
                          const disabled = isBasicPlan && isMediaTemplate;
                          return (
                            <option key={index} value={template.template_name} disabled={disabled} className="dark:bg-[#111827]">
                              {template.template_name}{disabled ? ' (Upgrade required)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="recipient_type" className={labelClass}>Recipient Type</label>
                      <select className={selectBaseClass} value={recipientType} onChange={handleRecipientTypeChange} name="recipient_type">
                        <option value="group" className="dark:bg-[#111827]">Group/All Contacts</option>
                        <option value="single" className="dark:bg-[#111827]">Single Contact</option>
                        <option value="segment" className="dark:bg-[#111827]">Segment</option>
                      </select>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="recipients" className={labelClass}>
                        {recipientType === 'single' ? 'Phone Number' : recipientType === 'segment' ? 'Segment' : 'Contacts'}
                      </label>
                      {recipientType === 'group' ? (
                        <select className={selectBaseClass} value={formData.recipients} onChange={handleChange} name="recipients" id="recipients">
                          <option value="" disabled className="dark:bg-[#111827]">Select Contacts</option>
                          <option value="all_contacts" className="dark:bg-[#111827]">All Contacts</option>
                          {groups.map((group, index) => (
                            <option key={index} value={group.group_name} className="dark:bg-[#111827]">{group.group_name}</option>
                          ))}
                        </select>
                      ) : recipientType === 'segment' ? (
                        <select className={selectBaseClass} value={formData.recipients} onChange={handleChange} name="recipients" id="recipients">
                          <option value="" disabled className="dark:bg-[#111827]">Select Segment</option>
                          {segments.map((segment, index) => (
                            <option key={index} value={segment.segment_id} className="dark:bg-[#111827]">{segment.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input name="recipients" value={formData.recipients} onChange={handleChange} className={inputBaseClass} type="text" placeholder="Enter phone number (e.g., +918093537813)" />
                      )}
                    </div>

                    <div className="sm:col-span-6">
                      <label className={labelClass}>Schedule Type</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <label className="flex items-center cursor-pointer">
                          <input type="radio" name="schedule_type" value="immediate" checked={scheduleType === 'immediate'} onChange={handleScheduleTypeChange} className="mr-2 accent-indigo-600 w-4 h-4" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Send Immediately</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input type="radio" name="schedule_type" value="scheduled" checked={scheduleType === 'scheduled'} onChange={handleScheduleTypeChange} className="mr-2 accent-indigo-600 w-4 h-4" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Schedule Campaign</span>
                        </label>
                      </div>
                    </div>

                    {scheduleType === 'scheduled' && (
                      <div className="sm:col-span-6">
                        <label htmlFor="scheduled_time" className={labelClass}>Scheduled Date and Time (IST)</label>
                        <input name="scheduled_time" value={formData.scheduled_time} onChange={handleChange} className={inputBaseClass} type="datetime-local" min={new Date().toISOString().slice(0, 16)} />
                      </div>
                    )}

                    <VariableSubstitutionSection variables={variables} formData={formData} setFormData={setFormData} template={selectedTemplate} />

                    {selectedTemplate && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(selectedTemplate.header_type?.toUpperCase()) && (
                      <div className="sm:col-span-6">
                        <label htmlFor="media_file" className={labelClass}>
                          {selectedTemplate.header_type?.toUpperCase() === 'IMAGE' && 'Upload Image'}
                          {selectedTemplate.header_type?.toUpperCase() === 'VIDEO' && 'Upload Video'}
                          {selectedTemplate.header_type?.toUpperCase() === 'DOCUMENT' && 'Upload Document'}
                        </label>
                        <input name="media_file" type="file"
                          accept={selectedTemplate.header_type?.toUpperCase() === 'IMAGE' ? 'image/*' : selectedTemplate.header_type?.toUpperCase() === 'VIDEO' ? 'video/*' : '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx'}
                          onChange={handleFileChange}
                          className={`${inputBaseClass} py-2 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-50 dark:file:bg-indigo-500/10 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-500/20`}
                        />
                        {mediaFile && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Selected: {mediaFile.name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Template Preview Section */}
        <div className="hidden lg:block lg:w-[50%] bg-gray-100 dark:bg-[#0b1120] border-l border-gray-200 dark:border-white/5 transition-colors">
          <div className="h-full p-6">
            <TemplateViewModal isOpen={isModalOpen} onClose={handleCloseModal} template={selectedTemplate} />
          </div>
        </div>
      </div>
    </RequireSubscription>
  );
}

export default CreateCampaigns;