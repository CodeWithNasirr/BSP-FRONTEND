import React,{useState,useEffect,useContext} from 'react'
import { Context } from './components/context/Context'
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
import Booking from './components/Booking/Booking'

// import BillingDashboard from './components/BillingDashboard'


// Rest pass
import ResetPassword from './components/Authentications/ResetPassword'
import ForgotPasswordForm from './components/Authentications/ForgotPasswordForm'

// catalogs
import ProductView from './components/Catalogs/ProductView'
import CreateProduct from './components/Catalogs/CreateProduct'
import MetaCatalogSetup from './components/Catalogs/MetaCatalogSetup'


// Segment 
import SegmentManager from './components/Segment/SegmentManager'
import RFMPreview from './components/Segment/RFMPreview'
import AdvancedPage from './components/AdvancedPage'

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
import { Utensils } from "lucide-react";
import { MdViewCarousel } from "react-icons/md"; // or any other you prefer
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
  "/Credits",
  "/orders",
  "/products",
  "/products/create-pr",
  "/meta-catalog-setup",
  "/Segment",
  "/advanced",
  "/rfm-preview",
  "/Booking"
];
 
function AppContent() {
  const location = useLocation();
  const { userInfo, subscriptionStatus } = useContext(Context);
  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";
  const isLandingPage = location.pathname === "/";
  const isResetPasswordPage = location.pathname.startsWith("/reset-password");

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
  const [toast, setToast] = useState({ message: null, type: null });
  
  // Check if user is on BASIC plan
  const isBasicPlan = subscriptionStatus?.is_active && subscriptionStatus?.plan === 'BASIC';

  // Handle restricted access for BASIC plan
  const handleRestrictedAccess = (feature) => {
    if (isBasicPlan) {
      toast.error(`Please upgrade your plan to access ${feature}.`, {
        position: "top-right",
        autoClose: 3000,
      });
      return false;
    }
    return true;
  };

  return (
    <main className={`flex ${isLoginPage || isRegisterPage || notFoundPage || (isMobile && isChatWindow) ? 'w-full h-screen' : 'min-h-screen'}`}>
      {!isLoginPage && !isRegisterPage && !notFoundPage && !isResetPasswordPage && !isLandingPage && !(isMobile && isChatWindow) && (
        <div className="text-black">
        <Sidebar>
          {/* Basic items */}
          <SidebarItem icon={<MessagesSquare size={20} />} text="Dashboard" to="/dashboard" />
          <SidebarItem icon={<ContactRound size={20} />} text="Contacts" to="/contacts" />
          <SidebarItem icon={<MessagesSquare size={20} />} text="Campaigns" to="/campaigns" />
          <SidebarItem icon={<MessageSquareMore size={20} />} text="Templates" to="/templates" />
          <SidebarItem icon={<MessageCircleMore size={20} />} text="Chats" to="/chats" />
          {/* <SidebarItem icon={<Workflow size={20} />} text="Flows" to="/chat-flow" /> */}
          {!isBasicPlan && (
              <SidebarItem 
                icon={<Workflow size={20} />} 
                text="Flows" 
                to="/chat-flow" 
                onClick={() => handleRestrictedAccess("Flows")} 
              />
            )}
          <SidebarItem icon={<CreditCard size={20} />} text="Subscriptions" to="/subscriptions" />
          <SidebarItem icon={<CircleDollarSign size={20} />} text="Credits" to="/Credits" />
          <SidebarItem icon={<NotebookTabs size={20} />} text="My Usage" to="/my-usage-panel" />
          <SidebarItem icon={<SiWhatsapp size={20} />} text="Whatsapp" to="/whatsapp-setting" />
          {/* <SidebarItem icon={<MdViewCarousel size={20} />} text="Advanced" to="/advanced" /> */}
          {!isBasicPlan && (
              <SidebarItem 
                icon={<MdViewCarousel size={20} />} 
                text="Advanced" 
                to="/advanced" 
                onClick={() => handleRestrictedAccess("Advanced")} 
              />
            )}
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
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          
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

          <Route path="/Credits" element={<ProtectedRoute element={Wallet} />} />
          <Route path="/orders" element={<ProtectedRoute element={Order} />} />
          <Route path="/Booking" element={<ProtectedRoute element={Booking} />} />
          <Route path="/products" element={<ProtectedRoute element={ProductView} />} />
          <Route path="/products/create-pr" element={<ProtectedRoute element={CreateProduct} />} />
          <Route path="/meta-catalog-setup" element={<MetaCatalogSetup />} />

          <Route path="/Segment" element={<SegmentManager />} />
          <Route path="/advanced" element={<ProtectedRoute element={AdvancedPage} />} />
          <Route path="/rfm-preview" element={<RFMPreview toast={toast} setToast={setToast} />} />


        
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