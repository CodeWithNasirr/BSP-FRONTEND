import axios from 'axios';
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Context } from "./context/Context";
import { toast } from 'react-toastify';
import API_BASE_URL from '../config'; // Adjust the path as needed
import { useRef } from "react";


const Dashboard = () => { 
  const navigate = useNavigate();
  const { userInfo, isConnected, loadingUser,fetchDashboard, metaBlocked,  metaBlockReason} = useContext(Context);
  const token = localStorage.getItem("authToken");
  const user_email = userInfo.email || '';
  const user_name = userInfo.username || '';

  // Wallet states
  const [balance, setBalance] = useState(0);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [loadingTopUp, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionPagination, setTransactionPagination] = useState({ next: null, previous: null, count: 0 });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);


    useEffect(() => {
      async function checkExistingSub() {
        if (!("serviceWorker" in navigator)) return;

        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setNotificationsEnabled(!!sub);
      }
      checkExistingSub();
    }, []);
    
    const enablePush = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            toast.info("Please allow notifications in your browser.");
            return;
          }
          if (Notification.permission === "denied") {
            toast.info("Notifications are blocked in your browser settings.");
          }

          const reg = await navigator.serviceWorker.ready;

          // fetch VAPID key
          const vapidResp = await fetch(`${API_BASE_URL}/api/vapid-public-key/`, {
            headers: { Authorization: `Token ${token}` }
          });
          const { vapid_public_key } = await vapidResp.json();

          // Convert base64 -> uint8array
          const convert = (base64String) => {
            const padding = "=".repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);

            for (let i = 0; i < rawData.length; i++) {
              outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
          };

          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convert(vapid_public_key),
          });

          // save subscription to backend
          await fetch(`${API_BASE_URL}/api/save-subscription/`, {
            method: "POST",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(sub)
          });

          setNotificationsEnabled(true);
          toast.success("Notifications Enabled");
        } catch (err) {
          console.error(err);
          toast.error("Failed to enable notifications");
        }
      };
    

    const disablePush = async () => {
        try {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.getSubscription();

          if (!sub) {
            toast.info("Notifications are already disabled.");
            return;
          }

          // Unsubscribe from browser
          await sub.unsubscribe();

          // Remove from backend
          await fetch(`${API_BASE_URL}/api/delete-subscription/`, {
            method: "POST",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ endpoint: sub.endpoint })
          });

          setNotificationsEnabled(false);
          toast.success("Notifications Disabled");
        } catch (err) {
          console.error(err);
          toast.error("Could not disable notifications");
        }
      };





  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wallet/balance/`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setBalance(response.data.balance || 0);
    } catch (error) {
      toast.error("Failed to fetch wallet balance");
    }
  };

  // Fetch wallet transaction history
  const fetchWalletHistory = async (pageNum) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wallet/history/?page=${pageNum}`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = response.data;
      setTransactions(data.results || []);
      setTransactionPagination({
        next: data.next,
        previous: data.previous,
        count: data.count,
      });
    } catch (error) {
      toast.error("Failed to fetch wallet history");
    }
  };

  // Load balance and history on mount and when page changes
  useEffect(() => {
    fetchWalletBalance();
    fetchWalletHistory(transactionPage);
  }, [transactionPage]);


 // Handle top-up with Razorpay
   const handleTopUp = async () => {
     if (!topUpAmount || topUpAmount <= 0) {
       toast.error("Please enter a valid amount");
       return;
     }
 
     setLoading(true);
     try {
       const response = await axios.post(
         `${API_BASE_URL}/api/wallet/create-order/`,
         { amount: topUpAmount },
         {
           headers: {
             Authorization: `Token ${token}`,
             'Content-Type': 'application/json',
           },
         }
       );
 
       const { order_id, amount, currency, razorpay_key_id } = response.data;
 
       const options = {
         key: razorpay_key_id,
         amount: amount,
         currency: currency,
         name: "WhatsAppGPTx",
         description: "Wallet Top-Up",
         order_id: order_id,
         handler: async (response) => {
           const verifyResponse = await axios.post(
             `${API_BASE_URL}/api/wallet/verify-payment/`,
             {
               razorpay_order_id: response.razorpay_order_id,
               razorpay_payment_id: response.razorpay_payment_id,
               razorpay_signature: response.razorpay_signature,
             },
             {
               headers: {
                 Authorization: `Token ${token}`,
                 'Content-Type': 'application/json',
               },
             }
           );
          //  console.log(verifyResponse.data)
 
           if (verifyResponse.data.status === 'success') {
             toast.success("Wallet topped up successfully!");
             setBalance(verifyResponse.data.new_balance);
             setTopUpAmount('');
             fetchWalletHistory(transactionPage); // Refresh history after top-up
           } else {
            //  console.log(verifyResponse.data.error)
             toast.error("Payment verification failed");
           }
         },
         prefill: {
           name: user_name,
           email: user_email,
          
         },
         theme: {
           color: "#3399cc",
         },
       };
 
       const razorpay = new window.Razorpay(options);
       razorpay.open();
     } catch (error) {
       toast.error("Failed to process payment");
     } finally {
       setLoading(false);
     }
   };


   const startWhatsAppOnboarding = async () => {
    const sessionId = crypto.randomUUID();

    // Save locally (for safety)
    localStorage.setItem("wa_onboarding_session", sessionId);

    // Tell backend: "this session belongs to THIS user"
    await axios.post(
      `${API_BASE_URL}/api/start-whatsapp-onboarding/`,
      { session_id: sessionId },
      {
        headers: {
          Authorization: `Token ${token}`, // ✅ HERE token is valid
        },
      }
    );

    launchWhatsAppSignup(sessionId);
  };



   const [fbReady, setFbReady] = useState(false);

  useEffect(() => {
    // 1️⃣ Load Facebook SDK only once
    if (!window.FB) {
      window.fbAsyncInit = () => {
        window.FB.init({
          appId: "3890308814613591",
          autoLogAppEvents: true,
          xfbml: true,
          version: "v23.0",
        });

        setFbReady(true); // ✅ SDK READY
      };

      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    } else {
      setFbReady(true);
    }

    // 2️⃣ Message handler (SAME reference for cleanup)
    const messageHandler = (event) => {
      if (!event.origin.endsWith("facebook.com")) return;

      let data;
      try {
        if (typeof event.data !== "string") return;
        if (!event.data.trim().startsWith("{")) return;

        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (data.type === "WA_EMBEDDED_SIGNUP") {
        const sessionId = localStorage.getItem("wa_onboarding_session");

        axios.post(
          `${API_BASE_URL}/api/whatsapp-signup/`,
          { ...data, state: sessionId },
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
      }
    };


    window.addEventListener("message", messageHandler);

    // 3️⃣ Proper cleanup
    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, []); // 🚨 NO token dependency

 
  // Response callback for token
    const fbLoginCallback = (response) => {
    if (!response.authResponse) {
      toast.error("WhatsApp login failed");
      return;
    }

    const sessionId = localStorage.getItem("wa_onboarding_session");

    axios.post(
      `${API_BASE_URL}/api/exchange-token/`,
      {
        code: response.authResponse.code,
        state: sessionId, // 🔥 send state
      }
    )
    .then(() => {
      toast.success("WhatsApp connected successfully!");
      fetchDashboard();
    })
    .catch(() => toast.error("Token exchange failed"));
  };


  // Launch WhatsApp Signup
  const launchWhatsAppSignup = (sessionId) => {
  if (!fbReady || !window.FB) {
    toast.error("Facebook SDK still loading. Please wait.");
    return;
  }

  window.FB.login(
    fbLoginCallback,
    {
      config_id: "3713662958940509",
      response_type: "code",
      override_default_response_type: true,
      extras: {
        setup: {},
        featureType: "whatsapp_business_app_onboarding",
        sessionInfoVersion: "3",
        state: sessionId,
      },
    }
  );
  };



  return (
  <>
      {loadingUser ? (
        <div className="animate-pulse text-center text-2xl text-gray-400 my-50">Loading dashboard...</div>
      ) : (
        <div className="md:max-h-screen flex flex-col w-full min-w-0 max-h-screen">
          <div className="bg-white md:bg-inherit p-4 md:p-8 rounded-[5px] text-[#000] h-full overflow-y-auto capitalize">
            <div className="flex flex-col sm:flex-row justify-between mt-3 md:mt-0">
              <div>
                <h2 className="md:block hidden text-xl mb-1">Dashboard</h2>

                <p className="mb-2 flex items-center leading-6">
                  <span className="mt-1 font-semibold md:font-normal text-xl">
                    {userInfo.username
                      ? `Welcome back ${userInfo.username}👋`
                      : "Welcome "}
                  </span>
                </p>

                {metaBlocked && (
                  <div className="mb-4 p-3 rounded-md bg-red-100 border border-red-300 text-red-700 text-sm">
                    <strong>⚠ WhatsApp Business Account Locked</strong>
                    <div className="mt-1">
                      {metaBlockReason ||
                        "Your WhatsApp Business account has been temporarily blocked by Meta."}
                    </div>
                  </div>
                )}
              </div>

            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mb-8 text-xs md:text-sm">
              <a
                className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm text-center"
                href=""
                onClick={(e) => (e.preventDefault(), navigate('/contacts'))}
              >
                Add Contact
              </a>
              <a
                className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm text-center"
                href=""
                onClick={(e) => (e.preventDefault(), navigate('/campaigns'))}
              >
                Create Campaign
              </a>
              <a
                className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm text-center"
                href=""
                onClick={(e) => (e.preventDefault(), navigate('/templates/create'))}
              >
                Create Template
              </a>
              {/* <Link
                to={isConnected ? "#" : "/connect-form"}
                onClick={(e) => isConnected && e.preventDefault()}
                className={`rounded-md cursor-pointer ${
                  isConnected ? 'bg-green-500 hover:bg-green-400' : 'bg-indigo-600 hover:bg-indigo-500'
                } px-3 py-2 text-sm font-semibold text-white shadow-sm text-center`}
                disabled={isConnected}
              >
                {isConnected ? 'Connected WhatsApp Successfully' : 'Connect WhatsApp Business'}
              </Link> */}
              <button
                onClick={startWhatsAppOnboarding}
                disabled={isConnected}
                className={`rounded-md cursor-pointer ${
                  isConnected ? 'bg-green-500 hover:bg-green-400' : 'bg-indigo-600 hover:bg-indigo-500'
                } px-3 py-2 text-sm font-semibold text-white shadow-sm text-center`}
              >
                {isConnected ? 'Connected WhatsApp Successfully' : 'Connect WhatsApp Business'}
              </button>
            {notificationsEnabled ? (
                  <button
                    onClick={disablePush}
                    className="m-2 bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600"
                  >
                    Disable Notifications
                  </button>
                ) : (
                  <button
                    onClick={enablePush}
                    className="m-2 bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Enable Notifications
                  </button>
                )}
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-4 md:space-y-0">
              {/* Contacts Card */}
              <div className="bg-slate-100 md:bg-slate-200 col-span-2 sm:col-span-1 md:col-span-1 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-base md:text-lg font-medium">Contacts</h2>
                    <h2 className="text-lg md:text-xl text-gray-600">{userInfo.contacts}</h2>
                  </div>
                  <div className="flex">
                    <span className="bg-secondary/10 p-2 md:p-3 rounded-full self-start">
                      <svg className="text-secondary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" md:width="36" md:height="36" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464C22 4.93 22 7.286 22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m7 14l2.293-2.293a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 0 1.414 0L17 10m0 0v2.5m0-2.5h-2.5"></path>
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="text-xs md:text-sm space-x-1 mt-2 md:block hidden">
                  <a className="flex items-center space-x-1 underline" href="" onClick={(e) => (e.preventDefault(), navigate('/contacts'))}>
                    <span>View Contacts</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" md:width="24" height="16" md:height="24" viewBox="0 0 24 24">
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 16l8-8m0 0h-6m6 0v6"></path>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Campaigns Card */}
              <div className="bg-slate-100 md:bg-slate-200 col-span-2 sm:col-span-1 md:col-span-1 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-base md:text-lg font-medium">Campaigns</h2>
                    <h2 className="text-lg md:text-xl text-gray-600">{userInfo.campaigns}</h2>
                  </div>
                  <div className="flex">
                    <span className="bg-secondary/10 p-2 md:p-3 rounded-full self-start">
                      <svg className="text-secondary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" md:width="36" md:height="36" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464C22 4.93 22 7.286 22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m7 14l2.293-2.293a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 0 1.414 0L17 10m0 0v2.5m0-2.5h-2.5"></path>
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="text-xs md:text-sm space-x-1 mt-2 md:block hidden">
                  <a className="flex items-center space-x-1 underline" href="" onClick={(e) => (e.preventDefault(), navigate('/campaigns'))}>
                    <span>View Campaigns</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" md:width="24" height="16" md:height="24" viewBox="0 0 24 24">
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 16l8-8m0 0h-6m6 0v6"></path>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Templates Card */}
              <div className="bg-slate-100 md:bg-slate-200 col-span-2 sm:col-span-1 md:col-span-1 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-base md:text-lg font-medium">Templates</h2>
                    <h2 className="text-lg md:text-xl text-gray-600">{userInfo.templates}</h2>
                  </div>
                  <div className="flex">
                    <span className="bg-secondary/10 p-2 md:p-3 rounded-full self-start">
                      <svg className="text-secondary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" md:width="36" md:height="36" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464C22 4.93 22 7.286 22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m7 14l2.293-2.293a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 0 1.414 0L17 10m0 0v2.5m0-2.5h-2.5"></path>
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="text-xs md:text-sm space-x-1 mt-2 md:block hidden">
                  <a className="flex items-center space-x-1 underline" onClick={(e) => (e.preventDefault(), navigate('/templates'))}>
                    <span>View Templates</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" md:width="24" height="16" md:height="24" viewBox="0 0 24 24">
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 16l8-8m0 0h-6m6 0v6"></path>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Chats Card */}
              <div className="bg-slate-100 md:bg-slate-200 col-span-2 sm:col-span-1 md:col-span-1 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-base md:text-lg font-medium">All Chats</h2>
                    <h2 className="text-lg md:text-xl text-gray-600">{userInfo.chats}</h2>
                  </div>
                  <div className="flex">
                    <span className="bg-secondary/10 p-2 md:p-3 rounded-full self-start">
                      <svg className="text-secondary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" md:width="36" md:height="36" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464C22 4.93 22 7.286 22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m7 14l2.293-2.293a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 0 1.414 0L17 10m0 0v2.5m0-2.5h-2.5"></path>
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="text-xs md:text-sm space-x-1 mt-2 md:block hidden">
                  <a className="flex items-center space-x-1 underline" onClick={(e) => (e.preventDefault(), navigate('/chats'))}>
                    <span>View Chats</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" md:width="24" height="16" md:height="24" viewBox="0 0 24 24">
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 16l8-8m0 0h-6m6 0v6"></path>
                    </svg>
                  </a>
                </div>
              </div>

             {/* Credits Card */}
            <div className="bg-slate-100 md:bg-slate-200 col-span-2 sm:col-span-1 md:col-span-4 rounded-lg p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Credits</h2>
                  <p className="text-xl sm:text-2xl text-green-600 font-medium">{balance.toFixed(2)}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Available for campaigns</p>
                </div>

                <div className="text-left sm:text-right mt-4 sm:mt-0">
                  {/* <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      type="number"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full sm:w-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                    <button
                      onClick={handleTopUp}
                      disabled={loadingTopUp}
                      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 ${
                        loadingTopUp ? 'cursor-not-allowed' : ''
                      }`}
                    >
                      {loadingTopUp ? 'Processing...' : 'Top Up'}
                    </button>
                  </div> */} 

                  {/* <div className="flex justify-start sm:justify-end space-x-2 mt-2">
                    {[500, 1000, 2000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setTopUpAmount(amount.toString())}
                        className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-700 text-xs"
                      >
                        {amount}
                      </button>
                    ))}
                  </div> */}
                </div>
              </div>

              {/* Transaction History */}
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Transaction History</h3>
                {transactions.length > 0 ? (
                  <div className="overflow-x-auto max-h-[130px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-xs sm:text-sm font-medium text-gray-700">Date</th>
                          <th className="p-2 text-xs sm:text-sm font-medium text-gray-700">Type</th>
                          <th className="p-2 text-xs sm:text-sm font-medium text-gray-700">Amount</th>
                          <th className="p-2 text-xs sm:text-sm font-medium text-gray-700">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 text-xs sm:text-sm text-gray-600">
                              {new Date(transaction.timestamp).toLocaleString()}
                            </td>
                            <td className="p-2 text-xs sm:text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  transaction.transaction_type === 'CREDIT'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {transaction.transaction_type}
                              </span>
                            </td>
                            <td className="p-2 text-xs sm:text-sm text-gray-600">
                              {Math.abs(transaction.amount).toFixed(2)}
                              {transaction.transaction_type === 'DEBIT' ? ' (Deducted)' : ' (Added)'}
                            </td>
                            <td className="p-2 text-xs sm:text-sm text-gray-600">{transaction.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => setTransactionPage((prev) => Math.max(prev - 1, 1))}
                        disabled={!transactionPagination.previous}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-xs sm:text-sm"
                      >
                        Previous
                      </button>
                      <span className="text-xs sm:text-sm">
                        Page {transactionPage} of {Math.ceil(transactionPagination.count / 10)}
                      </span>
                      <button
                        onClick={() => setTransactionPage((prev) => prev + 1)}
                        disabled={!transactionPagination.next}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-xs sm:text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 text-xs sm:text-sm">No transactions yet.</p>
                )}
              </div>
            </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
