import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config";
import { toast } from 'react-toastify';
import RequireSubscription from "../Subscriptions/RequireSubscription";

function Campaigns() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ next: null, previous: null, count: 0 });

  const fetchCampaigns = async (pageNum) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/campaigns/?page=${pageNum}`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });


      const { results, next, previous, count } = response.data;
      setCampaigns(results);
      setPagination({ next, previous, count });

      
    } catch (error) {
      toast.error(error.response.data.error);
      // toast.error(response.data.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchCampaigns(page);
}, [page, token]);

  return (
    <RequireSubscription>
    <div className="Main w-full h-screen bg-slate-100 px-15">
      {/* Header */}
      <div className="header flex justify-between py-1 px-5">
        <div className="left px-5 py-5">
          <h2 className="font-semibold text-xl mb-1">Campaigns</h2>
          <p className="mb-6 flex items-center text-sm leading-6 text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 11v5m0 5a9 9 0 1 1 0-18a9 9 0 0 1 0 18Zm.05-13v.1h-.1V8h.1Z"
              />
            </svg>
            <span className="ml-1 mt-1">Add Campaigns</span>
          </p>
        </div>
        <div className="right gap-2 px-10 text-white flex items-center">
          <button
            className="rounded-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer px-5 py-2 text-white text-sm font-semibold flex items-center"
            onClick={() => navigate("/campaigns/create")}
          >
            Create Campaign
          </button>
        </div>
      </div>

      {/* Table Headers */}
      <div className="container max-h-[500px] overflow-y-auto">
        <div className="mx-10 bg-white py-3 px-2 rounded-md sticky top-0 z-10 shadow-md">
          <div className="flex justify-center text-blue-600 font-semibold text-sm bg-gray-100 py-3 rounded-md">
            {["CampaignName", "Template", "Delivery Rate", "Read Rate", "Status"].map((item, index) => (
              <div key={index} className="w-1/4 text-center">{item}</div>
            ))}
          </div>
        </div> 

        {/* Campaigns List */}
        {loading ? (
          <p className="animate-pulse text-center py-30 text-2xl text-gray-600">
            Loading Campaigns...
          </p>
        ) : campaigns.length !== 0 ? (
          <div className="Campaigns flex-grow mx-10 rounded-xl bg-white py-3 mt-2 overflow-y-auto h-[55vh]">
            {campaigns.map((campaign, index) => (
              <div key={index} className="border-b last:border-none py-2">
                <Link to={`/campaigns/${campaign.campaign_id}`} className="flex items-center">
                  <p className="w-1/4 text-center text-gray-700">{campaign.campaigns_name}</p>
                  <p className="w-1/4 text-center text-gray-700">{campaign.template_name}</p>
                  {/* Delivery Rate */}
                  <p className="w-1/4 text-center text-gray-700">
                    <span className="bg-slate-200 px-1 py-1 rounded-lg mr-2 hidden md:inline-block">
                      {campaign.delivery_rate}%
                    </span>
                    {campaign.total_delivered}/{campaign.total_message}
                  </p>
                  {/* Read Rate */}
                  <p className="w-1/4 text-center text-gray-700">
                    <span className="bg-slate-200 px-1 py-1 rounded-lg mr-2 hidden md:inline-block">
                      {campaign.read_rate}%
                    </span>
                    {campaign.total_read}/{campaign.total_message}
                  </p>
                  <p
                    className={`w-1/4 text-center px-2 py-1 text-xs rounded-md ${
                      campaign.is_sent ? "bg-green-700" : "bg-red-700"
                    } text-white`}
                  >
                    {campaign.is_sent ? "Completed" : "Pending"}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 py-3 pb-10 mx-10 my-10 rounded-xl bg-white">
            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="72"
                height="72"
                viewBox="0 0 32 32"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                  d="M12 15h8m-8 4h8m8 5V11c0-1.105-.892-2-1.997-2H17c-2 0-2-3-5-3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2Z"
                />
              </svg>
            </div>
            <h3 className="text-center text-lg font-medium mb-4">
              You don't have any Campaigns
            </h3>
            <div className="flex justify-center">
              <button
                className="rounded-full bg-green-900 hover:bg-green-700 cursor-pointer px-5 py-2 text-white text-sm font-semibold flex items-center"
                onClick={() => navigate("/campaigns/create")}
              >
                Create Campaigns
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4 mx-10">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={!pagination.previous}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {Math.ceil(pagination.count / 10)} {/* Adjust based on your page size */}
        </span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={!pagination.next}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
    </RequireSubscription>
  );
}

export default Campaigns;