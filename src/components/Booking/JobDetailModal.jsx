import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';

const JobDetailModal = ({ jobId, onClose }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('authToken');
  // console.log(jobId)
  if (loading || !jobId) return <div className="text-center py-12 text-white">Loading...</div>;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
  <div className="bg-gray-800 rounded-lg w-full max-w-lg h-screen md:h-auto max-h-[90vh] overflow-y-auto border border-gray-700 shadow-lg">
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-4">Job Details</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm text-gray-400">Job ID</h3>
          <p className="text-white">JOB-{String(jobId.id).padStart(3, '0')}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-400">Service Type</h3>
          <p className="text-white">{jobId.service_type_name || 'Unknown'}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-400">Customer Name</h3>
          <p className="text-white">{jobId.name}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-400">Phone</h3>
          <p className="text-white">{jobId.phone}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-400">Email</h3>
          <p className="text-white">{jobId.email || 'N/A'}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-400">Status</h3>
          <p className="text-white">{jobId.status}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-400">Assigned Staff</h3>
          <p className="text-white">{jobId.assigned_staff_name || 'None'}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-400">Created At</h3>
          <p className="text-white">
            {jobId.created_at ? new Date(jobId.created_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        <div>
          <h3 className="text-sm text-gray-400">Service Details</h3>
          {jobId.details && Object.keys(jobId.details).length > 0 ? (
            <ul className="space-y-2">
              {Object.entries(jobId.details).map(([key, value]) => (
                <li key={key} className="text-white">
                  <span className="capitalize">{key.replace('_', ' ')}:</span> {value}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No details provided</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6 sticky bottom-0 bg-gray-800 pt-4">
        <button
          onClick={onClose}
          className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg transition-colors text-white"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</div>
  );
};

export default JobDetailModal;