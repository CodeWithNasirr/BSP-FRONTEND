import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config";
function Campaigns() {
  const navigate = useNavigate();
  const [Campaigns, setCampaigns] = useState({Data: []});
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("authToken");

   useEffect(()=>{
    axios
    .get(`${API_BASE_URL}/get_Camp/`, {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then((response)=>{
      setCampaigns(response.data)
      console.log(Campaigns.Data)
    })
    .catch((error) => {
      console.error("Error fetching templates:", error);
    });
   },[]);
 

  return (
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
              ></path>
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
      {/* Table Headers */}
      <div className="mx-10 bg-white py-3 px-2 rounded-md sticky top-0 z-10 shadow-md">
        <div className="flex justify-center text-blue-600 font-semibold text-sm bg-gray-100 py-3 rounded-md">
          {["CampaignName", "Template", "Delivery Rate","Read Rate","Status"].map((item, index) => (
            <div key={index} className="w-1/4 text-center">{item}</div>
          ))}
        </div>
      </div>


      {/* Campaigns List */}
      {loading ? (
        <p className="text-center py-30 text-2xl text-gray-600">
          Loading Campaings...
        </p>
      ) : Campaigns.Data.length !== 0 ? (
        <div className="Campaigns mx-10 rounded-xl bg-white py-3 mt-2">
          {Campaigns.Data.map((campaigns, index) => (
            <div
              key={index}
              className="border-b last:border-none py-2"
            >
              <a href={`/campaigns/${campaigns.campaign_id}`} className="flex items-center">
              <p className="w-1/4 text-center text-gray-700">
                {campaigns.campaigns_name}
              </p>
              <p className="w-1/4 text-center text-gray-700">
                {campaigns.template_name}
              </p>
              {/* Delevery Rate */}
              <p className="w-1/4 text-center text-gray-700">
              <span className="bg-slate-200 px-1 py-1 rounded-lg mr-2 hidden md:inline-block">{campaigns.delivery_rate}%</span>
              {campaigns.total_delivered}/{campaigns.total_message}
              </p>  
            
              {/* Read Rate */}
              <p className="w-1/4 text-center text-gray-700 ">
              <span className="bg-slate-200 px-1 py-1 rounded-lg mr-2 hidden md:inline-block">{campaigns.read_rate}%</span>
              {campaigns.total_read}/{campaigns.total_message}
              </p>
    
              <p className={`w-1/4 text-center px-2 py-1 text-xs rounded-md ${campaigns.is_sent?"bg-green-700":"bg-red-700"} text-white`}>
                {campaigns.is_sent ?"Completed" :"Pending"} 
              </p>
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 py-3 pb-10 mx-10 my-10 rounded-xl bg-white ">
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
              ></path>
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
    </div>
  );
}

export default Campaigns;
