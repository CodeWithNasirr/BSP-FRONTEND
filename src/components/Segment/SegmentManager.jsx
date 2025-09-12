import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config';
import { Link } from "react-router-dom";

const SegmentManager = () => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [availableFields, setAvailableFields] = useState([]);
  const [availableOperators, setAvailableOperators] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [paginatedContacts, setPaginatedContacts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total_count: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  });
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);
  const [selectedSegmentName, setSelectedSegmentName] = useState('');
  const [contactsLoading, setContactsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: {
      logic: 'AND',
      conditions: [{ field: '', operator: '', value: '' }],
    },
  });
  const token = localStorage?.getItem('authToken');

  // Toast notification helper
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  // API helper function
  const apiCall = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
          ...options.headers,
        },
        ...options,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchSegments();
    fetchFieldsAndOperators();
  }, []);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`${API_BASE_URL}/api/segments/`);
      setSegments(response.data || []);
    } catch (error) {
      showToast('Failed to fetch segments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFieldsAndOperators = async (selectedField) => {
    try {
      const response = await apiCall(`${API_BASE_URL}/api/segments/fields-operators/?field=${selectedField}`);
      setAvailableFields(response.fields || []);
      setAvailableOperators(response.operators || []);
    } catch (error) {
      console.error('Failed to fetch fields and operators');
    }
  };

  const previewSegment = async (rules) => {
    try {
      const response = await apiCall(`${API_BASE_URL}/api/segments/preview/`, {
        method: 'POST',
        body: JSON.stringify({ rules }),
      });
      setPreviewData(response);
    } catch (error) {
      showToast('Failed to preview segment', 'error');
      setPreviewData(null);
    }
  };

  const fetchSegmentContacts = async (segmentId, segmentName, page = 1, pageSize = 20) => {
    try {
      setContactsLoading(true);
      const response = await apiCall(
        `${API_BASE_URL}/api/segments/${segmentId}/contacts/?page=${page}&page_size=${pageSize}`
      );
      setPaginatedContacts(response.contacts || []);
      setPagination(response.pagination);
      setSelectedSegmentId(segmentId);
      setSelectedSegmentName(segmentName);
      setShowContactsModal(true);
    } catch (error) {
      showToast('Failed to fetch segment contacts', 'error');
      setPaginatedContacts([]);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRulesChange = (newRules) => {
    setFormData((prev) => ({ ...prev, rules: newRules }));
    if (newRules.conditions.some((c) => c.field && c.operator && c.value)) {
      previewSegment(newRules);
    }
  };

  const addCondition = () => {
    const newRules = { ...formData.rules };
    newRules.conditions.push({ field: '', operator: '', value: '' });
    handleRulesChange(newRules);
  };

  const removeCondition = (index) => {
    const newRules = { ...formData.rules };
    newRules.conditions.splice(index, 1);
    if (newRules.conditions.length === 0) {
      newRules.conditions.push({ field: '', operator: '', value: '' });
    }
    handleRulesChange(newRules);
  };

  const updateCondition = (index, field, value) => {
    const newRules = { ...formData.rules };
    newRules.conditions[index][field] = value;
    handleRulesChange(newRules);
  };

  const getOperatorsForField = (fieldKey) => {
    const field = availableFields.find((f) => f.key === fieldKey);
    if (!field) return availableOperators;
    return availableOperators.filter((op) => op.types.includes(field.type));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Segment name is required', 'error');
      return;
    }
    const hasValidCondition = formData.rules.conditions.some(
      (c) => c.field && c.operator && c.value
    );
    if (!hasValidCondition) {
      showToast('At least one complete condition is required', 'error');
      return;
    }
    try {
      setLoading(true);
      if (editingSegment) {
        await apiCall(`${API_BASE_URL}/api/segments/${editingSegment.segment_id}/`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        showToast('Segment updated successfully', 'success');
      } else {
        await apiCall(`${API_BASE_URL}/api/segments/`, {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        showToast('Segment created successfully', 'success');
      }
      resetForm();
      fetchSegments();
    } catch (error) {
      showToast(error.message || 'Failed to save segment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (segment) => {
    setEditingSegment(segment);
    setFormData({
      name: segment.name,
      description: segment.description,
      rules: segment.rules,
    });
    setShowCreateForm(true);
    previewSegment(segment.rules);
  };

  const handleDelete = async (segmentId) => {
    if (!window.confirm('Are you sure you want to delete this segment?')) {
      return;
    }
    try {
      await apiCall(`${API_BASE_URL}/api/segments/${segmentId}/`, {
        method: 'DELETE',
      });
      showToast('Segment deleted successfully', 'success');
      fetchSegments();
      if (selectedSegmentId === segmentId) {
        setShowContactsModal(false);
        setPaginatedContacts([]);
        setSelectedSegmentId(null);
        setSelectedSegmentName('');
      }
    } catch (error) {
      showToast('Failed to delete segment', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      rules: {
        logic: 'AND',
        conditions: [{ field: '', operator: '', value: '' }],
      },
    });
    setEditingSegment(null);
    setShowCreateForm(false);
    setPreviewData(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages && selectedSegmentId) {
      fetchSegmentContacts(selectedSegmentId, selectedSegmentName, newPage, pagination.page_size);
    }
  };

  const [loadingRFM, setLoadingRFM] = useState(false);
  const handleRunRFM = async () => {
    try {
      setLoadingRFM(true);
      const response = await apiCall(`${API_BASE_URL}/api/segments/run-rfm/`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      showToast(response.message, "success");
      fetchSegments();
    } catch (error) {
      showToast(
        `${error.message || error} - Failed to run RFM segmentation`,
        "error"
      );
    } finally {
      setLoadingRFM(false);
    }
  };

  const closeContactsModal = () => {
    setShowContactsModal(false);
    setPaginatedContacts([]);
    setSelectedSegmentId(null);
    setSelectedSegmentName('');
    setSearchTerm('');
  };

  // Filter segments based on search
  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toast Notification */}
      {toast.message && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg transition-all duration-300 transform ${
            toast.type === 'error'
              ? 'bg-red-500 text-white'
              : toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-blue-500 text-white'
          } max-w-sm animate-in slide-in-from-right`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToast({ message: '', type: '' })}
              className="ml-4 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
          <div className="sticky top-0 z-40 bg-gradient-to-r from-white to-gray-50 border-b border-gray-200">
            {/* Top Action Bar */}
        <div className="px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Audience Segments
              </h1>
              <p className="text-gray-600">
                Create and manage customer segments for targeted marketing
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/rfm-preview"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Preview RFM
              </Link>
              <button
                onClick={handleRunRFM}
                disabled={loadingRFM}
                className={`${
                  loadingRFM ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transform hover:-translate-y-0.5"
                } text-white px-6 py-3 rounded-xl font-medium transition duration-200 shadow-lg hover:shadow-xl`}
              >
                {loadingRFM ? (
                  <>
                    <svg className="animate-spin w-5 h-5 inline-block mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Running...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Run RFM Segmentation
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-medium transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Create Segment
              </button>
            </div>
          </div>
        </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white shadow-2xl rounded-2xl mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
              <h2 className="text-2xl font-bold text-white">
                {editingSegment ? 'Edit Segment' : 'Create New Segment'}
              </h2>
              <p className="text-indigo-100 mt-1">
                {editingSegment ? 'Update your segment configuration' : 'Define conditions to create a targeted audience'}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Segment Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Enter segment name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      rows={4}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Optional description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Condition Logic</label>
                    <div className="flex space-x-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="AND"
                          checked={formData.rules.logic === 'AND'}
                          onChange={(e) => handleRulesChange({ ...formData.rules, logic: e.target.value })}
                          className="mr-3 h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium">AND (All conditions must match)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="OR"
                          checked={formData.rules.logic === 'OR'}
                          onChange={(e) => handleRulesChange({ ...formData.rules, logic: e.target.value })}
                          className="mr-3 h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium">OR (Any condition can match)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  {previewData && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                      <h4 className="font-bold text-blue-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Live Preview
                      </h4>
                      <p className="text-blue-800 text-lg mb-4">
                        This segment will match <strong className="text-2xl text-blue-900">{previewData.count}</strong> contacts
                      </p>
                      {previewData.preview_contacts && previewData.preview_contacts.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-blue-700">Sample contacts:</p>
                          <div className="space-y-1">
                            {previewData.preview_contacts.map((contact, i) => (
                              <div key={i} className="text-sm text-blue-600 bg-white bg-opacity-50 px-3 py-2 rounded-lg">
                                {contact.full_name} ({contact.phone_number})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <div className="flex justify-between items-center mb-6">
                  <label className="block text-sm font-semibold text-gray-700">Conditions</label>
                  <button
                    type="button"
                    onClick={addCondition}
                    className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-4 py-2 rounded-xl font-medium transition duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Condition
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.rules.conditions.map((condition, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Field</label>
                          <select
                            value={condition.field}
                            onChange={(e) => {
                              const selectedField = e.target.value;
                              updateCondition(index, 'field', selectedField);
                              fetchFieldsAndOperators(selectedField);}}
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          >
                            <option value="">Select field...</option>
                            {availableFields.map((field) => (
                              <option key={field.key} value={field.key}>
                                {field.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Operator</label>
                          <select
                            value={condition.operator}
                            onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            disabled={!condition.field}
                          >
                            <option value="">Select operator...</option>
                            {getOperatorsForField(condition.field).map((op) => (
                              <option key={op.key} value={op.key}>
                                {op.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-2">Value</label>
                            <input
                              type="text"
                              value={condition.value}
                              onChange={(e) => updateCondition(index, 'value', e.target.value)}
                              placeholder="Enter value..."
                              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            />
                          </div>
                          {formData.rules.conditions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCondition(index)}
                              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-8 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? 'Saving...' : editingSegment ? 'Update Segment' : 'Create Segment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Segments List */}
        {!showCreateForm && (
          <div className="bg-white shadow-2xl rounded-2xl flex flex-col h-[80vh]">
          {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 rounded-t-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">Your Segments</h2>
                <div className="relative w-full sm:w-auto">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search segments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl 
                              focus:outline-none focus:ring-2 focus:ring-indigo-500 
                              focus:border-indigo-500 transition-all duration-200
                              w-full sm:w-64"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="text-center py-16">
                <svg className="animate-spin w-8 h-8 mx-auto text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-500 font-medium">Loading segments...</p>
              </div>
            ) : filteredSegments.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {searchTerm ? 'No segments found' : 'No segments yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? `No segments match "${searchTerm}"` : 'Create your first segment to get started with targeted marketing'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-medium transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Create Your First Segment
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredSegments.map((segment) => (
                  <div key={segment.segment_id} className="p-6 hover:bg-gray-50 transition duration-200">
                    <div className="flex flex-col lg:flex-row justify-between items-start">
                      <div className="flex-1 mb-4 lg:mb-0">
                        <div className="flex items-center mb-3">
                          <h3 className="text-xl font-bold text-gray-900 mr-3">{segment.name}</h3>
                          <span className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                            {segment.contact_count} contacts
                          </span>
                        </div>
                        {segment.description && (
                          <p className="text-gray-600 mb-3 leading-relaxed">{segment.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 0v5m0-5v5m0-5H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3" />
                            </svg>
                            Created {new Date(segment.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Logic: {segment.rules.logic}
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            {segment.rules.conditions.length} conditions
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => fetchSegmentContacts(segment.segment_id, segment.name)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          View Contacts
                        </button>
                        <button
                          onClick={() => handleEdit(segment)}
                          className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(segment.segment_id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

      
        {/* Contacts Modal */}
        {showContactsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white flex justify-between items-center sticky top-0 z-10">
                <div>
                  <h3 className="text-lg font-bold">Contacts in "{selectedSegmentName}"</h3>
                  <p className="text-blue-100 text-sm">{pagination.total_count} total contacts found</p>
                </div>
                <button
                  onClick={closeContactsModal}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body with Scroll */}
              <div className="p-4 overflow-y-auto flex-1">
                {contactsLoading ? (
                  <div className="text-center py-10">
                    <svg className="animate-spin w-6 h-6 mx-auto text-indigo-600 mb-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0..." />
                    </svg>
                    <p className="text-gray-500 text-sm">Loading contacts...</p>
                  </div>
                ) : paginatedContacts.length === 0 ? (
                  <div className="text-center py-10">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2..." />
                    </svg>
                    <h3 className="text-base font-semibold text-gray-600 mb-1">No contacts found</h3>
                    <p className="text-gray-500 text-sm">This segment doesn't have any matching contacts.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Location</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Purchases</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Tags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedContacts.map((contact, i) => (
                          <tr key={contact.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            {/* Name + Avatar */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-2">
                                  {contact.full_name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-gray-900">{contact.full_name}</span>
                              </div>
                            </td>
                            
                            {/* Phone */}
                            <td className="px-4 py-3 text-gray-800 font-medium">{contact.phone_number}</td>

                            {/* Email */}
                            <td className="px-4 py-3 text-gray-600">{contact.email || "N/A"}</td>

                            {/* Location */}
                            <td className="px-4 py-3 text-gray-600">{contact.location || "N/A"}</td>

                            {/* Purchases */}
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                {contact.total_purchases} purchases
                              </span>
                            </td>

                            {/* Tags */}
                            <td className="px-4 py-3 text-gray-600">
                              {contact.tags && contact.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {contact.tags.slice(0, 2).map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {contact.tags.length > 2 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                      +{contact.tags.length - 2} more
                                    </span>
                                  )}
                                </div>
                              ) : (
                                "N/A"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer Pagination */}
              <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Showing <b>{pagination.page_size * (pagination.page - 1) + 1}</b> -{" "}
                  <b>{Math.min(pagination.page_size * pagination.page, pagination.total_count)}</b> of{" "}
                  <b>{pagination.total_count}</b>
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.has_previous}
                    className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.has_next}
                    className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SegmentManager;