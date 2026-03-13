import { createContext, useEffect, useState } from "react";
import { Navigate, useLocation } from 'react-router-dom';
import axios from "axios";
import API_BASE_URL from "../../config";
import { toast } from 'react-toastify'
export const Context = createContext();

const ContextProvider = ({ children }) => {
  const [userInfo,setUserInfo]=useState({username:"",email:"",api_provider:"",role:""})
  const [loadingUser, setLoadingUser] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [metaBlocked, setMetaBlocked] = useState(false);
  const [metaBlockReason, setMetaBlockReason] = useState("");


  
  const token = localStorage.getItem("authToken");
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  // console.log(userInfo)
  
  const fetchDashboard = async () => {
    if (!token) return;
    try {
      const [userRes, statusRes,staff] = await Promise.all([
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
        axios.get(`${API_BASE_URL}/user/profile/`, {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);
      // ✅ Merge both user info and role into one object
      const mergedUserInfo = {
        ...userRes.data,    // username, email, contacts, templates, etc.
        role: staff.data.role,  // admin or staff
      };
      // console.log(statusRes,"statusRes")
      setUserInfo(mergedUserInfo);
      setIsConnected(statusRes.data.is_connected);
      setMetaBlocked(statusRes.data.meta_blocked);
      setMetaBlockReason(statusRes.data.meta_block_reason);


      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          username: mergedUserInfo.username,
          email: mergedUserInfo.email,
          role: mergedUserInfo.role,
        })
      );

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


  fetchDashboard();
}, [token]);




  const value = {
    metaBlockReason,
    metaBlocked,
    setSubscriptionStatus,
    subscriptionStatus,
    isConnected,
    userInfo,
    setUserInfo,
    loadingUser,
    fetchDashboard,
    setIsConnected   
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default ContextProvider;
