import React,{useEffect,useState,useContext} from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import { toast } from 'react-toastify'
import { Link } from "react-router-dom";
import { Context } from "./context/Context";
const WhatsAppSettings = () => {
  const token = localStorage.getItem("authToken");

  const {isConnected} = useContext(Context)
  
  const [wp_Details,setWp_Details]=useState([])
  useEffect(() => {
    if (!isConnected) return; // only fetch if connected

    axios
      .get(`${API_BASE_URL}/api/whatsapp/details/`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        setWp_Details(response.data.Data);
      })
      .catch((error) => {
        toast.error("Failed to fetch WhatsApp details.");
        console.error("WhatsApp details error:", error.response?.data || error.message);
      });
  }, [isConnected, token]);
      

      // const clientId = "1354428199237692";
      // const REDIRECT_URI = "https://9fe2-2402-3a80-18ae-9ce9-9062-bd11-4b6c-ba.ngrok-free.app/facebook/callback/";
      // const scope = "whatsapp_business_management,whatsapp_business_messaging,public_profile";
  
      // const handleFacebookLogin = () => {
      //   const url = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${clientId}&redirect_uri=${REDIRECT_URI}&scope=${scope}&response_type=code&display=popup`;
      //   window.open(url, 'fbPopup','width=500,height=600');
      // };

  return (
    <div className={`container ${!isConnected?'flex justify-center':''} p-10 max-h-[100vh] overflow-auto bg-slate-100`}>

      {!isConnected && (
      <div className="md:w-[50%] md:p-8 overflow-y-auto">
      <div className="p-4 md:p-8 overflow-y-auto">
        <div className="bg-slate-50 border border-primary shadow rounded-md p-4 py-8">
          {/* Icon Container */}
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="72"
              height="72"
              viewBox="0 0 48 48"
            >
              <path
                fill="black"
                d="M43.634 4.366a1.25 1.25 0 0 1 0 1.768l-4.913 4.913a9.253 9.253 0 0 1-.744 12.244l-3.343 3.343a1.25 1.25 0 0 1-1.768 0l-11.5-11.5a1.25 1.25 0 0 1 0-1.768l3.343-3.343a9.25 9.25 0 0 1 12.244-.743l4.913-4.914a1.25 1.25 0 0 1 1.768 0m-7.611 7.425a6.75 6.75 0 0 0-9.546 0l-2.46 2.459l9.733 9.732l2.46-2.459a6.75 6.75 0 0 0 0-9.546zM9.28 36.953l-4.914 4.913a1.25 1.25 0 0 0 1.768 1.768l4.913-4.913a9.253 9.253 0 0 0 12.244-.744l3.343-3.343a1.25 1.25 0 0 0 0-1.768L25.268 31.5l3.366-3.366a1.25 1.25 0 0 0-1.768-1.768L23.5 29.732L18.268 24.5l3.366-3.366a1.25 1.25 0 0 0-1.768-1.768L16.5 22.732l-1.366-1.366a1.25 1.25 0 0 0-1.768 0l-3.343 3.343a9.25 9.25 0 0 0-.743 12.244m2.51-10.476l2.46-2.46l9.732 9.733l-2.459 2.46a6.75 6.75 0 0 1-9.546 0l-.186-.187a6.75 6.75 0 0 1 0-9.546"
              />
            </svg>
          </div>

          {/* Heading */}
          <h3 className="text-center text-lg font-medium mb-4">
            Connect your whatsapp account
          </h3>

          {/* Subheading */}
          <h4 className="text-center mb-4">
            You need to connect your WhatsApp account first before Check the Details of Your Whatsapp.
          </h4>

          {/* Button Link */}
          <Link  to={isConnected ? "#" : "/connect-form"} onClick={(e) => isConnected && e.preventDefault()} className={`rounded-md cursor-pointer ${isConnected ? 'bg-green-500 hover:bg-green-400' : 'bg-indigo-600 hover:bg-indigo-500'
          } px-3 py-2 text-sm font-semibold text-white shadow-sm mx-10`}
          disabled={isConnected}>{isConnected ? 'Connected WhatsApp Successfully' : 'Connect WhatsApp Business'}</Link>
        </div>
      </div>
        </div>
        )}

        {isConnected &&(
          <div className="flex justify-center items-center mb-8">
          <div className="md:w-[60em]">
            {/* WhatsApp Account Info */}
      
               <div className="bg-white border border-slate-200 rounded-lg py-2 text-sm mb-4">
               <div className="grid grid-cols-4 items-center px-4 gap-x-4 py-2 border-b border-zinc-200 relative">
                 <div className="border-r">
                   <div>Display name</div>
                   <div>{wp_Details.display_name}</div>
                 </div>
                 <div className="border-r">
                   <div>Connected number</div>
                   <div>{wp_Details.connected_number}</div>
                 </div>
                 <div className="border-r">
                   <div>Message limits</div>
                   <div>{wp_Details.message_limits}</div>
                 </div>
                 <div>
                   <div>Account status</div>
                   <div className={`py-1 px-2 rounded-md w-[fit-content] text-xs 
                    ${wp_Details.number_status === "verified" ||"ACTIVE"? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                     {wp_Details.number_status=="verified" || "ACTIVE" ?"VERIFIED":"PENDING"}
                   </div>
                 </div>
                 {/* <button className="flex items-center absolute right-0 top-0 text-xs mr-1 space-x-2 p-1 px-2 bg-slate-50 rounded-xl">
                   <svg
                     xmlns="http://www.w3.org/2000/svg"
                     width="1em"
                     height="1em"
                     viewBox="0 0 24 24"
                   >
                     <path
                       fill="currentColor" 
                       d="M12.079 2.25c-4.794 0-8.734 3.663-9.118 8.333H2a.75.75 0 0 0-.528 1.283l1.68 1.666a.75.75 0 0 0 1.056 0l1.68-1.666a.75.75 0 0 0-.528-1.283h-.893c.38-3.831 3.638-6.833 7.612-6.833a7.658 7.658 0 0 1 6.537 3.643a.75.75 0 1 0 1.277-.786A9.158 9.158 0 0 0 12.08 2.25m8.761 8.217a.75.75 0 0 0-1.054 0L18.1 12.133a.75.75 0 0 0 .527 1.284h.899c-.382 3.83-3.651 6.833-7.644 6.833a7.697 7.697 0 0 1-6.565-3.644a.75.75 0 1 0-1.277.788a9.197 9.197 0 0 0 7.842 4.356c4.808 0 8.765-3.66 9.15-8.333H22a.75.75 0 0 0 .527-1.284z"
                     />
                   </svg>
                   <span>Refresh</span>
                 </button> */}
               </div>
               <div className="grid grid-cols-4 items-center px-4 gap-x-4 py-2">
                 <div className="border-r">
                   <div>Whatsapp business ac ID</div>
                   <div>{wp_Details.whatsapp_business_account_id}</div>
                 </div>
                 {/* <div className="border-r">
                   <div>Phone verification status</div>
                   <div className="bg-slate-50 py-1 px-2 rounded-md w-[fit-content] text-xs"></div>
                 </div> */}
                 <div className="border-r">
                   <div>Quality rating</div>
                   <div className={`py-1 ${wp_Details.quality_rating === "GREEN" ? "bg-green-500 text-white" : "bg-red-500 text-white"} px-2 rounded-md w-[fit-content] text-xs`}>
                     {wp_Details.quality_rating}
                   </div>
                 </div>
               </div>
             </div>
          
            
            
  
            {/* Business Profile Settings Form */}
            <form className="bg-white border border-slate-200 rounded-lg py-2 text-sm mb-4 pb-4">
              <div className="flex items-center justify-between px-4 pt-2 pb-4">
                <div>
                  <h2 className="text-[17px]">Business profile settings</h2>
                  <span className="flex items-center mt-1">
                    <svg
                      className="mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
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
                    Setup the Whatsapp business profile for your number
                  </span>
                </div>
                <div>{/* Placeholder for potential future content */}</div>
              </div>
  
              {/* Profile Picture */}
              <div className="flex space-x-10 border-b border-zinc-200 w-full px-4 py-6">
                <div className="w-[40%]">
                  <span className="text-slate-600">Whatsapp profile picture</span>
                  <div className="text-xs text-slate-700 flex items-center">
                    <svg
                      className="mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
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
                    <span>Add/update your profile picture</span>
                  </div>
                </div>
                <div className="w-[60%]">
                    <div className="Img flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <input 
                        type="file"
                        className="sr-only"
                        accept=".jpg, .png"
                        id="file-upload"
                        name='header_img_video_file_url'
                      />
                      <div className="text-center">
                        <div>
                          <label htmlFor="file-upload">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400 cursor-pointer"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="currentColor"
                                d="M14 9a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0Z"
                              ></path>
                              <path
                                fill="currentColor"
                                fillRule="evenodd"
                                d="M7.268 4.658a54.647 54.647 0 0 1 9.465 0l1.51.132a3.138 3.138 0 0 1 2.831 2.66a30.604 30.604 0 0 1 0 9.1a3.138 3.138 0 0 1-2.831 2.66l-1.51.131c-3.15.274-6.316.274-9.465 0l-1.51-.131a3.138 3.138 0 0 1-2.832-2.66a30.601 30.601 0 0 1 0-9.1a3.138 3.138 0 0 1 2.831-2.66l1.51-.132Zm9.335 1.495a53.147 53.147 0 0 0-9.206 0l-1.51.131A1.638 1.638 0 0 0 4.41 7.672a29.101 29.101 0 0 0-.311 5.17L7.97 8.97a.75.75 0 0 1 1.09.032l3.672 4.13l2.53-.844a.75.75 0 0 1 .796.21l3.519 3.91a29.101 29.101 0 0 0 .014-8.736a1.638 1.638 0 0 0-1.478-1.388l-1.51-.131Zm2.017 11.435l-3.349-3.721l-2.534.844a.75.75 0 0 1-.798-.213l-3.471-3.905l-4.244 4.243c.049.498.11.996.185 1.491a1.638 1.638 0 0 0 1.478 1.389l1.51.131c3.063.266 6.143.266 9.206 0l1.51-.131c.178-.016.35-.06.507-.128Z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </label>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                            >
                              <span>Provide examples of the variables or media in the box</span>
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">PNG or JPG files only</p>
                        </div>
                      </div>
                  </div>
  
                </div>
              </div>
  
              {/* Business Address */}
              <div className="flex space-x-10 border-b border-zinc-200 w-full px-4 py-6">
                <div className="w-[40%]">
                  <span className="text-slate-600">Business address</span>
                  <div className="text-xs text-slate-700 flex items-center">
                    <svg
                      className="mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
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
                    <span>Specify your physical business address</span>
                  </div>
                </div>
                <div className="w-[60%]">
                  <div className="col-span-4">
                    <label
                      htmlFor="business-address"
                      className="block text-sm leading-6 text-gray-900"
                    ></label>
                    <div>
                      <input
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="text"
                        step="any"
                        id="business-address"
                      />
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Business Email */}
              <div className="flex space-x-10 border-b border-slate-200 w-full px-4 py-6">
                <div className="w-[40%]">
                  <span className="text-slate-600">Business email</span>
                  <div className="text-xs text-slate-700 flex items-center">
                    <svg
                      className="mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
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
                    <span>Add your business email address</span>
                  </div>
                </div>
                <div className="w-[60%]">
                  <div className="col-span-4">
                    <label
                      htmlFor="business-email"
                      className="block text-sm leading-6 text-gray-900"
                    ></label>
                    <div>
                      <input
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        type="email"
                        step="any"
                        id="business-email"
                      />
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Business Description */}
              <div className="flex space-x-10 border-b border-zinc-200 w-full px-4 py-6">
                <div className="w-[40%]">
                  <span className="text-slate-600">Business description</span>
                  <div className="text-xs text-slate-700 flex items-center">
                    <svg
                      className="mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
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
                    <span>Edit your whatsapp business account description</span>
                  </div>
                </div>
                <div className="w-[60%]">
                  <div className="col-span-4">
                    <label
                      htmlFor="business-description"
                      className="block text-sm leading-6 text-gray-900"
                    ></label>
                    <div className="mt-2">
                      <textarea
                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm outline-none ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-gray-300"
                        id="business-description"
                      />
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Business Industry */}
              <div className="flex space-x-10 w-full px-4 py-6">
                <div className="w-[40%]">
                  <span className="text-slate-600">Business industry</span>
                  <div className="text-xs text-slate-700 flex items-center">
                    <svg
                      className="mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
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
                    <span>Specify your business vertical</span>
                  </div>
                </div>
                <div className="w-[60%]">
                  <div className="col-span-4" type="text">
                    <label
                      htmlFor="business-industry"
                      className="block text-sm leading-6 text-gray-900"
                    ></label>
                    <div className="">
                      <div className="relative">
                        <button
                          id="headlessui-listbox-button-1"
                          type="button"
                          aria-haspopup="listbox"
                          aria-expanded="false"
                          className="relative w-full cursor-default rounded-lg bg-white py-2 px-5 pr-10 shadow-sm text-left ring-1 ring-inset focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm ring-gray-300"
                        >
                          <span className="block truncate">Clothing</span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                              className="h-5 w-5 text-gray-400"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Submit Button */}
              <div className="flex px-4 pt-1 pb-2">
                <div className="ml-auto">
                  <button
                    type="submit"
                    className="float-right rounded-md bg-primary px-3 py-2 text-sm text-white shadow-sm hover:shadow-md hover:bg-primary  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </form>
  
            {/* Remove WhatsApp Account */}
            <div className="bg-white border border-slate-200 rounded-lg py-2 text-sm mb-20">
              <div className="flex items-center px-4 pt-2 pb-4">
                <div className="w-[60%]">
                  <h2 className="text-[17px]">Remove Whatsapp account</h2>
                  <span className="flex items-center mt-1">
                    This will completely delete your whatsapp integration. Your
                    contacts & messages will be unaffected.
                  </span>
                </div>
                <div className="w-[40%] ml-auto">
                  <button className="float-right rounded-md bg-red-700 px-3 py-2 text-sm text-white shadow-sm hover:bg-red-500 focus-visible:outline  focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    Delete integration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      
    </div>
  );
};

export default WhatsAppSettings;
