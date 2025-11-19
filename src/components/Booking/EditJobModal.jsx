import React, { useState, useEffect,useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { Context } from '../context/Context';
  
const EditJobModal = ({ jobId, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service_type: '',
    status: '',
    details: {},
    assigned_staff: '',
    staff_issue: "",   // ✅ ADD THIS
  });
  const [serviceTypes, setServiceTypes] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('authToken');
  const { userInfo } = useContext(Context);
  
  // ✅ Pre-fill the form with jobId data (jobId is actually the job object)
  useEffect(() => {
    if (jobId) {
      setFormData({
        name: jobId.name || '',
        phone: jobId.phone || '',
        email: jobId.email || '',
        service_type: jobId.service_type  || '', // adjust based on your API
        status: jobId.status || '',
        details: jobId.details || {},
        assigned_staff: jobId.assigned_staff || '',
        details: jobId.details || {},
       
        
      });
    }
  }, [jobId]);

 useEffect(() => {
    const fetchData = async () => {
      // setLoading(true);
      try {
        const serviceResponse = await axios.get(`${API_BASE_URL}/service-types/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setServiceTypes(serviceResponse.data);
        // ✅ Conditionally fetch staff list only if not staff
        if (userInfo?.role !== 'staff') {
          const staffResponse = await axios.get(`${API_BASE_URL}/staff/list/`, {
            headers: { Authorization: `Token ${token}` },
          });
          setStaffList(staffResponse.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);

      }
      setLoading(false);
    };
    fetchData();
  }, [token]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDetailChange = (field, value) => {
    setFormData({
      ...formData,
      details: { ...formData.details, [field]: value },
    });
  };

  const handleServiceTypeChange = (e) => {
    const serviceId = e.target.value;
    setFormData({
      ...formData,
      service_type: serviceId,
      details: {}, // Reset details when service type changes
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(`${API_BASE_URL}/jobs/${jobId.id}/`, formData, {
        headers: { Authorization: `Token ${token}` },
      });
      onUpdate(response.data);
      onClose();
      alert('✅ Job updated successfully!');
    } catch (err) {
      console.error('Error updating job:', err);
      alert('❌ Failed to update job');
    }
  };

  const selectedService = serviceTypes.find((s) => s.id === parseInt(formData.service_type));
  
  if (loading) return <div className="text-center py-12 text-white">Loading...</div>;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
  <div className="bg-gray-800 rounded-lg w-full max-w-2xl h-screen md:h-auto max-h-[90vh] overflow-y-auto border border-gray-700 shadow-lg">
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-white text-center">Edit Job</h2>

      {/* Customer Information */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Customer Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter customer name"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Email (Optional)</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        />
      </div>

      {/* Service Type */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Service Type</label>
        <select
          name="service_type"
          value={formData.service_type}
          onChange={handleServiceTypeChange}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          required
        >
          {/* <option value="">Select a service type</option> */}
          {serviceTypes.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          required
        >
          {serviceTypes.map((service) =>
          service.status_choices.map((status) => (
            <option key={`${service.id}-${status}`} value={status}>
              {status}
            </option>
          ))
        )}
        </select>
      </div>

      {/* Dynamic Service Details */}
      {selectedService && selectedService.detail_fields?.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Service Details</label>
          {selectedService.detail_fields.map((field) => (
            <div key={field} className="mb-2">
              <label className="block text-sm text-gray-400 capitalize">
                {field.replace('_', ' ')}
              </label>
              <input
                type="text"
                value={formData.details[field] || ''}
                onChange={(e) => handleDetailChange(field, e.target.value)}
                placeholder={`Enter ${field.replace('_', ' ')}`}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              />
            </div>
          ))}
        </div>
      )}
    {/* Staff Issue (STAFF ONLY) */}
    {userInfo?.role === "staff" && (
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Staff Issue Description
        </label>
        <textarea
          name="staff_issue"
          value={formData.staff_issue}
          onChange={handleChange}
          placeholder="Describe issue found by staff..."
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          rows={3}
        ></textarea>
      </div>
    )}

      {/* ✅ Assigned Staff — only visible for Admin or Manager, not Staff */}
    {userInfo?.role !== 'staff' && (
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Assigned Staff</label>
        <select
          name="assigned_staff"
          value={formData.assigned_staff}
          onChange={handleChange}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          required
        >
          {staffList.map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.username}
            </option>
          ))}
        </select>
      </div>
    )}

      {/* Actions */}
      <div className="flex gap-3 sticky bottom-0 bg-gray-800 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg transition-colors text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors text-white"
        >
          Save Changes
        </button>
      </div>
    </form>
  </div>
</div>

  );
};

export default EditJobModal;