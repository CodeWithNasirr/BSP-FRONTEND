import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';

const CreateJobForm = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service_type: '',
    status: 'Pending',
    details: {},
    assigned_staff: '',
  });
  const [serviceTypes, setServiceTypes] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const serviceResponse = await axios.get(`${API_BASE_URL}/service-types/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setServiceTypes(serviceResponse.data);
        const staffResponse = await axios.get(`${API_BASE_URL}/staff/list/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setStaffList(staffResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setServiceTypes([{ id: 1, name: 'Laptop Repair', detail_fields: ['device_brand', 'model', 'serial_number', 'issue'] }]);
        setStaffList([{ id: 1, username: 'Mike Chen' }, { id: 2, username: 'Lisa Park' }]);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
    ...formData,
    service_type: formData.service_type ? parseInt(formData.service_type) : null,
    assigned_staff: formData.assigned_staff ? parseInt(formData.assigned_staff) : null,
  };

  onSubmit(payload);
  };
 
  const selectedService = serviceTypes.find((s) => s.id === parseInt(formData.service_type));

  return (
    <div className="h-screen overflow-y-auto bg-gray-900 p-4 sm:p-6">
  <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-2xl mx-auto">
    <h2 className="text-2xl font-bold text-white text-center">Create New Job</h2>

    {/* 🧍 Customer Information */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

    {/* 🧰 Service Type */}
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">Service Type</label>
      <select
        name="service_type"
        value={formData.service_type}
        onChange={handleServiceTypeChange}
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        required
      >
        <option value="">Select a service type</option>
        {serviceTypes.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name}
          </option>
        ))}
      </select>
    </div>

    {/* 📝 Dynamic Service Details */}
    {selectedService && selectedService.detail_fields?.length > 0 && (
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Service Details</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedService.detail_fields.map((field) => (
            <div key={field}>
              <label className="block text-sm text-gray-400 capitalize mb-1">
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
      </div>
    )}

    {/* 👷 Assigned Staff */}
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">Assigned Staff</label>
      <select
        name="assigned_staff"
        value={formData.assigned_staff}
        onChange={handleChange}
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        required
      >
        <option value="">Select a staff member</option>
        {staffList.map((staff) => (
          <option key={staff.id} value={staff.id}>
            {staff.username}
          </option>
        ))}
      </select>
    </div>

    {/* 🟦 Buttons */}
    <div className="flex flex-col sm:flex-row gap-3 pb-4">
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
        Create Job
      </button>
    </div>
  </form>
</div>

  );
};

export default CreateJobForm;