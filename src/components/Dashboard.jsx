import axios from 'axios';
import { User } from 'lucide-react';
import React,{useState,useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import API_BASE_URL from '../config';
const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const [isConnected, setIsConnected] = useState(false);

// Starting 
  const [userInfo,setUserInfo]=useState(
    {
      username:"",
      email:""
    }
  )
  useEffect(() => {
    if (!token) {
      // alert("No auth token found! 💔");
      return;
    }
    axios
      .get(`${API_BASE_URL}/dash-details/`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        setUserInfo(response.data);
      
      })
      .catch((error) => {
        alert("Failed to fetch user info:", error.response?.data || error.message);
      });
  }, []);
// Ending

// Starting
useEffect(()=>{
  axios
  .get(`${API_BASE_URL}/check-whatsapp-status`, {
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    },
  })
  .then((response)=>{
    setIsConnected(response.data.is_connected);
  })
  .catch((error)=>{
    alert("Failed to fetch user info:", error.response?.data || error.message);
  })
},[])


    const clientId = "1354428199237692";
    const REDIRECT_URI = "https://whatsappx.up.railway.app/facebook/callback/";
    const scope = "whatsapp_business_management,whatsapp_business_messaging,public_profile";

    const handleFacebookLogin = () => {
      const url = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${clientId}&redirect_uri=${REDIRECT_URI}&scope=${scope}&response_type=code&display=popup`;
      window.open(url, 'fbPopup','width=500,height=600');
    };

    
  return (
    <div className="md:min-h-screen flex flex-col w-full min-w-0">
      <div className="bg-white md:bg-inherit p-4 md:p-8 rounded-[5px] text-[#000] h-full overflow-y-auto capitalize">
        <div className="flex justify-between mt-3 md:mt-0">
          <div>
            <h2 className="md:block hidden text-xl mb-1">Dashboard</h2>
            <p className="mb-6 flex items-center leading-6">
              <span className="mt-1 font-semibold md:font-normal text-xl">{userInfo.username?`Welcome back ${userInfo.username}👋`:"Welcome "}</span>
            </p>
          </div>
        </div>
        <div className="flex space-x-2 mb-8 text-xs md:text-sm">
          <a className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm" href="" onClick={(e)=>(e.preventDefault(),navigate('/contacts'))}>Add Contact</a>
          <a className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm" href="" onClick={(e)=>(e.preventDefault(),navigate('/campaigns'))}>Create Campaign</a>
          <a className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm" href="" onClick={(e)=>(e.preventDefault(),navigate('/templates/create'))}>Create Template</a>
          <a className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm" href="" onClick={(e)=>(e.preventDefault(),navigate('/scraper'))}>Scraper</a>

          <button onClick={handleFacebookLogin} className={`rounded-md cursor-pointer ${isConnected ? 'bg-green-500 hover:bg-green-400' : 'bg-indigo-600 hover:bg-indigo-500'
            } px-3 py-2 text-sm font-semibold text-white shadow-sm`}
            disabled={isConnected}>{isConnected ? 'Connected WhatsApp Successfully' : 'Connect WhatsApp Business'}</button>

        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 md:space-y-0">
          <div className="bg-slate-100 md:bg-slate-200 col-span-2 md:col-span-1 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <h2>Contacts</h2>
                <h2 className="text-xl text-gray-600">{userInfo.contacts}</h2>
              </div>
              <div className="flex">
                <span className="bg-secondary/10 p-3 rounded-full self-start">
                  <svg className="text-secondary" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464C22 4.93 22 7.286 22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m7 14l2.293-2.293a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 0 1.414 0L17 10m0 0v2.5m0-2.5h-2.5"></path>
                    </g>
                  </svg>
                </span>
              </div>
            </div>
            <div className="text-sm space-x-1 md:block hidden">
              <a className="flex items-center space-x-1 underline" href="" onClick={(e)=>(e.preventDefault(),navigate('/Contact'))}  >
                <span>View Contacts</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 16l8-8m0 0h-6m6 0v6"></path>
                </svg>
              </a>
            </div>
          </div>
          <div className="bg-slate-100 md:bg-slate-200 col-span-2 md:col-span-1 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <h2>Campaigns</h2>
                <h2 className="text-xl text-gray-600">{userInfo.campaigns}</h2>
              </div>
              <div className="flex">
                <span className="bg-secondary/10 p-3 rounded-full self-start">
                  <svg className="text-secondary" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464C22 4.93 22 7.286 22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m7 14l2.293-2.293a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 0 1.414 0L17 10m0 0v2.5m0-2.5h-2.5"></path>
                    </g>
                  </svg>
                </span>
              </div>
            </div>
            <div className="text-sm space-x-1 md:block hidden">
              <a className="flex items-center space-x-1 underline" href="" onClick={(e)=>(e.preventDefault(),navigate('/campaigns'))}>
                <span>View Campaigns</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 16l8-8m0 0h-6m6 0v6"></path>
                </svg>
              </a>
            </div>
          </div>
          <div className="bg-slate-100 md:bg-slate-200 col-span-2 md:col-span-1 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <h2>Tempaltes</h2>
                <h2 className="text-xl text-gray-600">{userInfo.templates}</h2>
              </div>
              <div className="flex">
                <span className="bg-secondary/10 p-3 rounded-full self-start">
                  <svg className="text-secondary" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464C22 4.93 22 7.286 22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m7 14l2.293-2.293a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 0 1.414 0L17 10m0 0v2.5m0-2.5h-2.5"></path>
                    </g>
                  </svg>
                </span>
              </div>
            </div>
            <div className="text-sm space-x-1 md:block hidden">
              <a className="flex items-center space-x-1 underline" href="" onClick={(e)=>(e.preventDefault(),navigate('/templates'))}>
                <span>View Templates</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 16l8-8m0 0h-6m6 0v6"></path>
                </svg>
              </a>
            </div>
          </div>
          <div className="bg-slate-100 md:bg-slate-200 col-span-2 md:col-span-1 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <h2>All Chats</h2>
                <h2 className="text-xl text-gray-600">{userInfo.chats}</h2>
              </div>
              <div className="flex">
                <span className="bg-secondary/10 p-3 rounded-full self-start">
                  <svg className="text-secondary" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464C22 4.93 22 7.286 22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m7 14l2.293-2.293a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 0 1.414 0L17 10m0 0v2.5m0-2.5h-2.5"></path>
                    </g>
                  </svg>
                </span>
              </div>
            </div>
            <div className="text-sm space-x-1 md:block hidden">
              <a className="flex items-center space-x-1 underline" href="/chats">
                <span>View Chats</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 16l8-8m0 0h-6m6 0v6"></path>
                </svg>
              </a>
            </div>
          </div>
          {/* Repeat similar structure for other cards like Campaigns, Templates, All Chats */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



// {/* <div className="md:grid md:grid-cols-2 gap-x-4 mt-4">
//           <div className="md:block hidden">
//             <div id="chart">
           
//             </div>
//           </div>
//           <div className="space-y-5">
//             <div className="flex justify-between rounded-lg py-4 px-4 bg-red-500 text-white">
//               <div>
//                 <h2>Your trial period is over.</h2>
//                 <p className="text-sm">Please subscribe to a plan to continue using the app.</p>
//                 <a className="p-2 rounded-lg text-sm mt-5 flex px-3 w-fit bg-white text-gray-600" href="/subscription">
//                   Subscribe
//                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                   
//                   </svg>
//                 </a>
//               </div>
//               <div className="flex">
//                 <span className="h-16 w-16 p-3 flex justify-center items-center rounded-full self-start bg-white text-red-500">
//                   <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 512 512">
                 
//                   </svg>
//                 </span>
//               </div>
//             </div>
//             {/* Additional components like Setup Team, Campaigns, etc. */}
//           </div>
//         </div> */}