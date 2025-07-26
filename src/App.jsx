import React,{useState,useEffect} from 'react'
import Sidebar, { SidebarItem } from "./components/Sidebar"
import Templates from "./components/Templates/Templates"
import CreateTemplates from "./components/Templates/CreateTemplates"
import Campaigns from "./components/Campaigns/Campaigns"
import Campaigns_Details from './components/Campaigns/Campaigns_Details'
import BulkImportContacts from './components/Contact/BulkImportContacts'
// import Contacts from './components/Contact/Contact'
import ContactManagement from './components/Contact/ContactManagement'
import ConnectWhatsAppForm from './components/ConnectForm'
import Dashboard from './components/Dashboard'
import CreateCampaigns from "./components/Campaigns/CreateCampaigns"
import ProtectedRoute from "./components/Protected_Route"
import whatsapp_details from "./components/whatsapp_details"
import WhatsAppScraper from './components/scrap'
import main_chat from "./components/Chat/main_chat"
import ChatWindow from "./components/Chat/ChatWindow"
import subscriptions from "./components/Subscriptions/subscriptions"
import NotFound from './components/notfound'
import AuthSlider from './components/Authentications/AuthSlider'
import Order from './components/Orders/Order'
// import BillingDashboard from './components/BillingDashboard'
// Landing pages..
import PrivacyPolicy from './components/LandingPage/PrivacyPolicy'
import LandingPage from './components/LandingPage/LandingPage'
import CancellationAndRefund from './components/LandingPage/CancellationAndRefund'
import ContactUs from './components/LandingPage/ContactUs'
import ShippingAndDelivery from './components/LandingPage/ShippingAndDelivery'
import TermsAndConditions from './components/LandingPage/TermsAndConditions'

import MyUsagePanel from './components/MyUsagePanel'
import FlowBuilder from './components/Flows/FlowBuilder'
import { BrowserRouter as Router, Routes, Route,useLocation} from "react-router-dom";
import {MessageSquareMore,MessagesSquare,ContactRound,MessageCircleMore,House,CreditCard ,CircleDollarSign,NotebookTabs,Workflow} from "lucide-react" 
import { SiWhatsapp } from "react-icons/si";
import { Utensils, ShoppingBasket, ReceiptText, ClipboardList, ChefHat } from "lucide-react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Wallet from './components/Wallet/Wallet'
import { useRoutes, matchRoutes } from "react-router-dom";

// Define your route list to match
const validRoutes = [
  "/",
  "/login",
  "/register",
  "/dashboard",
  "/templates",
  "/templates/create",
  "/campaigns",
  "/campaigns/create",
  "/campaigns/:id",
  "/contacts",
  "/bulk-upload",
  "/connect-form",
  "/whatsapp-setting",
  "/chats",
  "/chats/:id",
  "/subscriptions",
  "/my-usage-panel",
  // "/chat-flow",
  "/wallet",
  "/orders"
];
 
function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";
  const isLandingPage = location.pathname === "/";
  const [enableChatFlow, setEnableChatFlow] = useState(() => localStorage.getItem('chatFlowEnabled') === 'true');
  const dynamicRoutes = [...validRoutes, ...(enableChatFlow ? ['/chat-flow'] : [])];

  const match = matchRoutes(
    dynamicRoutes.map((path) => ({ path })),
    location
  );
  const isValidRoute = !!match;
  const notFoundPage = !isLoginPage && !isRegisterPage && !isValidRoute;


  const [isMobile, setIsMobile] = useState(window.innerWidth < 640); // sm = 640px

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isChatWindow =
  (location.pathname.startsWith("/chats/") && location.pathname.split("/").length === 3) ||
  (location.pathname === "/chats" && new URLSearchParams(location.search).has("recipient"));


  return (
    <main className={`flex ${isLoginPage || isRegisterPage || notFoundPage || (isMobile && isChatWindow) ? 'w-full h-screen' : 'min-h-screen'}`}>
      {!isLoginPage && !isRegisterPage && !notFoundPage && !isLandingPage && !(isMobile && isChatWindow) && (
        <div className="text-black">
          <Sidebar>
            <SidebarItem icon={<MessagesSquare size={20} />} text="Dashboard" to="/dashboard" />
            <SidebarItem icon={<ContactRound size={20} />} text="Contacts" to="/contacts" />
            <SidebarItem icon={<MessagesSquare size={20} />} text="Campaigns" to="/campaigns" />
            <SidebarItem icon={<MessageSquareMore size={20} />} text="Templates" to="/templates" />
            <SidebarItem icon={<MessageCircleMore size={20} />} text="Chats" to="/chats" />
            <SidebarItem icon={<Workflow size={20} />} text="Flows" to="/chat-flow" />
            <SidebarItem icon={<Utensils size={20} />} text="Orders" to="/orders" />
            <SidebarItem icon={<CreditCard  size={20} />} text="subscriptions" to="/subscriptions" />
            <SidebarItem icon={<CircleDollarSign size={20} />} text="Wallet" to="/Wallet" />
            <SidebarItem icon={<NotebookTabs size={20} />} text="my-usage" to="/my-usage-panel" />
            <SidebarItem icon={<SiWhatsapp size={20} />} text="Whatsapp" to="/whatsapp-setting" />
          </Sidebar>
        </div>
      )}

      <div className={`flex-1 overflow-auto ${isLoginPage || isRegisterPage || notFoundPage || (isMobile && isChatWindow) ? 'w-full' : ''}`}>
        <ToastContainer />
        <Routes>
          {/* All routes here */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/refund-policy" element={<CancellationAndRefund />} />
          <Route path="/shipping-policy" element={<ShippingAndDelivery />} />
          <Route path="/terms-policy" element={<TermsAndConditions />} />
          
          <Route path="/login" element={<AuthSlider />} />
          <Route path="/register" element={<AuthSlider />} />
          <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
          <Route path="/templates" element={<ProtectedRoute element={Templates} />} />
          <Route path="/templates/create" element={<ProtectedRoute element={CreateTemplates} />} />
          <Route path="/campaigns" element={<ProtectedRoute element={Campaigns} />} />
          <Route path="/campaigns/create" element={<ProtectedRoute element={CreateCampaigns} />} />
          <Route path="/campaigns/:id" element={<ProtectedRoute element={Campaigns_Details} />} />
          <Route path="/contacts" element={<ProtectedRoute element={ContactManagement } />} />
          {/* <Route path="/contacts" element={<ProtectedRoute element={() => <ContactManagement initialTab="contact" />} />}/> */}
          {/* <Route path="/groups" element={<ProtectedRoute element={() => <ContactManagement initialTab="group" />} />}/> */}
          <Route path="/bulk-upload" element={<ProtectedRoute element={BulkImportContacts} />} />
          <Route path="/connect-form" element={<ProtectedRoute element={ConnectWhatsAppForm} />} />
          <Route path="/whatsapp-setting" element={<ProtectedRoute element={whatsapp_details} />} />
          <Route path="/chats" element={<ProtectedRoute element={main_chat} />} />
          <Route path="/chats/:id" element={<ProtectedRoute element={ChatWindow} />} />
          <Route path="/subscriptions" element={<ProtectedRoute element={subscriptions} />} />
          <Route path="/my-usage-panel" element={<ProtectedRoute element={MyUsagePanel} />} />
          <Route path="/chat-flow" element={<ProtectedRoute element={() => <FlowBuilder setEnableChatFlow={setEnableChatFlow} />} />} />

          <Route path="/wallet" element={<ProtectedRoute element={Wallet} />} />
          <Route path="/orders" element={<ProtectedRoute element={Order} />} />
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