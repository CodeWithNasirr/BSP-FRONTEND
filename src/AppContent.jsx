// ─────────────────────────────────────────────────────────────────────────────
// AppContent.jsx — Upgraded layout shell
// Keeps ALL existing routes, adds mobile bottom nav + dark mode architecture
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useContext, lazy, Suspense } from "react";
import { Context } from "./components/context/Context";
import Sidebar, { SidebarItem, MobileBottomNav } from "./components/Components/Sidebar";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, matchRoutes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  MessagesSquare, ContactRound, MessageSquareMore, MessageCircleMore,
  Workflow, CreditCard, House, Activity,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { MdViewCarousel } from "react-icons/md";

// ── Existing page imports (ALL PRESERVED) ─────────────────────────────────────
import Templates from "./components/Templates/Templates";
import CreateTemplates from "./components/Templates/CreateTemplates";
import Campaigns from "./components/Campaigns/Campaigns";
import Campaigns_Details from "./components/Campaigns/Campaigns_Details";
import BulkImportContacts from "./components/Contact/BulkImportContacts";
import ContactManagement from "./components/Contact/ContactManagement";
import ConnectWhatsAppForm from "./components/Components/ConnectForm";
import Dashboard from "./components/Components/Dashboard";
import CreateCampaigns from "./components/Campaigns/CreateCampaigns";
import ProtectedRoute from "./components/Components/Protected_Route";
import FullProtectedRoute from "./components/Components/FullProtectedRoute";
import WhatsAppSettings from "./components/Components/WhatsAppSettings";
import ChatWindow from "./components/Chat/ChatWindow";
import Subscription from "./components/Subscriptions/Subscription";
import Notfound from "./components/Components/notfound";
import AuthSlider from "./components/Authentications/AuthSlider";
import ResetPassword from "./components/Authentications/ResetPassword";
import ForgotPasswordForm from "./components/Authentications/ForgotPasswordForm";
import ProductView from "./components/Catalogs/ProductView";
import CreateProduct from "./components/Catalogs/CreateProduct";
import MetaCatalogSetup from "./components/Catalogs/MetaCatalogSetup";
import SegmentManager from "./components/Segment/SegmentManager";
import RFMPreview from "./components/Segment/RFMPreview";
import AdvancedPage from "./components/Components/AdvancedPage";
import PrivacyPolicy from "./components/LandingPage/PrivacyPolicy";
import LandingPage from "./components/LandingPage/LandingPage";
import CancellationAndRefund from "./components/LandingPage/CancellationAndRefund";
import ContactUs from "./components/LandingPage/ContactUs";
import ShippingAndDelivery from "./components/LandingPage/ShippingAndDelivery";
import TermsAndConditions from "./components/LandingPage/TermsAndConditions";
import MyUsagePanel from "./components/Components/MyUsagePanel";
import FlowBuilder from "./components/Flows/FlowBuilder";
import Wallet from "./components/Wallet/Wallet";
import MainChat from "./components/Chat/MainChat";
import WhatsAppRedirect from "./components/Components/WhatsAppRedirect";
import Order from "./components/Orders/Order";
import SmartContactManagement from './components/Contact/SmartContactManagement';
import AutomationDashboard from "./components/Automation/AutomationDashboard";
import useUnreadChats from "./hooks/useUnreadChats";
const validRoutes = [
  "/", "/login", "/register", "/dashboard", "/templates", "/templates/create",
  "/campaigns", "/campaigns/create", "/campaigns/:id", "/contacts", "/bulk-upload",
  "/connect-form", "/whatsapp-setting", "/chats", "/chats/:id", "/subscriptions",
  "/my-usage-panel", "/Credits", "/orders", "/products", "/products/create-pr",
  "/meta-catalog-setup", "/Segment", "/advanced", "/rfm-preview","/smart-contacts","/chat-flow"
];

// ── PAGE LOADER ───────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  );
}


