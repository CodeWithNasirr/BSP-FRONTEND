import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Briefcase, CheckCircle, FileText, Plus } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import CreateServiceForm from './CreateServiceForm'; // Import the CreateServiceForm component
import { Link } from "react-router-dom";
const StatCard = ({ title, value, change, icon: Icon, iconColor }) => (
  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value.toLocaleString()}</h3>
      </div>
      <div className={`p-3 rounded-lg ${iconColor}`}>
        <Icon size={24} />
      </div>
    </div>
    <p className="text-sm text-gray-400">
      <span className="text-green-400">{change}</span> from last {title.includes('Month') ? 'month' : 'yesterday'}
    </p>
  </div>
);

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const loadData = async () => {
      // setLoading(true);
      try {
        const data = await axios.get(`${API_BASE_URL}/dashboard/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setDashboardData(data.data);
        const jobs = await axios.get(`${API_BASE_URL}/jobs/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setRecentJobs(jobs.data.slice(0, 4)); // Limit to 4 recent jobs
      } catch (err) {
        console.error('Error loading dashboard:', err);
       
      }
      // setLoading(false);
    };
    loadData();
  }, [token]);

  const getStatusColor = (status) => {
    const colors = {
      'Recieved': 'bg-orange-500/20 text-orange-400',
      'Completed': 'bg-green-500/20 text-green-400',
      'Pending': 'bg-purple-500/20 text-purple-400',
      'new': 'bg-blue-500/20 text-blue-400',
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

  const handleCreateService = async (serviceData) => {
    try {
      await axios.post(`${API_BASE_URL}/service-types/`, serviceData, {
        headers: { Authorization: `Token ${token}` },
      });
      alert('✅ Service added successfully!');
      setShowServiceModal(false);
    } catch (err) {
      console.error('Error creating service:', err);
      alert('❌ Failed to add service');
    }
  };


    if (loading || !dashboardData) {
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
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <div className="flex gap-4">
        <button
          onClick={() => setShowServiceModal(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          <span>Create New Service</span>
        </button>
      </div>
      <div className="grid grid-cols-5 gap-6">
        <StatCard title="Total Jobs" value={dashboardData.total_jobs} change="+12%" icon={Users} iconColor="bg-blue-500/20 text-blue-400" />
        <StatCard title="Active Jobs" value={dashboardData.active_jobs} change="+8%" icon={Briefcase} iconColor="bg-orange-500/20 text-orange-400" />
        <StatCard title="Completed Jobs" value={dashboardData.completed_jobs} change="+23%" icon={CheckCircle} iconColor="bg-green-500/20 text-green-400" />
        <StatCard title="Pending Approvals" value={dashboardData.pending_jobs} change="-2" icon={FileText} iconColor="bg-purple-500/20 text-purple-400" />
      </div>
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recent Jobs</h2>
          <Link to={"/booking/jobs"} className="text-blue-400 hover:text-blue-300 text-sm">View All</Link>
        </div>
        <div className="space-y-3">
          {recentJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-gray-400 text-xs">JOB-{String(job.id).padStart(3, '0')}</span>
                  <p className="text-sm font-medium text-white">{job.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>{job.status}</span>
                <span className="text-gray-400 text-sm">{job.assigned_staff_name}</span>
                {/* <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(job.priority)}`}>{job.priority}</span> */}
                <span className="text-gray-400 text-xs">{job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl border border-gray-700">
            <CreateServiceForm onSubmit={handleCreateService} onClose={() => setShowServiceModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;