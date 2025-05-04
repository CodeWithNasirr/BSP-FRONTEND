import axios from "axios";
import { MoreVertical, ChevronLast,ContactRound, ChevronFirst } from "lucide-react";
import { useContext, createContext, useState, useEffect } from "react";
import { useNavigate,Link } from "react-router-dom";
import { toast } from 'react-toastify'
const SidebarContext = createContext();
import API_BASE_URL from "../config";
export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(true); 

  const navigate = useNavigate();
  const logout=()=>{
    localStorage.removeItem("authToken");
    navigate('/login')
  }
  const [userInfo,setUserInfo]=useState(
    {
      username:"",
      email:""
    }
  )

  useEffect(() => {
    const token = localStorage.getItem("authToken");
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
        // console.log(userInfo);
      })
      .catch((error) => {
        toast.error("Failed to fetch user info:", error.response?.data || error.message);
      });
  }, []);
  

  return (
    <aside className="h-screen ">
      <nav className="h-full flex flex-col bg-zinc-50 text-indigo-600 border-r border-slate-200 shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
         <Link to='/' className={`overflow-hidden transition-all font-extrabold text-center mx-5 ${
              expanded ? "w-32" : "w-0"
            }`}>WhatsGptx❤️</Link>
          {/* <img
            src="https://img.logoipsum.com/243.svg"
            className={`overflow-hidden transition-all ${
              expanded ? "w-32" : "w-0"
            }`}
            alt=""
          /> */}
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>
        {/* SideBar Content */}
        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>

        {/* siderbar down area */}
        <div className="border-t border-slate-200 flex p-3">
  
          <div className={`flex space-x-2 items-center overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"} `}
          >
            <div className="rounded-xl p-1 bg-slate-200">
            <div className="rounded-full w-9 h-9 flex justify-center items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <g fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="6" r="4"></circle>
                  <path
                    strokeLinecap="round"
                    d="M19.998 18c.002-.164.002-.331.002-.5c0-2.485-3.582-4.5-8-4.5s-8 2.015-8 4.5S4 22 12 22c2.231 0 3.84-.157 5-.437"
                  ></path>
                </g>
              </svg>
            </div>
          </div>
            <div className="leading-4">
              <h4 className="font-semibold"> {userInfo.username?userInfo.username:"Anonymous"}</h4>
              <span className="text-xs text-gray-600">
                {userInfo.email?userInfo.email:"User has no Email"}
              </span>
            </div>
            </div>
            <span onClick={()=>logout()} className="flex hover:cursor-pointer items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m12 15l3-3m0 0l-3-3m3 3H4m5-4.751V7.2c0-1.12 0-1.68.218-2.108c.192-.377.497-.682.874-.874C10.52 4 11.08 4 12.2 4h4.6c1.12 0 1.68 0 2.107.218c.377.192.683.497.875.874c.218.427.218.987.218 2.105v9.607c0 1.118 0 1.677-.218 2.104a2.002 2.002 0 0 1-.875.874c-.427.218-.986.218-2.104.218h-4.606c-1.118 0-1.678 0-2.105-.218a2 2 0 0 1-.874-.874C9 18.48 9 17.92 9 16.8v-.05"
                ></path>
              </svg>
            </span>

          
        </div>
      </nav>
    </aside>
  );
}

export function SidebarItem({ icon, text, active, alert,to}) {
  const { expanded } = useContext(SidebarContext);
  const navigate = useNavigate();

  return (
    <li
      className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${active
          ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
          : "hover:bg-indigo-50 text-gray-600"
        }
    `}
      onClick={() => navigate(to)} // Redirect on click
    >
      {icon}
      <span
        className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"
          }`}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${expanded ? "" : "top-2"
            }`}
        />
      )}

      {!expanded && (
        <div
          className={`
          absolute left-full rounded-md px-2 py-1 ml-6
          bg-indigo-100 text-indigo-800 text-sm
          invisible opacity-20 -translate-x-3 transition-all
          group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
      `}
        >
          {text}
        </div>
      )}
    </li>
  );
}
