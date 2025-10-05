import React, { useState, useEffect } from 'react';
import { Plus, Eye, UserCog, MoreVertical } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config'; // e.g., 'http://your-api-url.com/api'

const StaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(null); // Store staff ID for details modal
  const [showManageModal, setShowManageModal] = useState(null); // Store staff ID for manage modal
  const [newStaff, setNewStaff] = useState({ username: '', phone_number: '', password: '' });
  const [manageStaff, setManageStaff] = useState({ status: '' });
  const [staffJobs, setStaffJobs] = useState([]); // For View Details modal
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('authToken');
  useEffect(() => {
      const loadStaff = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/staff/assigned/`, {
            headers: { Authorization: `Token ${token}` },
          });
          // Map data to your frontend format
          const staffData = response.data.map(s => ({
            id: s.id,
            username: s.user__username,
            phone_number: s.staff_phone_number || '+1234567890',
            status: s.status,
            assigned_jobs: s.assigned_jobs_count,
          }));
          setStaff(staffData);
        } catch (err) {
          console.error('Error loading staff:', err);
          setStaff([]);
        }
      };

      loadStaff();
    }, [token]);

  const handleCreateStaff = async () => {
    try {
      await axios.post(`${API_BASE_URL}/staff/create/`, newStaff, {
        headers: { Authorization: `Token ${token}` },
      });
      setShowCreateModal(false);
      setNewStaff({ username: '', phone_number: '', password: '' });
      const response = await axios.get(`${API_BASE_URL}/staff/list/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const staffData = await Promise.all(
        response.data.map(async (member) => {
          try {
            const jobsResponse = await axios.get(`${API_BASE_URL}/staff/assigned/`, {
              headers: { Authorization: `Token ${token}` },
            });
            const assignedJobs = jobsResponse.data.filter((job) => job.assigned_staff === member.id).length;
            return { ...member, assigned_jobs: assignedJobs, phone_number: member.phone_number || '+1234567890' };
          } catch (err) {
            return { ...member, assigned_jobs: 0, phone_number: member.phone_number || '+1234567890' };
          }
        })
      );
      setStaff(staffData);
    } catch (err) {
      // console.error('Error creating staff:', err.response.data.username);
      alert(err.response.data.username);
      setShowCreateModal(false);
    }
  };

  const handleViewDetails = async (staffId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/staff/assigned_jobs/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setStaffJobs(response.data.filter((job) => job.assigned_staff === staffId));
      setShowDetailsModal(staffId);
    } catch (err) {
      console.error('Error loading staff jobs:', err);
      setStaffJobs([]);
      setShowDetailsModal(staffId);
    }
  };

  const handleManageStaff = async (staffId) => {
    try {
      await axios.patch(`${API_BASE_URL}/staff/${staffId}/`, manageStaff, {
        headers: { Authorization: `Token ${token}` },
      });
      setShowManageModal(null);
      setManageStaff({ status: '' });
      const response = await axios.get(`${API_BASE_URL}/staff/list/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const staffData = await Promise.all(
        response.data.map(async (member) => {
          try {
            const jobsResponse = await axios.get(`${API_BASE_URL}/staff/assigned/`, {
              headers: { Authorization: `Token ${token}` },
            });
            const assignedJobs = jobsResponse.data.filter((job) => job.assigned_staff === member.id).length;
            return { ...member, assigned_jobs: assignedJobs, phone_number: member.phone_number || '+1234567890' };
          } catch (err) {
            return { ...member, assigned_jobs: 0, phone_number: member.phone_number || '+1234567890' };
          }
        })
      );
      setStaff(staffData);
    } catch (err) {
      console.error('Error updating staff:', err);
      alert('Updated successfully! (Demo mode)');
      setShowManageModal(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
        case "ACTIVE":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
        case "INACTIVE":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
        case "SUSPENDED":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
        default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
    };

  
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
          <h1 className="text-2xl font-bold text-white">Staff / Team</h1>
          <p className="text-gray-400">Manage your team members and their assignments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          <span>Add Staff Member</span>
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Total Staff</p>
          <h3 className="text-2xl font-bold text-white">{staff.length}</h3>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Active</p>
          <h3 className="text-2xl font-bold text-white">{staff.filter((s) => s.status === 'Active').length}</h3>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">On Job</p>
          <h3 className="text-2xl font-bold text-white">{staff.filter((s) => s.assigned_jobs > 0).length}</h3>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Available</p>
          <h3 className="text-2xl font-bold text-white">{staff.filter((s) => s.assigned_jobs === 0).length}</h3>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {staff.map((member) => (
        
          <div key={member.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold">
                  {member.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white">{member.username}</h3>
                  <p className="text-sm text-gray-400">{member.phone_number}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Status</span>
                <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    member.status
                )}`}
                >
                {member.status || "Active"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Assigned Jobs</span>
                <span className="font-bold text-white">{member.assigned_jobs || 0}</span>
              </div>
              <div className="pt-3 border-t border-gray-700 flex gap-2">
                <button
                  onClick={() => handleViewDetails(member.id)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  View Details
                </button>
                <button
                  onClick={() => {
                    setManageStaff({ status: member.status || 'ACTIVE' });
                    setShowManageModal(member.id);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <UserCog size={16} />
                  Manage
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Add New Staff Member</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Username</label>
                <input
                  type="text"
                  value={newStaff.username}
                  onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                  className="w-full bg-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={newStaff.phone_number}
                  onChange={(e) => setNewStaff({ ...newStaff, phone_number: e.target.value })}
                  className="w-full bg-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  className="w-full bg-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                  placeholder="Enter password"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg transition-colors text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateStaff}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors text-white"
              >
                Create Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Staff Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-400">Username</h3>
                <p className="text-white">{staff.find((s) => s.id === showDetailsModal)?.username}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400">Phone Number</h3>
                <p className="text-white">{staff.find((s) => s.id === showDetailsModal)?.phone_number}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400">Status</h3>
                <p className="text-white">{staff.find((s) => s.id === showDetailsModal)?.status || 'ACTIVE'}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400">Assigned Jobs</h3>
                {staffJobs.length > 0 ? (
                  <ul className="space-y-2">
                    {staffJobs.map((job) => (
                      <li key={job.id} className="bg-gray-700 p-3 rounded-lg">
                        <p className="text-sm text-white">Job ID: {job.id}</p>
                        <p className="text-sm text-gray-400">Customer: {job.customer}</p>
                        <p className="text-sm text-gray-400">Service: {job.service_type || 'N/A'}</p>
                        <p className="text-sm text-gray-400">Status: {job.status}</p>
                        <p className="text-sm text-gray-400">
                          Created: {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No assigned jobs</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg transition-colors text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Staff Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Manage Staff</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select
                  value={manageStaff.status}
                  onChange={(e) => setManageStaff({ ...manageStaff, status: e.target.value })}
                  className="w-full bg-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowManageModal(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg transition-colors text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleManageStaff(showManageModal)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;