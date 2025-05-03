import React,{useState,useEffect} from 'react'
import Sidebar, { SidebarItem } from "./components/Sidebar"
import Templates from "./components/Templates/Templates"
import CreateTemplates from "./components/Templates/CreateTemplates"
import Campaigns from "./components/Campaigns/Campaigns"
import Campaigns_Details from './components/Campaigns/Campaigns_Details'
import BulkImportContacts from './components/Contact/BulkImportContacts'
import Contacts from './components/Contact/Contact'
import ConnectWhatsAppForm from './components/ConnectForm'
import Dashboard from './components/Dashboard'
import CreateCampaigns from "./components/Campaigns/CreateCampaigns"
import ProtectedRoute from "./components/Protected_Route"
import whatsapp_details from "./components/whatsapp_details"
import WhatsAppScraper from './components/scrap'
import main_chat from "./components/Chat/main_chat"
import ChatWindow from "./components/Chat/ChatWindow"
import subscriptions from "./components/subscriptions"
import NotFound from './components/notfound'
import AuthSlider from './components/Authentications/AuthSlider'
// import BillingDashboard from './components/BillingDashboard'
import MyUsagePanel from './components/MyUsagePanel'
import FlowBuilder from './components/Flows/FlowBuilder'
import { BrowserRouter as Router, Routes, Route,useLocation} from "react-router-dom";
import {MessageSquareMore,MessagesSquare,ContactRound,MessageCircleMore,House,CircleDollarSign,NotebookTabs,} from "lucide-react" 
import { SiWhatsapp } from "react-icons/si";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login" || location.pathname === "/";
  const isRegisterPage = location.pathname === "/register";
  const [isDesktop, setIsDesktop] = useState(true);
  const notFoundPage = location.pathname !== "/login" && location.pathname !== "/register" &&
    ![
      '/', '/dashboard', '/templates', '/templates/create', '/campaigns', '/campaigns/create',
      '/contacts', '/campaigns/:id', '/whatsapp-setting', '/chats', '/chats/:id', '/subscriptions'
    ].some(path => location.pathname.startsWith(path.split(':')[0])); // handles dynamic routes
  // Check if the user is on a mobile device
    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };

        handleResize(); // Check on initial load
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);
  if (!isDesktop) {
    return (
        <div className="mobile-warning text-center p-8 bg-red-100 min-h-screen flex items-center justify-center">
            <div>
                <h2 className="text-2xl font-semibold text-red-600 mb-2">Desktop & Laptop Only!</h2>
                <p className="text-lg text-red-500">
                    im Sorry buddy, this site is only accessible on desktop devices Please open it on desktop devices.
                </p>
            </div>
        </div>
    );
}
    

  return (
    <main className={`flex ${isLoginPage && isRegisterPage && !notFoundPage ? 'w-full h-screen' : 'h-screen'}`}>
      {!isLoginPage && !isRegisterPage && !notFoundPage && (
        <div className="text-black">
          <Sidebar>
            <SidebarItem icon={<MessagesSquare size={20} />} text="Dashboard" to="/dashboard" />
            <SidebarItem icon={<ContactRound size={20} />} text="Contacts" to="/contacts" />
            <SidebarItem icon={<MessagesSquare size={20} />} text="Campaigns" to="/campaigns" />
            <SidebarItem icon={<MessageSquareMore size={20} />} text="Templates" to="/templates" />
            <SidebarItem icon={<MessageCircleMore size={20} />} text="Chats" to="/chats" />
            <SidebarItem icon={<SiWhatsapp size={20} />} text="Whatsapp" to="/whatsapp-setting" />
            {/* <SidebarItem icon={<SiWhatsapp size={20} />} text="Scraper" to="/scraper"/> */}
            <SidebarItem icon={<CircleDollarSign size={20} />} text="subscriptions" to="/subscriptions" />
            <SidebarItem icon={<NotebookTabs size={20} />} text="my-usage" to="/my-usage-panel" />
            <SidebarItem icon={<NotebookTabs size={20} />} text="Flows" to="/chat-flow" />

          </Sidebar>
        </div>
      )}

      <div className={`flex-1 overflow-hidden  ${isLoginPage || isRegisterPage || notFoundPage ? 'w-full' : ''}`}>
        <ToastContainer />
        <Routes>
          {/* Public Routes */}
            <Route path="/login" element={<AuthSlider />} />
            <Route path="/" element={<AuthSlider />} />
            <Route path="/register" element={<AuthSlider />} />
  
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
            <Route path="/templates" element={<ProtectedRoute element={Templates} />} />
            <Route path="/templates/create" element={<ProtectedRoute element={CreateTemplates} />} />
            <Route path="/campaigns" element={<ProtectedRoute element={Campaigns} />} />
            <Route path="/campaigns/create" element={<ProtectedRoute element={CreateCampaigns} />} />
            <Route path="/campaigns/:id" element={<ProtectedRoute element={Campaigns_Details} />} />
            <Route path="/contacts" element={<ProtectedRoute element={Contacts} />} />
            <Route path="/bulk-upload" element={<ProtectedRoute element={BulkImportContacts} />} />
            <Route path="/connect-form" element={<ProtectedRoute element={ConnectWhatsAppForm} />} />
            <Route path="/whatsapp-setting" element={<ProtectedRoute element={whatsapp_details} />} />
            <Route path="/chats" element={<ProtectedRoute element={main_chat} />} />
            <Route path="/chats/:id" element={<ProtectedRoute element={ChatWindow} />} />
            {/* <Route path="/scraper" element={<ProtectedRoute element={WhatsAppScraper} />} /> */}
            <Route path="/subscriptions" element={<ProtectedRoute element={subscriptions} />} />
            {/* <Route path="/billingzz" element={<ProtectedRoute element={BillingDashboard} />} /> */}
            <Route path="/my-usage-panel" element={<ProtectedRoute element={MyUsagePanel} />} />
            <Route path="/chat-flow" element={<ProtectedRoute element={FlowBuilder} />} />
            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
        </Routes>
      </div> 
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}