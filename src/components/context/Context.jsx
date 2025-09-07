import { createContext, useEffect, useState } from "react";
import { Navigate, useLocation } from 'react-router-dom';
import axios from "axios";
import API_BASE_URL from "../../config";
import { toast } from 'react-toastify'
export const Context = createContext();

const ContextProvider = ({ children }) => {
  const [userInfo,setUserInfo]=useState({username:"",email:"",api_provider:""})
  const [loadingUser, setLoadingUser] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [group, setGroup] = useState([]);
  const [contact, setContacts] = useState([]); // New state for individual contacts
  const token = localStorage.getItem("authToken");
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
 
  const fetchDashboard = async () => {
    if (!token) return;
    try {
      const [userRes, statusRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/dashboard/`, {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        axios.get(`${API_BASE_URL}/api/whatsapp/status/`, {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      setUserInfo(userRes.data);
      setIsConnected(statusRes.data.is_connected);

      localStorage.setItem("userInfo", JSON.stringify({
        username: userRes.data.username,
        email: userRes.data.email,
      }));

      localStorage.setItem("waStatus", JSON.stringify(statusRes.data.is_connected));
    } catch (error) {
      toast.error("Failed to refresh dashboard data 🥲");
    } finally {
      setLoadingUser(false);
    }
  };


useEffect(() => {
  if (!token) {
    // No token = no user logged in, don't call protected APIs
    setSubscriptionStatus({ is_active: false });
    return;
  }
  const checkSubscription = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/subscription-status/`, {
        headers: { Authorization: `Token ${token}` },
      });
      // console.log(res.data)
      setSubscriptionStatus(res.data);
    } catch (err) {
      console.error("Failed to fetch subscription status:", err);
      setSubscriptionStatus({ is_active: false });
    }
  };

  checkSubscription();
}, [token]);


useEffect(() => {
  if (!token) return; // 🚀 Prevent unauthorized calls
  const cachedUserInfo = localStorage.getItem("userInfo");
  const cachedStatus = localStorage.getItem("waStatus");

  if (cachedUserInfo) {
    try {
      setUserInfo(JSON.parse(cachedUserInfo));
    } catch (e) {
      console.error("Invalid JSON in userInfo:", e);
      localStorage.removeItem("userInfo");
    }
  } 

  if (cachedStatus && cachedStatus !== "undefined") {
    try {
      setIsConnected(JSON.parse(cachedStatus));
    } catch (e) {
      console.error("Invalid JSON in waStatus:", e);
      localStorage.removeItem("waStatus");
    }
  }

  if (!token) return;

  // const fetchDashboard = async () => {
  //   try {
  //     const [userRes, statusRes] = await Promise.all([
  //       axios.get(`${API_BASE_URL}/api/dashboard/`, {
  //         headers: {
  //           Authorization: `Token ${token}`,
  //           'Content-Type': 'application/json',
  //         },
  //       }),
  //       axios.get(`${API_BASE_URL}/api/whatsapp/status/`, {
  //         headers: {
  //           Authorization: `Token ${token}`,
  //           'Content-Type': 'application/json',
  //         },
  //       }),
  //     ]);
  //     setUserInfo(userRes.data);
  //     setIsConnected(statusRes.data.is_connected);

  //     localStorage.setItem(
  //       "userInfo",
  //       JSON.stringify({
  //         username: userRes.data.username,
  //         email: userRes.data.email,
  //       })
  //     );
  //     localStorage.setItem(
  //       "waStatus",
  //       JSON.stringify(statusRes.data.is_connected)
  //     );
  //   } catch (error) {
  //     toast.error("Failed to refresh dashboard data 🥲");
  //   } finally {
  //     setLoadingUser(false);
  //   }
  // };

  fetchDashboard();
}, [token]);




  const value = {
    setSubscriptionStatus,
    subscriptionStatus,
    group,
    contact,
    isConnected,
    userInfo,
    setUserInfo,
    loadingUser,
    fetchDashboard,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default ContextProvider;
