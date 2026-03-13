import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Context } from "../context/Context";

const WhatsAppSettings = () => {

  const token = localStorage.getItem("authToken");
  const { isConnected, setIsConnected } = useContext(Context);

  const [wp_Details, setWp_Details] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch WhatsApp Details
  useEffect(() => {
    if (!isConnected) return;

    axios
      .get(`${API_BASE_URL}/api/whatsapp/details/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setWp_Details(response.data.Data);
      })
      .catch((error) => {
        toast.error("Failed to fetch WhatsApp details.");
        console.error(error);
      });

  }, [isConnected, token]);



  // Disconnect WhatsApp
  const handleDisconnect = async () => {

    const confirm = window.confirm(
      "Are you sure you want to disconnect your WhatsApp account?"
    );

    if (!confirm) return;

    setLoading(true);

    try {

      await axios.post(
        `${API_BASE_URL}/api/whatsapp/disconnect/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      toast.success("WhatsApp disconnected successfully");

      setIsConnected(false);
      setWp_Details({});

    } catch (error) {

      toast.error("Failed to disconnect WhatsApp");

      console.error(error.response?.data || error.message);

    }

    setLoading(false);
  };



  return (
    <div className="container p-6 max-h-[100vh] overflow-auto bg-slate-100">

      {/* CONNECT UI */}
      {!isConnected && (

        <div className="flex justify-center">

          <div className="w-[450px] bg-white border shadow rounded-md p-8">

            <h3 className="text-lg font-semibold text-center mb-4">
              Connect your WhatsApp account
            </h3>

            <p className="text-center text-sm text-gray-600 mb-6">
              Connect your WhatsApp Business account to start sending and receiving messages.
            </p>

            <Link
              to="/connect-form"
              className="block bg-indigo-600 hover:bg-indigo-500 text-white text-center py-2 rounded-md"
            >
              Connect WhatsApp Business
            </Link>

          </div>

        </div>
      )}



      {/* CONNECTED UI */}
      {isConnected && (

        <div className="flex justify-center">

          <div className="w-[900px]">

            {/* DETAILS CARD */}
            <div className="bg-white border rounded-lg p-6 mb-4">

              <h3 className="text-lg font-semibold mb-4">
                WhatsApp Account Details
              </h3>


              <div className="grid grid-cols-2 gap-6 text-sm">

                <div>
                  <div className="font-medium">Display name</div>
                  <div>{wp_Details.display_name || "-"}</div>
                </div>

                <div>
                  <div className="font-medium">Connected number</div>
                  <div>{wp_Details.connected_number || "-"}</div>
                </div>

                <div>
                  <div className="font-medium">Message limits</div>
                  <div>{wp_Details.message_limits || "-"}</div>
                </div>

                <div>
                  <div className="font-medium">Quality rating</div>

                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      wp_Details.quality_rating === "GREEN"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {wp_Details.quality_rating || "UNKNOWN"}
                  </span>

                </div>

                <div>
                  <div className="font-medium">
                    WhatsApp Business Account ID
                  </div>
                  <div>{wp_Details.whatsapp_business_account_id || "-"}</div>
                </div>

                <div>
                  <div className="font-medium">Account status</div>

                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      wp_Details.number_status === "verified" ||
                      wp_Details.number_status === "ACTIVE"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {wp_Details.number_status || "PENDING"}
                  </span>

                </div>

              </div>

            </div>


            {/* DISCONNECT BUTTON */}
            <div className="flex justify-end">

              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-md"
              >
                {loading ? "Disconnecting..." : "Disconnect WhatsApp"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default WhatsAppSettings;




            {/* Business Profile Settings Form */}
            {/* <form className="bg-white border border-slate-200 rounded-lg py-2 text-sm mb-4 pb-4">
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
                <div></div>
              </div>
   */}
              {/* Profile Picture */}
              {/* <div className="flex space-x-10 border-b border-zinc-200 w-full px-4 py-6">
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
              </div> */}
  
              {/* Business Address */}
              {/* <div className="flex space-x-10 border-b border-zinc-200 w-full px-4 py-6">
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
              </div> */}
  
              {/* Business Email */}
              {/* <div className="flex space-x-10 border-b border-slate-200 w-full px-4 py-6">
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
   */}
              {/* Business Description */}
              {/* <div className="flex space-x-10 border-b border-zinc-200 w-full px-4 py-6">
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
              </div> */}
  
              {/* Business Industry */}
              {/* <div className="flex space-x-10 w-full px-4 py-6">
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
              </div> */}
  
              {/* Submit Button */}
              {/* <div className="flex px-4 pt-1 pb-2">
                <div className="ml-auto">
                  <button
                    type="submit"
                    className="float-right rounded-md bg-primary px-3 py-2 text-sm text-white shadow-sm hover:shadow-md hover:bg-primary  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </form> */}
  
            {/* Remove WhatsApp Account */}
            {/* <div className="bg-white border border-slate-200 rounded-lg py-2 text-sm mb-20">
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
            </div> */}
