import React, { useState, useEffect, } from 'react';
import API_BASE_URL from '../../config';
import { Link } from "react-router-dom"
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
  const [showAllContacts, setShowAllContacts] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);

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

  const fetchFieldsAndOperators = async () => {
    try {
      const response = await apiCall(`${API_BASE_URL}/api/segments/fields-operators/`);
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

  const fetchSegmentContacts = async (segmentId, page = 1, pageSize = 20) => {
    try {
      setLoading(true);
      const response = await apiCall(
        `${API_BASE_URL}/api/segments/${segmentId}/contacts/?page=${page}&page_size=${pageSize}`
      );
      setPaginatedContacts(response.contacts || []);
      setPagination(response.pagination);
      setShowAllContacts(true);
      setSelectedSegmentId(segmentId);
    } catch (error) {
      showToast('Failed to fetch segment contacts', 'error');
      setPaginatedContacts([]);
      setShowAllContacts(false);
    } finally {
      setLoading(false);
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
    setShowAllContacts(false);
    setPaginatedContacts([]);
    setSelectedSegmentId(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchSegmentContacts(selectedSegmentId, newPage, pagination.page_size);
    }
  };

  const [loadingRFM, setLoadingRFM] = useState(false);
  const handleRunRFM = async () => {
    try {
      setLoadingRFM(true); // ⏳ start loading
      const response = await apiCall(`${API_BASE_URL}/api/segments/run-rfm/`, {
        method: "POST",
        body: JSON.stringify({}), // optional payload
      });

      showToast(response.message, "success");

      // Refresh segments list
      const segmentsResponse = await apiCall(`${API_BASE_URL}/api/segments/`);
      setSegments(segmentsResponse.data || []);
    } catch (error) {
      showToast(
        `${error.message || error} - Failed to run RFM segmentation`,
        "error"
      );
    } finally {
      setLoadingRFM(false); // ✅ stop loading
    }
  };

 
  return (
    <div className="max-w-full mx-auto p-4 sm:p-6 max-h-screen overflow-y-auto bg-gray-50">
      {/* Toast Notification */}
      {toast.message && (
        <div
          className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            toast.type === 'error'
              ? 'bg-red-600 text-white'
              : toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white'
          } sm:max-w-sm w-[calc(100%-2rem)]`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base">{toast.message}</span>
            <button
                onClick={() => setToast({ message: '', type: '' })}
                className="ml-2 text-white hover:text-gray-200"
              >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Audience Segments</h1>
        <div className="flex space-x-2 mt-3 sm:mt-0">

            <Link to={"/rfm-preview"}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition duration-200 shadow-sm"
          >
            Preview RFM
          </Link>

          <button
            onClick={handleRunRFM}
            disabled={loadingRFM}
            className={`${
              loadingRFM ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            } text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition duration-200 shadow-sm`}
          >
            {loadingRFM ? "Running..." : "Run RFM Segmentation"}
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition duration-200 shadow-sm"
          >
            Create Segment
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white shadow-lg rounded-lg mb-6">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {editingSegment ? 'Edit Segment' : 'Create New Segment'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Segment Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  placeholder="Enter segment name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition Logic</label>
                <div className="flex flex-col sm:flex-row sm:space-x-4">
                  <label className="flex items-center mb-2 sm:mb-0">
                    <input
                      type="radio"
                      value="AND"
                      checked={formData.rules.logic === 'AND'}
                      onChange={(e) => handleRulesChange({ ...formData.rules, logic: e.target.value })}
                      className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm sm:text-base">AND (All conditions must match)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="OR"
                      checked={formData.rules.logic === 'OR'}
                      onChange={(e) => handleRulesChange({ ...formData.rules, logic: e.target.value })}
                      className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm sm:text-base">OR (Any condition can match)</span>
                  </label>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <label className="block text-sm font-medium text-gray-700">Conditions</label>
                  <button
                    type="button"
                    onClick={addCondition}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm transition duration-200"
                  >
                    Add Condition
                  </button>
                </div>
                {formData.rules.conditions.map((condition, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <select
                      value={condition.field}
                      onChange={(e) => updateCondition(index, 'field', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    >
                      <option value="">Select field...</option>
                      {availableFields.map((field) => (
                        <option key={field.key} value={field.key}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={condition.operator}
                      onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                      disabled={!condition.field}
                    >
                      <option value="">Select operator...</option>
                      {getOperatorsForField(condition.field).map((op) => (
                        <option key={op.key} value={op.key}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={condition.value}
                      onChange={(e) => updateCondition(index, 'value', e.target.value)}
                      placeholder="Enter value..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    />
                    {formData.rules.conditions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCondition(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {previewData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Preview</h4>
                  <p className="text-blue-800 text-sm sm:text-base">
                    This segment will match <strong>{previewData.count}</strong> contacts
                  </p>
                  {previewData.preview_contacts && previewData.preview_contacts.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-blue-700 mb-1">Sample contacts:</p>
                      <ul className="text-sm text-blue-600">
                        {previewData.preview_contacts.map((contact, i) => (
                          <li key={i}>• {contact.full_name} ({contact.phone_number})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {previewData.count > 0 && (
                    <button
                      type="button"
                      onClick={() => fetchSegmentContacts(editingSegment ? editingSegment.segment_id : selectedSegmentId)}
                      className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm transition duration-200"
                    >
                      View All Contacts
                    </button>
                  )}
                </div>
              )}
              {showAllContacts && paginatedContacts.length > 0 && (
                <div className="mt-6 bg-white shadow-lg rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">All Matching Contacts</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Email</th>
                          <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Location</th>
                          <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Purchases</th>
                          <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Tags</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedContacts.map((contact) => (
                          <tr key={contact.id}>
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-900">{contact.full_name}</td>
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-900">{contact.phone_number}</td>
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-900 hidden sm:table-cell">{contact.email || 'N/A'}</td>
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-900 hidden sm:table-cell">{contact.location || 'N/A'}</td>
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-900">{contact.total_purchases}</td>
                            <td className="px-3 sm:px-4 py-2 text-sm text-gray-900 hidden sm:table-cell">{contact.tags.join(', ') || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600">
                    <div className="mb-2 sm:mb-0">
                      Showing {pagination.page_size * (pagination.page - 1) + 1} to{' '}
                      {Math.min(pagination.page_size * pagination.page, pagination.total_count)} of{' '}
                      {pagination.total_count} contacts
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.has_previous}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 transition duration-200"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.has_next}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 transition duration-200"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6 pt-4 sm:pt-6 border-t">
              <button
                type="button"
                onClick={resetForm}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm sm:text-base transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm sm:text-base transition duration-200"
              >
                {loading ? 'Saving...' : editingSegment ? 'Update Segment' : 'Create Segment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Segments List */}
      {!showCreateForm && (
        <div className="bg-white shadow-lg rounded-lg">
          {loading ? (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">Loading segments...</div>
          ) : segments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
              No segments found. Create your first segment to get started.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {segments.map((segment) => (
                <div key={segment.segment_id} className="p-4 sm:p-6 hover:bg-gray-50 transition duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">{segment.name}</h3>
                      {segment.description && (
                        <p className="mt-1 text-sm text-gray-600">{segment.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                        <span>{segment.contact_count} contacts</span>
                        <span>Created {new Date(segment.created_at).toLocaleDateString()}</span>
                        <span>Logic: {segment.rules.logic}</span>
                        <span>{segment.rules.conditions.length} conditions</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3 sm:mt-0">
                      <button
                        onClick={() => handleEdit(segment)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium transition duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(segment.segment_id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium transition duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SegmentManager;