import React, { useEffect, useState } from "react";
import { data, Link, useParams } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config";
import { NavLink } from "react-router-dom";
const CampaignDetails = () => {
  const { id } = useParams();
  const token = localStorage.getItem("authToken");

  const [Campaign, setCampaign] = useState(null);
  const [template, setTemplate] = useState([]);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/campaigns/${id}/`, {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const Data = response.data
        // console.log("API response:", Data)
        setCampaign(Data);
        setTemplate(Data.Templates || []);
     
      } catch (error) {
        console.error("Error fetching campaign details:", error);
      }
    };

    fetchCampaignDetails();
  }, [id, token]);

  if (!Campaign) return <p>Loading campaign details...</p>;

  return (
    <div className="max-h-[100vh] flex flex-col w-full min-w-0">
      <div className="p-4 md:p-8 rounded-[5px] h-full overflow-y-auto capitalize">
        <div className="flex justify-between">
          <div>
            <h2 className="text-xl mb-1">Campaign details</h2>
            <p className="mb-6 flex items-center text-sm leading-6">
              <span className="ml-1 mt-1">Ref.: {Campaign.campaign_id}</span>
            </p>
          </div>
          <div className="space-x-2">
            <Link
              href={``}
              className="rounded-md cursor-not-allowed bg-gray-400 bg-secondary px-3 py-2 text-sm font-semibold text-white shadow-sm"
            >
              Export as CSV
            </Link>
            <Link
              className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm"
              to="/campaigns"
            >
              Back
            </Link>
          </div>
        </div>
        <div className="md:flex md:space-x-4">
          <div className="md:w-[70%]">
            <div className="flex w-[100%] mb-8 rounded-lg">
              {["Messages", "Sent", "Delivered", "Read", "Failed"].map(
                (label, index) => (
                  <div
                    key={index}
                    className="w-full text-center bg-white py-8 border"
                  >
                    <h2 className="text-xl">
                      {index === 0
                        ? `${Campaign.total_message}`
                        : 0 || index === 1
                        ? `${Campaign.total_sent}`
                        : 0 || index === 2
                        ? `${Campaign.total_delivered}`
                        : 0 || index === 3
                        ? `${Campaign.total_read}`
                        : 0 || index === 4
                        ? `${Campaign.total_failed}`
                        : 0}
                    </h2>
                    <h4 className="text-sm">{label}</h4>
                  </div>
                )
              )}
            </div>
            <div className="bg-white flex items-center shadow-sm h-10 w-80 rounded-[0.5rem] mb-6 text-sm">
              <span className="pl-3">🔍</span>
              <input
                type="text"
                className="outline-none px-4 w-full"
                placeholder="Search Campaigns"
              />
            </div>
            <div className="bg-slate-100 md:bg-white rounded-[0.5rem]">
              <table className="w-full">
                <thead className="md:table-header-group hidden">
                  <tr className="text-sm">
                    <th className="font-normal pl-4 py-4 text-left hidden sm:table-cell">
                      Contact
                    </th>
                    <th className="font-normal py-4 text-left">Phone</th>
                    <th className="font-normal py-4 text-left hidden sm:table-cell">
                      Last Updated
                    </th>
                    <th className="font-normal py-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(Campaign.Msg_Status) &&
                  Campaign.Msg_Status.length > 0 ? (
                    Campaign.Msg_Status.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-slate-50 md:border-b-0 md:border-t border-[#d1d5db] text-sm"
                      >
                        <td className="pl-4 py-4 hidden sm:table-cell">
                          {item.user_name=="null"?"unknown":item.user_name}
                        </td>
                        <td>+{item.recipient_id}</td>
                        <td className="hidden sm:table-cell">
                          {Campaign.Msg_Status && Campaign.Msg_Status.length > 0
                            ? new Date(item.timestamp).toLocaleString()
                            : "No timestamp available"}
                        </td>
                        <td>
                          <span
                            className={`px-2 py-1 text-xs rounded-md ${item.status === "read"? "bg-green-700": item.status === "failed" || item.status === "sent"? "bg-red-700"
                                : "bg-green-700"
                            } text-white`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-4 text-gray-500"
                      >
                        No message status available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="md:w-[30%]">
            <div className="w-full rounded-lg bg-white pt-4 pb-8 border px-4 space-y-1">
              <h2 className="mb-2">Campaign details</h2>
              <div className="text-sm bg-slate-100 p-3 rounded-lg">
                <h3>Campaign name</h3>
                <p>{Campaign.campaigns_name}</p>
              </div>
              <div className="text-sm bg-slate-100 p-3 rounded-lg">
                <h3>Template</h3>
                <p>{Campaign.template_name}</p>
              </div>
              <div className="text-sm bg-slate-100 p-3 rounded-lg">
                <h3>Time scheduled</h3>
                <p>
                  {Campaign.Msg_Status && Campaign.Msg_Status.length > 0
                    ? new Date(
                        Campaign.Msg_Status[0].timestamp
                      ).toLocaleString()
                    : "No timestamp available"}
                </p>
              </div>
            </div>
            <div className="w-full border pt-4 px-4 space-y-1 rounded-xl shadow-md bg-cover bg-center" style={{ backgroundImage: `url('${API_BASE_URL}/media/FILES/whatsapp-bg-02.png')` }}>
              <div className="flex justify-start">
              <div className="flex items-end">
                  <svg height="13" width="8">
                    <path fill="white" d="M2.8,13L8,13L8,0.2C7.1,5.5,6.5,8.7,1.7,10.4C-1.6,11.5,1,13,2.8,13z" />
                  </svg>
                </div>
              <div className="rounded-r-lg rounded-tl-lg text-md bg-white py-2 pl-3">
                <h1 className="font-semibold">{template.header_text}</h1>
                <span className="text-sm w-full">{template.body_text}</span>
                <div className="text-xs text-gray-500 mt-1">
                  <span className="font-light">{template.footer_text}</span>
                  <br />
                
                </div>
              </div>
            </div>
          
             <div className="flex justify-start items-center py-2">
                  <span className="bg-white rounded-l-lg rounded-tr-lg w-full text-center text-blue-500">
                  {template.button_text}
                  </span>
              </div>
            
              {/* <p className="text-xs  text-gray-500">
              Disclaimer: This is just a graphical representation of the message
              that will be delivered. Actual message will consist of media
              selected and may appear different.
            </p> */}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
