import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config";
import RequireSubscription from "../Subscriptions/RequireSubscription";
import { assest } from "../../assets/assets";
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

  if (!Campaign) return <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your Campaigns...</p>
          </div>
        </div>;

  return (
    <RequireSubscription>
      <div className="max-h-[100vh] flex flex-col w-full min-w-0">
        <div className="p-4 sm:p-8 rounded-[5px] h-full overflow-y-auto capitalize">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-xl mb-1">Campaign details</h2>
              <p className="text-sm text-gray-600">
                Ref.: {Campaign.campaign_id}
              </p>
            </div>

            {/* Buttons on right side */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
              <Link
                href="#"
                className="rounded-md cursor-not-allowed bg-gray-400 px-3 py-2 text-sm font-semibold text-white shadow-sm text-center"
              >
                Export as CSV
              </Link>
              <Link
                className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm text-center"
                to="/campaigns"
              >
                Back
              </Link>

              <button
                onClick={() => {
                  setSelectedTemplate(Campaign.Templates);
                  setViewModalOpen(true);
                }}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 text-sm font-semibold rounded-md shadow-sm"
              >
                View Template
              </button>
            </div>
          </div>

          {/* Campaign Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-0 w-full mb-8 rounded-lg">
            {["All Messages", "Sent", "Delivered", "Read", "Failed"].map(
              (label, index) => (
                <div
                  key={index}
                  className="w-full text-center bg-white py-4 sm:py-8 border"
                >
                  <h2 className="text-lg sm:text-xl font-semibold">
                    {[
                      Campaign.total_message,
                      Campaign.total_sent,
                      Campaign.total_delivered,
                      Campaign.total_read,
                      Campaign.total_failed,
                    ][index] || 0}
                  </h2>
                  <h4 className="text-xs sm:text-sm text-gray-600">{label}</h4>
                </div>
              )
            )}
          </div>

          {/* Table */}
          <div className="bg-slate-100 sm:bg-white rounded-[0.5rem] overflow-x-auto">
            {loading ? (
              <p className="text-center py-4">Loading...</p>
            ) : (
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="text-sm text-gray-700 border-b">
                    <th className="font-normal pl-4 py-4 text-left hidden sm:table-cell">Contact</th>
                    <th className="font-normal py-4 text-left">Phone</th>
                    <th className="font-normal py-4 text-left hidden sm:table-cell">Last Updated</th>
                    <th className="font-normal py-4 text-left hidden sm:table-cell">Status</th>
                  </tr>
                </thead>
                  <tbody>
                  {Array.isArray(Campaign.Msg_Status) && Campaign.Msg_Status.length > 0 ? (
                    Campaign.Msg_Status.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-slate-50 border-[#d1d5db] text-sm"
                      >
                        {/* Contact */}
                        <td className="pl-4 py-4 hidden sm:table-cell">
                          {item.user_name === "null" ? "unknown" : item.user_name}
                        </td>

                        {/* Phone */}
                        <td className="py-4 sm:pl-0 pl-4">
                          <div className="sm:hidden flex flex-col overflow-x-hidden">
                            <span className="font-medium">+{item.recipient_id}</span>
                            <span className="text-gray-600">
                              {item.timestamp
                                ? new Date(item.timestamp).toLocaleString()
                                : "No timestamp available"}
                            </span>

                            {/* Status (Mobile) */}
                            <span
                              tabIndex="0"
                              className={`relative group px-2 py-1 text-xs rounded-md mt-1 ${
                                item.status === "read"
                                  ? "bg-green-700"
                                  : item.status === "failed" || item.status === "sent"
                                  ? "bg-red-700"
                                  : "bg-green-700"
                              } text-white cursor-pointer inline-block`}
                            >
                              {item.status}

                              {/* Tooltip */}
                              {item.status === "failed" && item.failed_reason && (
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-gray-800 text-white text-xs rounded-md p-2 shadow-lg z-10 block sm:hidden">
                                  {item.failed_reason}
                                </span>
                              )}
                            </span>
                          </div>

                          <span className="hidden sm:block">+{item.recipient_id}</span>
                        </td>

                        {/* Timestamp */}
                        <td className="py-4 hidden sm:table-cell">
                          {item.timestamp
                            ? new Date(item.timestamp).toLocaleString()
                            : "No timestamp available"}
                        </td>

                        {/* Status (Desktop) */}
                        <td className="py-4 hidden sm:table-cell">
                          <span
                            tabIndex="0"
                            className={`relative group px-2 py-1 text-xs rounded-md ${
                              item.status === "read"
                                ? "bg-green-700"
                                : item.status === "failed" || item.status === "sent"
                                ? "bg-red-700"
                                : "bg-green-700"
                            } text-white cursor-pointer`}
                          >
                            {item.status}

                            {/* Tooltip for failed reason */}
                             {item.status === "failed" && item.failed_reason && (
                              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block group-focus:block w-60 bg-gray-800 text-white text-xs rounded-md p-2 shadow-lg z-10">
                                {item.failed_reason}
                              </span>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-gray-500">
                        No message status available
                      </td>
                    </tr>
                  )}
                </tbody>
              
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {pagination.total_pages > 1 && (
            <div className="flex justify-center items-center mt-4 gap-4">
              <button
                disabled={!pagination.previous}
                onClick={() => fetchCampaignDetailsPage(pagination.current_page - 1)}
                className={`px-3 py-1 border rounded ${
                  !pagination.previous ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                ← Previous
              </button>
              <span>
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              <button
                disabled={!pagination.next}
                onClick={() => fetchCampaignDetailsPage(pagination.current_page + 1)}
                className={`px-3 py-1 border rounded ${
                  !pagination.next ? "opacity-50 cursor-not-allowed" : ""
                }`}
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