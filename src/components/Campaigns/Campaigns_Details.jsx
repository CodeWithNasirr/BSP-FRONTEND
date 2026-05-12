import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config";
import RequireSubscription from "../Subscriptions/RequireSubscription";
import TemplateViewModal from "../Templates/TemplateViewModal.jsx";

const CampaignDetails = () => {
  const { id } = useParams();
  const token = localStorage.getItem("authToken");

  const [Campaign, setCampaign] = useState(null);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const fetchCampaignDetails = async (url = `${API_BASE_URL}/api/campaigns/${id}/`) => {
    try {
      setLoading(true);
      const response = await axios.get(url, {
        headers: { Authorization: `Token ${token}` },
      });
      const Data = response.data;
      setCampaign(Data);
      setSelectedTemplate(Data.Templates || []);
      setPagination(Data.Msg_Pagination || {});
    } catch (error) {
      console.error("Error fetching campaign details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignDetailsPage = async (page = 1) => {
    let url = `${API_BASE_URL}/api/campaigns/${id}/?page=${page}`;
    fetchCampaignDetails(url);
  };

  useEffect(() => {
    fetchCampaignDetails();
  }, [id]);

  if (!Campaign) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0b1120] transition-colors duration-300">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading your Campaigns...</p>
      </div>
    </div>
  );

  const statusConfig = {
    read: { bg: "bg-green-600", label: "Read" },
    delivered: { bg: "bg-blue-600", label: "Delivered" },
    sent: { bg: "bg-amber-500", label: "Sent" },
    failed: { bg: "bg-red-600", label: "Failed" },
    pending: { bg: "bg-gray-500", label: "Pending" },
  };

  const getStatusStyle = (status) => {
    const s = (status || "pending").toLowerCase();
    return statusConfig[s] || statusConfig.pending;
  };

  return (
    <RequireSubscription>
      <div className="h-screen flex flex-col w-full min-w-0 bg-gray-50 dark:bg-[#0b1120] transition-colors duration-300 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 capitalize">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Campaign details</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ref.: {Campaign.campaign_id}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                disabled
                className="rounded-xl cursor-not-allowed bg-gray-300 dark:bg-white/10 px-4 py-2 text-sm font-bold text-white dark:text-gray-400 shadow-sm text-center transition-colors"
              >
                Export as CSV
              </button>
              <Link
                className="rounded-xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 px-4 py-2 text-sm font-bold text-white shadow-sm text-center transition-all active:scale-95"
                to="/campaigns"
              >
                Back
              </Link>
              <button
                onClick={() => {
                  setSelectedTemplate(Campaign.Templates);
                  setViewModalOpen(true);
                }}
                className="bg-green-600 dark:bg-green-500 hover:bg-green-500 dark:hover:bg-green-400 text-white px-4 py-2 text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95"
              >
                View Template
              </button>
            </div>
          </div>

          {/* Campaign Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 w-full mb-8">
            {[
              { label: "All Messages", value: Campaign.total_message },
              { label: "Sent", value: Campaign.total_sent },
              { label: "Delivered", value: Campaign.total_delivered },
              { label: "Read", value: Campaign.total_read },
              { label: "Failed", value: Campaign.total_failed },
            ].map((stat, index) => (
              <div
                key={index}
                className="w-full text-center bg-white dark:bg-[#111827] py-4 sm:py-6 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm transition-colors"
              >
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {stat.value || 0}
                </h2>
                <h4 className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</h4>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm transition-colors">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Loading messages...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                      <th className="font-semibold pl-4 py-3 text-left hidden sm:table-cell">Contact</th>
                      <th className="font-semibold py-3 text-left">Phone</th>
                      <th className="font-semibold py-3 text-left hidden sm:table-cell">Last Updated</th>
                      <th className="font-semibold py-3 text-left hidden sm:table-cell">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(Campaign.Msg_Status) && Campaign.Msg_Status.length > 0 ? (
                      Campaign.Msg_Status.map((item, index) => {
                        const statusStyle = getStatusStyle(item.status);
                        return (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-white/5 text-sm transition-colors"
                          >
                            <td className="pl-4 py-3 hidden sm:table-cell text-gray-900 dark:text-gray-100">
                              {item.user_name === "null" ? "unknown" : item.user_name}
                            </td>

                            <td className="py-3 sm:pl-0 pl-4">
                              <div className="sm:hidden flex flex-col">
                                <span className="font-semibold text-gray-900 dark:text-gray-100">+{item.recipient_id}</span>
                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                  {item.timestamp
                                    ? new Date(item.timestamp).toLocaleString()
                                    : "No timestamp"}
                                </span>
                                <span
                                  className={`relative group px-2 py-0.5 text-xs rounded-md mt-1 ${statusStyle.bg} text-white cursor-pointer inline-block w-fit`}
                                >
                                  {item.status}
                                  {item.status === "failed" && item.failed_reason && (
                                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-gray-800 dark:bg-[#1e293b] text-white text-xs rounded-lg p-2 shadow-xl z-10 block sm:hidden border border-white/10">
                                      {item.failed_reason}
                                    </span>
                                  )}
                                </span>
                              </div>
                              <span className="hidden sm:block text-gray-900 dark:text-gray-100">+{item.recipient_id}</span>
                            </td>

                            <td className="py-3 hidden sm:table-cell text-gray-500 dark:text-gray-400">
                              {item.timestamp
                                ? new Date(item.timestamp).toLocaleString()
                                : "No timestamp available"}
                            </td>

                            <td className="py-3 hidden sm:table-cell">
                              <span
                                className={`relative group px-2.5 py-1 text-xs rounded-lg ${statusStyle.bg} text-white cursor-pointer font-medium transition-colors`}
                              >
                                {item.status}
                                {item.status === "failed" && item.failed_reason && (
                                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block group-focus:block w-60 bg-gray-800 dark:bg-[#1e293b] text-white text-xs rounded-lg p-2.5 shadow-xl z-10 border border-white/10">
                                    {item.failed_reason}
                                  </span>
                                )}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center mb-2">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12a9 9 0 0118 0z" />
                              </svg>
                            </div>
                            No message status available
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {pagination.total_pages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-3">
              <button
                disabled={!pagination.previous}
                onClick={() => fetchCampaignDetailsPage(pagination.current_page - 1)}
                className={`px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              <button
                disabled={!pagination.next}
                onClick={() => fetchCampaignDetailsPage(pagination.current_page + 1)}
                className={`px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Template Modal */}
        <TemplateViewModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          template={selectedTemplate}
        />
      </div>
    </RequireSubscription>
  );
};

export default CampaignDetails;