// ── APP CONTENT ───────────────────────────────────────────────────────────────
function AppContent() {
  const location = useLocation();
  const { userInfo, subscriptionStatus, loadingUser } = useContext(Context);
  const unreadChats = useUnreadChats();
  const [enableChatFlow, setEnableChatFlow] = useState(
    () => localStorage.getItem("chatFlowEnabled") === "true"
  );
  const [toast, setToast] = useState({ message: null, type: null });

  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";
  const isLandingPage = location.pathname === "/";
  const isResetPasswordPage = location.pathname.startsWith("/reset-password");
  const isForgotPage = location.pathname === "/forgot-password";

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const isChatWindow =
    (location.pathname.startsWith("/chats/") && location.pathname.split("/").length === 3) ||
    (location.pathname === "/chats" && new URLSearchParams(location.search).has("recipient"));

  // const dynamicRoutes = [...validRoutes, ...(enableChatFlow ? ["/chat-flow"] : [])];
  // const match = matchRoutes(dynamicRoutes.map((path) => ({ path })), location);
  const match = matchRoutes(
  validRoutes.map((path) => ({ path })),
  location
);
  const isValidRoute = !!match;
  const notFoundPage = !isLoginPage && !isRegisterPage && !isValidRoute;
  const isBasicPlan = subscriptionStatus?.is_active && subscriptionStatus?.plan === "BASIC";

  // Auth/landing pages — full width, no sidebar
  const isAuthPage = isLoginPage || isRegisterPage || isLandingPage || isResetPasswordPage || isForgotPage || notFoundPage;
  const hideSidebar = isAuthPage || (isMobile && isChatWindow);
  const showMobileNav = !isAuthPage && !(isMobile && isChatWindow);



  return (
    // ── Dark mode root class — add 'dark' class to enable ─────────────────
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">

      {/* ── SIDEBAR (desktop) ── */}
      {!hideSidebar && (
        <Sidebar>
          <SidebarItem icon={<House />} text="Dashboard" to="/dashboard" />
          <SidebarItem icon={<ContactRound />} text="Contacts" to="/contacts" />
          <SidebarItem icon={<ContactRound size={20} />} text="Smart Contacts" to="/smart-contacts" />

          <SidebarItem icon={<MessagesSquare />} text="Campaigns" to="/campaigns" />
          <SidebarItem icon={<Activity />} text="Automation" to="/automation" />
          <SidebarItem icon={<MessageSquareMore />} text="Templates" to="/templates" />
          <SidebarItem icon={<MessageCircleMore />} text="Chats" to="/chats" badge={unreadChats}/>
          {!isBasicPlan && (
            <SidebarItem icon={<Workflow />} text="Flows" to="/chat-flow" />
          )}
          <SidebarItem icon={<CreditCard />} text="Subscriptions" to="/subscriptions" />
          <SidebarItem icon={<SiWhatsapp />} text="WhatsApp" to="/whatsapp-setting" />
          {!isBasicPlan && (
            <SidebarItem icon={<MdViewCarousel />} text="Advanced" to="/advanced" />
          )}
        </Sidebar>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className={`
        flex-1 overflow-auto min-w-0
        ${hideSidebar ? "w-full" : ""}
      `}>
        {/* Toast */}
        <ToastContainer
          position="top-right"
          toastClassName="!rounded-xl !text-sm !shadow-lg"
          closeButton={false}
        />

        {/* Routes — all existing routes preserved 1:1 */}
        <Routes>
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
          <Route path="/c/:slug" element={<WhatsAppRedirect />} />

          <Route path="/dashboard" element={<FullProtectedRoute element={Dashboard} />} />
          <Route path="/templates" element={<FullProtectedRoute element={Templates} />} />
          <Route path="/templates/create" element={<FullProtectedRoute element={CreateTemplates} />} />
          <Route path="/campaigns" element={<FullProtectedRoute element={Campaigns} />} />
          <Route path="/campaigns/create" element={<FullProtectedRoute element={CreateCampaigns} />} />
          <Route path="/campaigns/:id" element={<FullProtectedRoute element={Campaigns_Details} />} />
          <Route path="/automation" element={<FullProtectedRoute element={AutomationDashboard} />} />
          <Route path="/contacts" element={<FullProtectedRoute element={ContactManagement} />} />
          <Route path="/smart-contacts" element={<FullProtectedRoute element={SmartContactManagement} />} />
          <Route path="/bulk-upload" element={<FullProtectedRoute element={BulkImportContacts} />} />
          <Route path="/connect-form" element={<FullProtectedRoute element={ConnectWhatsAppForm} />} />
          <Route path="/whatsapp-setting" element={<FullProtectedRoute element={WhatsAppSettings} />} />
          <Route path="/chats" element={<FullProtectedRoute element={MainChat} />} />
          <Route path="/chats/:id" element={<FullProtectedRoute element={ChatWindow} />} />
          <Route path="/subscriptions" element={<FullProtectedRoute element={Subscription} />} />
          <Route path="/my-usage-panel" element={<FullProtectedRoute element={MyUsagePanel} />} />
          {/* <Route path="/chat-flow" element={<FullProtectedRoute element={ () => <FlowBuilder setEnableChatFlow={setEnableChatFlow} />} />} /> */}
          <Route
            path="/chat-flow"
            element={<FullProtectedRoute element={FlowBuilder} />}
          />
          <Route path="/Credits" element={<FullProtectedRoute element={Wallet} />} />
          <Route path="/orders" element={<FullProtectedRoute element={Order} />} />
          <Route path="/products" element={<FullProtectedRoute element={ProductView} />} />
          <Route path="/products/create-pr" element={<FullProtectedRoute element={CreateProduct} />} />
          <Route path="/meta-catalog-setup" element={<FullProtectedRoute element={MetaCatalogSetup} featureName="catalog" requirePlanCheck />} />
          <Route path="/Segment" element={<FullProtectedRoute element={SegmentManager} featureName="Segment" requirePlanCheck />} />
          <Route path="/advanced" element={<FullProtectedRoute element={AdvancedPage} featureName="Advanced" requirePlanCheck />} />
          <Route path="/rfm-preview" element={<FullProtectedRoute element={() => <RFMPreview toast={toast} setToast={setToast} />} />} />
          <Route path="*" element={<Notfound />} />
        </Routes>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      {showMobileNav && <MobileBottomNav />}
    </div>
  );
}

export default AppContent;