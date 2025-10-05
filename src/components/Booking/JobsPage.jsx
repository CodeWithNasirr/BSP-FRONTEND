import React, { useState, useEffect, useContext } from 'react';
import { Briefcase, CheckCircle, Search, Plus, Eye, Edit, DeleteIcon } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import CreateJobForm from './CreateJobForm';
import JobDetailModal from './JobDetailModal';
import EditJobModal from './EditJobModal';
import { Context } from '../context/Context';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const token = localStorage.getItem('authToken');
  const [serviceTypes, setServiceTypes] = useState([]);
  const { userInfo } = useContext(Context);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const data = await axios.get(`${API_BASE_URL}/jobs/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setJobs(data.data);

        const serviceResponse = await axios.get(`${API_BASE_URL}/service-types/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setServiceTypes(serviceResponse.data);
      } catch (err) {
        console.error('Error loading jobs:', err);
      }
      setLoading(false);
    };
    loadJobs();
  }, [token]);

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/jobs/${jobId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setJobs(jobs.filter((job) => job.id !== jobId));
      alert('🗑️ Job deleted successfully');
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  const handleCreateJob = async (jobData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/jobs/`, jobData, {
        headers: { Authorization: `Token ${token}` },
      });
      setJobs([...jobs, response.data]);
      setShowJobModal(false);
      alert('✅ Job created successfully!');
    } catch (err) {
      console.error('Error creating job:', err);
      alert('❌ Failed to create job');
    }
  };

  const handleUpdateJob = (updatedJob) => {
    setJobs(jobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)));
  };

  const getStatusColor = (status) => {
    const colors = {
      'In Progress': 'bg-orange-500/20 text-orange-400',
      'Completed': 'bg-green-500/20 text-green-400',
      'Recieved': 'bg-purple-500/20 text-purple-400',
      'Pending': 'bg-purple-500/20 text-purple-400',
      new: 'bg-blue-500/20 text-blue-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-500/20 text-red-400',
      medium: 'bg-orange-500/20 text-orange-400',
      low: 'bg-green-500/20 text-green-400',
    };
    return colors[priority] || 'bg-gray-500/20 text-gray-400';
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    const matchesDate = dateFilter ? new Date(job.created_at).toLocaleDateString() === new Date(dateFilter).toLocaleDateString() : true;
    const matchesSearch = searchQuery
      ? job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `JOB-${String(job.id).padStart(3, '0')}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.assigned_staff_name && job.assigned_staff_name.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesStatus && matchesPriority && matchesDate && matchesSearch;
  });

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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Jobs & Service Orders</h1>
          <p className="text-gray-400">Track and manage all service jobs and work orders</p>
        </div>
        <button
          onClick={() => setShowJobModal(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          <span>Create New Job</span>
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Jobs</p>
            <h3 className="text-2xl font-bold text-white">{jobs.length}</h3>
          </div>
          <Briefcase className="text-blue-400" size={28} />
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">In Progress</p>
            <h3 className="text-2xl font-bold text-white">{jobs.filter((j) => j.status === 'In Progress').length}</h3>
          </div>
          <div className="text-orange-400 bg-orange-500/20 p-2 rounded-lg">⏱</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Completed</p>
            <h3 className="text-2xl font-bold text-white">{jobs.filter((j) => j.status === 'Completed').length}</h3>
          </div>
          <CheckCircle className="text-green-400" size={28} />
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center gap-4">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search jobs, customers, or job IDs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent focus:outline-none text-white"
        />
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
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-gray-700 px-4 py-2 rounded-lg focus:outline-none text-white"
        />
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-white">All Jobs ({filteredJobs.length})</h3>
          <button className="text-sm text-gray-400 hover:text-white">Actions</button>
        </div>
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Job Details</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Customer</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Assigned Staff</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Due Date</th>
              <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="p-4">
                  <div>
                    <p className="font-medium text-white">{job.name}</p>
                    <p className="text-sm text-gray-400">JOB-{String(job.id).padStart(3, '0')}</p>
                    <p className="text-xs text-gray-500">{job.service_type_name || 'Unknown'}</p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm">
                      {job.name?.charAt(0) || 'S'}
                    </div>
                    <span className="text-white">{job.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusColor(
                      job.status
                    )}`}
                  >
                    {job.status === 'In Progress' && '⏱'}
                    {job.status === 'Completed' && '✓'}
                    {job.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs">
                      {job.assigned_staff_name?.charAt(0) || 'X'}
                    </div>
                    <span className="text-sm text-white">{job.assigned_staff_name || 'None'}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-sm text-white">
                    <span>📅</span>
                    <span>{job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowDetailModal(job)}
                      className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => setShowEditModal(job)}
                      className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                      title="Edit Job"
                    >
                      <Edit size={16} />
                    </button>
                    {userInfo?.role !== 'staff' && (
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <DeleteIcon size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showJobModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl border border-gray-700">
            <CreateJobForm onSubmit={handleCreateJob} onClose={() => setShowJobModal(false)} />
          </div>
        </div>
      )}

      {showDetailModal && (
        <JobDetailModal jobId={showDetailModal} onClose={() => setShowDetailModal(null)} />
      )}

      {showEditModal && (
        <EditJobModal
          jobId={showEditModal}
          onClose={() => setShowEditModal(null)}
          onUpdate={handleUpdateJob}
        />
      )}
    </div>
  );
};

export default JobsPage;