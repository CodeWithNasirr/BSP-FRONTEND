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
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 lg:px-6 py-6 transition-colors duration-300">

    {/* CONNECT UI */}
    {!isConnected && (
      <div className="flex justify-center items-center min-h-[70vh]">

        <div className="w-full max-w-md rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-8">

          <div className="flex flex-col items-center text-center">

            <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-green-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.42 0 .06 5.36.06 12c0 2.12.55 4.18 1.6 6L0 24l6.18-1.62A11.94 11.94 0 0 0 12.06 24c6.64 0 12-5.36 12-12 0-3.2-1.25-6.22-3.54-8.52ZM12.06 21.8c-1.82 0-3.6-.49-5.15-1.42l-.37-.22-3.67.96.98-3.58-.24-.37A9.73 9.73 0 0 1 2.26 12c0-5.4 4.4-9.8 9.8-9.8 2.62 0 5.08 1.02 6.93 2.87A9.72 9.72 0 0 1 21.86 12c0 5.4-4.4 9.8-9.8 9.8Z" />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Connect WhatsApp
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Connect your WhatsApp Business account to start sending and receiving customer messages.
            </p>

            <Link
              to="/connect-form"
              className="w-full rounded-2xl bg-green-600 hover:bg-green-500 text-white py-3 font-medium transition-all duration-200 text-center"
            >
              Connect WhatsApp Business
            </Link>

          </div>

        </div>

      </div>
    )}

    {/* CONNECTED UI */}
    {isConnected && (
      <div className="max-w-6xl mx-auto space-y-5">

        {/* HEADER */}
        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              WhatsApp Settings
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your connected WhatsApp Business account
            </p>
          </div>

          <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
            Connected
          </div>

        </div>

        {/* DETAILS CARD */}
        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Account Details
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                WhatsApp Business account information
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* CARD ITEM */}
            {[
              {
                label: "Display Name",
                value: wp_Details.display_name || "-"
              },
              {
                label: "Connected Number",
                value: wp_Details.connected_number || "-"
              },
              {
                label: "Message Limits",
                value: wp_Details.message_limits || "-"
              },
              {
                label: "Business Account ID",
                value: wp_Details.whatsapp_business_account_id || "-"
              }
            ].map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 p-4"
              >
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                  {item.label}
                </p>

                <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                  {item.value}
                </p>
              </div>
            ))}

            {/* QUALITY */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 p-4">

              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                Quality Rating
              </p>

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  wp_Details.quality_rating === "GREEN"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                }`}
              >
                {wp_Details.quality_rating || "UNKNOWN"}
              </span>

            </div>

            {/* STATUS */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 p-4">

              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                Account Status
              </p>

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  wp_Details.number_status === "verified" ||
                  wp_Details.number_status === "ACTIVE"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                }`}
              >
                {wp_Details.number_status || "PENDING"}
              </span>

            </div>

          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end">

          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-6 py-3 text-sm font-medium transition-all duration-200"
          >
            {loading ? "Disconnecting..." : "Disconnect WhatsApp"}
          </button>

        </div>

      </div>
    )}
  </div>
);
}

export default WhatsAppSettings;