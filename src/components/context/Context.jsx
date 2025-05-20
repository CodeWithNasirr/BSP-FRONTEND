import { createContext, useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import { toast } from 'react-toastify'
export const Context = createContext();

const ContextProvider = ({ children }) => {
  const [userInfo,setUserInfo]=useState({username:"",email:""})
  const [loadingUser, setLoadingUser] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [group, setGroup] = useState([]);
  const [contact, setContacts] = useState([]); // New state for individual contacts
  const token = localStorage.getItem("authToken");
  

useEffect(() => {
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

  const fetchDashboard = async () => {
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

      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          username: userRes.data.username,
          email: userRes.data.email,
        })
      );
      localStorage.setItem(
        "waStatus",
        JSON.stringify(statusRes.data.is_connected)
      );
    } catch (error) {
      toast.error("Failed to refresh dashboard data 🥲");
    } finally {
      setLoadingUser(false);
    }
  };

  fetchDashboard();
}, [token]);


  // Fetch templates, groups, and contacts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templateRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/whatsapp/templates/`, { headers: { Authorization: `Token ${token}` } }),
        //   axios.get(`${API_BASE_URL}/api/add-group/`, { headers: { Authorization: `Token ${token}` } }),
        //   axios.get(`${API_BASE_URL}/api/contacts/`, { headers: { Authorization: `Token ${token}` } }), // New endpoint
        ]);
        setTemplates(templateRes.data.Data);
        // setGroup(groupRes.data.data);
        // setContacts(contactRes.data.data); // Assuming API returns contact list
      } catch (err) {
        toast.error('Failed to fetch data');
      }
    };
    fetchData();
  }, []);



  const value = {
    templates,
    group,
    contact,
    isConnected,
    userInfo,
    setUserInfo,
    loadingUser,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default ContextProvider;
