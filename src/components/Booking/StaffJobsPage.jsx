import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, Search, Eye, Edit, Calendar, User, FileText } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import JobDetailModal from './JobDetailModal';
import CreateJobForm from './CreateJobForm';
import EditJobModal from './EditJobModal';

const StaffJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [staffId, setStaffId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchStaffAndJobs = async () => {
      setLoading(true);
      try {
        // Fetch jobs assigned to this staff
        const jobsResponse = await axios.get(`${API_BASE_URL}/staff/my-jobs/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setJobs(jobsResponse.data);

        // ✅ Fetch all service types to get status choices
        const serviceResponse = await axios.get(`${API_BASE_URL}/service-types/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setServiceTypes(serviceResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setJobs([
          {
            id: 2,
            name: 'Nasir',
            service_type_name: 'Laptop Repair',
            status: 'Pending',
            assigned_staff_name: 'Hera',
            created_at: '2025-10-03T10:39:30.385353Z',
            phone: '+918093537813',
            email: '',
            details: {
              issue: 'Screen not working',
              model: 'Inspiron 15',
              device_brand: 'Dell',
              serial_number: 'ABC1234',
            },
          },
        ]);
      }
      setLoading(false);
    };
    fetchStaffAndJobs();
  }, [token]);

  const handleUpdateJob = (updatedJob) => {
    setJobs(jobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)));
  };

  const getStatusColor = (status) => {
    const colors = {
      'In Progress': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
      'Completed': 'bg-green-500/20 text-green-400 border border-green-500/30',
      'Received': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      'Pending': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      'new': 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  };

  const filteredJobs = jobs.filter(
    (job) =>
      (statusFilter === 'all' || job.status === statusFilter) &&
      (searchQuery === '' ||
        job.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.service_type_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `JOB-${String(job.id).padStart(3, '0')}`.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 bg-gray-900">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Assigned Jobs</h1>
          <p className="text-sm sm:text-base text-gray-400">View and manage your assigned service jobs</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-5 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Assigned</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">{jobs.length}</h3>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Briefcase className="text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 sm:p-5 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">In Progress</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  {jobs.filter((j) => j.status === 'In Progress').length}
                </h3>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-lg text-xl">⏱</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 sm:p-5 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Completed</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  {jobs.filter((j) => j.status === 'Completed').length}
                </h3>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <CheckCircle className="text-green-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 bg-gray-700/50 rounded-lg px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <Search className="text-gray-400 flex-shrink-0" size={20} />
              <input
                type="text"
                placeholder="Search jobs, customers, or job IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent focus:outline-none text-white placeholder-gray-500 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-700 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm cursor-pointer transition-all"
            >
              <option value="all">All Statuses</option>
              {serviceTypes.map((service) =>
                service.status_choices?.map((status) => (
                  <option key={`${service.id}-${status}`} value={status}>
                    {status}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-white text-lg">
              Assigned Jobs <span className="text-gray-400 text-sm ml-2">({filteredJobs.length})</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Job Details</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Customer</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-white mb-0.5">{job.name}</p>
                          <p className="text-sm text-gray-400">JOB-{String(job.id).padStart(3, '0')}</p>
                          <p className="text-xs text-gray-500 mt-1 inline-block px-2 py-0.5 bg-gray-700 rounded">
                            {job.service_type_name || 'Unknown'}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-sm font-medium shadow-lg">
                            {job.name?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                          <span className="text-white font-medium">{job.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium inline-block ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Calendar size={16} className="text-gray-400" />
                          <span>{job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setShowDetailModal(job)}
                            className="p-2 hover:bg-gray-600 rounded-lg transition-colors text-gray-300 hover:text-white"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => setShowEditModal(job)}
                            className="p-2 hover:bg-gray-600 rounded-lg transition-colors text-gray-300 hover:text-white"
                            title="Edit Job"
                          >
                            <Edit size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <FileText className="mx-auto text-gray-600 mb-3" size={48} />
                      <p className="text-gray-400 font-medium">No jobs found</p>
                      <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filter</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <h3 className="font-semibold text-white">
              Jobs <span className="text-gray-400 text-sm">({filteredJobs.length})</span>
            </h3>
          </div>

          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{job.name}</h4>
                    <p className="text-xs text-gray-400 mb-2">JOB-{String(job.id).padStart(3, '0')}</p>
                    <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                      {job.service_type_name || 'Unknown'}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>

                <div className="space-y-2 mb-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <User size={14} className="text-gray-400" />
                    <span>{job.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar size={14} className="text-gray-400" />
                    <span>{job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDetailModal(job)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => setShowEditModal(job)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
              <FileText className="mx-auto text-gray-600 mb-3" size={48} />
              <h3 className="text-lg font-semibold text-white mb-2">No jobs found</h3>
              <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Modals */}
        {showDetailModal && (
          <JobDetailModal jobId={showDetailModal} onClose={() => setShowDetailModal(null)} />
        )}
        {showEditModal && (
          <EditJobModal jobId={showEditModal} onClose={() => setShowEditModal(null)} onUpdate={handleUpdateJob} />
        )}
      </div>
    </div>
  );
};

export default StaffJobsPage;