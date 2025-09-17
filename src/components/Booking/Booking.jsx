import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { Search, Download, Filter, ChevronLeft, ChevronRight, Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Booking = () => {
  const [services, setServices] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterServiceType, setFilterServiceType] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [newBooking, setNewBooking] = useState({ service_type: '', name: '', phone: '', email: '', details: {} });
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [error, setError] = useState(null);
  const servicesPerPage = 5;
  const token = localStorage.getItem("authToken");
  const statusChoices = ["Pending", "In Progress", "Awaiting Parts", "Ready for Pickup", "Delivered", "Cancelled", "Confirmed"];

  useEffect(() => {
    fetchServiceTypes();
    fetchServices();
  }, [filterStatus, filterServiceType, startDate, endDate]);

  const fetchServiceTypes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/service-types/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setServiceTypes(response.data);
      if (response.data.length > 0 && filterServiceType === 'All') {
        setFilterServiceType(response.data[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching service types:', error);
      setError('Failed to load service types');
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/services/`, {
        headers: { Authorization: `Token ${token}` },
        params: {
          status: filterStatus !== 'All' ? filterStatus : undefined,
          service_type: filterServiceType !== 'All' ? filterServiceType : undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined
        }
      });
      setServices(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load bookings');
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      const serviceType = serviceTypes.find(st => st.id === parseInt(newBooking.service_type));
      if (!serviceType) {
        setConfirmationMessage('Invalid service type selected');
        toast.error('Invalid service type selected');
        return;
      }
      const details = {};
      serviceType.detail_fields.forEach(field => {
        details[field] = newBooking.details[field] || '';
      });
      const response = await axios.post(`${API_BASE_URL}/api/services/`, {
        service_type: newBooking.service_type,
        name: newBooking.name,
        phone: newBooking.phone,
        email: newBooking.email,
        details,
        status: 'Pending' // Set initial status to Pending
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      setServices([response.data, ...services]);
      setConfirmationMessage(`Booking #${response.data.id} created successfully!`);
      toast.success(`Booking #${response.data.id} created successfully!`);
      setNewBooking({ service_type: '', name: '', phone: '', email: '', details: {} });
      setTimeout(() => setConfirmationMessage(''), 5000);
    } catch (error) {
      console.error('Error creating booking:', error);
      setConfirmationMessage('Failed to create booking. Please try again.');
      toast.error('Failed to create booking. Please try again.');
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = !searchQuery || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.id.toString().includes(searchQuery) ||
      service.phone.includes(searchQuery) ||
      Object.values(service.details).some(value => 
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      (service.service_type?.name || 'N/A').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: services.length,
    delivered: services.filter(s => s.status === 'Delivered').length,
    confirmed: services.filter(s => s.status === 'Confirmed').length,
    pending: services.filter(s => s.status === 'Pending').length,
    inProgress: services.filter(s => s.status === 'In Progress').length,
    awaitingParts: services.filter(s => s.status === 'Awaiting Parts').length,
    readyForPickup: services.filter(s => s.status === 'Ready for Pickup').length,
    cancelled: services.filter(s => s.status === 'Cancelled').length
  };

  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
  const startIndex = (currentPage - 1) * servicesPerPage;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + servicesPerPage);

  const handleStatusChange = async (serviceId, newStatus) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/services/${serviceId}/update/`, 
        { status: newStatus },
        { headers: { Authorization: `Token ${token}` } }
      );
      setServices(services.map(service => 
        service.id === serviceId ? { ...service, status: newStatus } : service
      ));
      toast.success(`Status updated to ${newStatus} for booking #${serviceId}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      setConfirmationMessage('Failed to update status');
      setTimeout(() => setConfirmationMessage(''), 5000);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/services/export/`, {
        headers: { Authorization: `Token ${token}` },
        params: { 
          status: filterStatus !== 'All' ? filterStatus : undefined,
          service_type: filterServiceType !== 'All' ? filterServiceType : undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined 
        },
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'services.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Services exported successfully');
    } catch (error) {
      console.error('Error exporting services:', error);
      setConfirmationMessage('Failed to export services');
      toast.error('Failed to export services');
      setTimeout(() => setConfirmationMessage(''), 5000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Awaiting Parts':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Ready for Pickup':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          {error}. Please try refreshing the page.
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-2">Track and manage all customer bookings across services</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      {[
        { label: "Total Bookings", value: stats.total, color: "blue" },
        { label: "Confirmed", value: stats.confirmed, color: "purple" },
        { label: "Delivered", value: stats.delivered, color: "green" },
        { label: "Pending", value: stats.pending, color: "yellow" },
        { label: "In Progress", value: stats.inProgress, color: "blue" },
        { label: "Awaiting Parts", value: stats.awaitingParts, color: "orange" },
        { label: "Ready for Pickup", value: stats.readyForPickup, color: "teal" },
      ].map((item, idx) => (
        <div
          key={idx}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-3"
        >
          <div className="flex items-center">
            <div className={`p-2 bg-${item.color}-100 rounded-md`}>
              <CheckCircle className={`h-4 w-4 text-${item.color}-600`} />
            </div>
            <div className="ml-2">
              <h3 className="text-xs font-medium text-gray-600">{item.label}</h3>
              <p className="text-lg font-bold text-gray-900">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>


        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
            <div className="flex items-center mb-6">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Filters & Create Booking</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Service Type</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={filterServiceType}
                  onChange={(e) => {
                    setFilterServiceType(e.target.value);
                    setNewBooking({ ...newBooking, service_type: e.target.value, details: {} });
                  }}
                >
                  <option value="All">All Types</option>
                  {serviceTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Booking Status</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  {statusChoices.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Start Date</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">End Date</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
                 <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Create New Booking</h3>
                <div className="space-y-4">
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={newBooking.service_type}
                    onChange={(e) => setNewBooking({ ...newBooking, service_type: e.target.value, details: {}, name: '', phone: '', email: '' })}
                  >
                    <option value="">Select Service Type</option>
                    {serviceTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  {newBooking.service_type && serviceTypes.find(st => st.id === parseInt(newBooking.service_type))?.detail_fields?.map(field => (
                    <input
                      key={field}
                      type={field === 'email' ? 'email' : 'text'}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={['name', 'phone', 'email'].includes(field) ? newBooking[field] || '' : newBooking.details[field] || ''}
                      onChange={(e) => {
                        if (['name', 'phone', 'email'].includes(field)) {
                          setNewBooking({ ...newBooking, [field]: e.target.value });
                        } else {
                          setNewBooking({
                            ...newBooking,
                            details: { ...newBooking.details, [field]: e.target.value }
                          });
                        }
                      }}
                    />
                  ))}
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium"
                    onClick={handleCreateBooking}
                    disabled={!newBooking.service_type || !newBooking.name || !newBooking.phone}
                  >
                    Create Booking
                  </button>
                </div>
                {confirmationMessage && (
                  <div className={`mt-4 p-3 rounded-lg text-sm ${confirmationMessage.includes('Failed') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {confirmationMessage}
                  </div>
                )}
              </div>
              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center font-medium"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-900">Bookings</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking</th>
                      <th className="w-[25%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="w-[30%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedServices.map((service, index) => (
                      <tr key={service.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{service.id}</div>
                          <div className="text-sm text-gray-500">{new Date(service.created_at).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">{service.service_type?.name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-500">{service.phone}</div>
                          <div className="text-sm text-gray-500">{service.email || 'Not provided'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 max-w-[200px]">
                            {Object.entries(service.details).map(([key, value], idx) => (
                              <div key={idx} className="text-sm text-gray-600 flex items-center group">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 flex-shrink-0"></div>
                                <span className="truncate group-hover:whitespace-normal group-hover:break-words transition-all duration-200">
                                  {key}: {value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(service.status)}`}>
                              {service.status}
                            </span>
                            <select
                              className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(service.status)} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                              value={service.status}
                              onChange={(e) => handleStatusChange(service.id, e.target.value)}
                            >
                              {statusChoices.map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + servicesPerPage, filteredServices.length)} of {filteredServices.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-3 py-1 text-sm font-medium text-gray-700">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;