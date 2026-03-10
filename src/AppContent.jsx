import React, { useState, useEffect, useContext } from 'react';
import { Context } from './components/context/Context';
import Sidebar, { SidebarItem } from './components/Components/Sidebar';
import Templates from './components/Templates/Templates';
import CreateTemplates from './components/Templates/CreateTemplates';
import Campaigns from './components/Campaigns/Campaigns';
import Campaigns_Details from './components/Campaigns/Campaigns_Details';
import BulkImportContacts from './components/Contact/BulkImportContacts';
import ContactManagement from './components/Contact/ContactManagement';
import ConnectWhatsAppForm from './components/Components/ConnectForm';
import Dashboard from './components/Components/Dashboard';
import CreateCampaigns from './components/Campaigns/CreateCampaigns';
import ProtectedRoute from './components/Components/Protected_Route';
import FullProtectedRoute from './components/Components/FullProtectedRoute';
import WhatsAppSettings from './components/Components/WhatsAppSettings';
import ChatWindow from './components/Chat/ChatWindow';
import Subscription from './components/Subscriptions/Subscription';
import Notfound from './components/Components/notfound';
import AuthSlider from './components/Authentications/AuthSlider';
import Order from './components/Orders/Order';

// admin routers


// ❌ COMMENTED OUT — Booking imports
// import DashboardPage from './components/Booking/DashboardPage';
// import B_Sidebar from './components/Booking/B_Sidebar';
// import StaffPage from './components/Booking/StaffPage';
// import JobsPage from './components/Booking/JobsPage';
// import StaffJobsPage from './components/Booking/StaffJobsPage';

import ResetPassword from './components/Authentications/ResetPassword';
import ForgotPasswordForm from './components/Authentications/ForgotPasswordForm';
import ProductView from './components/Catalogs/ProductView';
import CreateProduct from './components/Catalogs/CreateProduct';
import MetaCatalogSetup from './components/Catalogs/MetaCatalogSetup';
import SegmentManager from './components/Segment/SegmentManager';
import RFMPreview from './components/Segment/RFMPreview';
import AdvancedPage from './components/Components/AdvancedPage';
import PrivacyPolicy from './components/LandingPage/PrivacyPolicy';
import LandingPage from './components/LandingPage/LandingPage';
import CancellationAndRefund from './components/LandingPage/CancellationAndRefund';
import ContactUs from './components/LandingPage/ContactUs';
import ShippingAndDelivery from './components/LandingPage/ShippingAndDelivery';
import TermsAndConditions from './components/LandingPage/TermsAndConditions';
import MyUsagePanel from './components/Components/MyUsagePanel';
import FlowBuilder from './components/Flows/FlowBuilder';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { MessageSquareMore, MessagesSquare, ContactRound, MessageCircleMore, House, CreditCard, CircleDollarSign, NotebookTabs, Workflow } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { MdViewCarousel } from 'react-icons/md';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Wallet from './components/Wallet/Wallet';
import { useRoutes, matchRoutes } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainChat from './components/Chat/MainChat';
import WhatsAppRedirect from './components/Components/WhatsAppRedirect';


const validRoutes = [
  '/',
  '/login',
  '/register',
  '/dashboard',
  // ❌ COMMENTED OUT — '/staff-dashboard',
  '/templates',
  '/templates/create',
  '/campaigns',
  '/campaigns/create',
  '/campaigns/:id',
  '/contacts',
  '/bulk-upload',
  '/connect-form',
  '/whatsapp-setting',
  '/chats',
  '/chats/:id',
  '/subscriptions',
  '/my-usage-panel',
  '/Credits',
  '/orders',
  '/products',
  '/products/create-pr',
  '/meta-catalog-setup',
  '/Segment',
  '/advanced',
  '/rfm-preview',
  // ❌ COMMENTED OUT — '/booking', '/booking/b_dashboard', etc.
];

// ❌ COMMENTED OUT — Staff-only routes
// const staffAllowedRoutes = ['/staff-dashboard', '/login', '/register', '/forgot-password', '/reset-password/:uid/:token', '/', '/privacy', '/contact-us', '/refund-policy', '/shipping-policy', '/terms-policy'];

function AppContent() {
  const location = useLocation();
  const { userInfo, subscriptionStatus, loadingUser } = useContext(Context);
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isLandingPage = location.pathname === '/';
  const isResetPasswordPage = location.pathname.startsWith('/reset-password');

  const [enableChatFlow, setEnableChatFlow] = useState(() => localStorage.getItem('chatFlowEnabled') === 'true');
  const dynamicRoutes = [...validRoutes, ...(enableChatFlow ? ['/chat-flow'] : [])];

  const match = matchRoutes(dynamicRoutes.map((path) => ({ path })), location);
  const isValidRoute = !!match;
  const notFoundPage = !isLoginPage && !isRegisterPage && !isValidRoute;
  const [canShowSidebar, setCanShowSidebar] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.addEventListener('resize', handleResize);
  }, []);

  const isChatWindow =
    (location.pathname.startsWith('/chats/') && location.pathname.split('/').length === 3) ||
    (location.pathname === '/chats' && new URLSearchParams(location.search).has('recipient'));
  const [toast, setToast] = useState({ message: null, type: null });
  const isBasicPlan = subscriptionStatus?.is_active && subscriptionStatus?.plan === 'BASIC';

  // ❌ COMMENTED OUT — Staff role detection and routing
  // const isStaff = userInfo?.role === 'staff';
  // const isRouteAllowed = isStaff ? staffAllowedRoutes.some((route) => matchRoutes([{ path: route }], location)) : true;
  // if (isStaff && !isRouteAllowed && !isLoginPage && !isRegisterPage && !isResetPasswordPage && !isLandingPage) {
  //   return <Navigate to="/staff-dashboard" replace />;
  // }

  useEffect(() => {
    if (!subscriptionStatus) {
      setCanShowSidebar(false);
      return;
    }
    const restrictedRoutes = ['/advanced', '/chat-flow'];
    const isRestricted = restrictedRoutes.some((path) => location.pathname.startsWith(path));
    const isBasicPlan = subscriptionStatus?.is_active && subscriptionStatus?.plan === 'BASIC';
    setCanShowSidebar(!(isRestricted && isBasicPlan));
  }, [location.pathname, subscriptionStatus]);

  return (
    <main
      className={`flex ${isLoginPage || isRegisterPage || notFoundPage || (isMobile && isChatWindow) ? 'w-full h-screen' : 'min-h-screen'}`}
    >
      {!isLoginPage &&
        !isRegisterPage &&
        !notFoundPage &&
        !isResetPasswordPage &&
        !isLandingPage &&
        !(isMobile && isChatWindow) && canShowSidebar && (
          <div className="text-black">
            <Sidebar>
              {/* ❌ COMMENTED OUT — Staff sidebar item
              {isStaff ? (
                <SidebarItem icon={<MessagesSquare size={20} />} text="My Jobs" to="/staff-dashboard" />
              ) : ( */}
              <>
                <SidebarItem icon={<MessagesSquare size={20} />} text="Dashboard" to="/dashboard" />
                <SidebarItem icon={<ContactRound size={20} />} text="Contacts" to="/contacts" />
                <SidebarItem icon={<MessagesSquare size={20} />} text="Campaigns" to="/campaigns" />
                <SidebarItem icon={<MessageSquareMore size={20} />} text="Templates" to="/templates" />
                <SidebarItem icon={<MessageCircleMore size={20} />} text="Chats" to="/chats" />
                {!isBasicPlan && (
                  <SidebarItem icon={<Workflow size={20} />} text="Flows" to="/chat-flow" />
                )}
                <SidebarItem icon={<CreditCard size={20} />} text="Subscriptions" to="/subscriptions" />
                {/* <SidebarItem icon={<CircleDollarSign size={20} />} text="Credits" to="/Credits" /> */}
                {/* <SidebarItem icon={<NotebookTabs size={20} />} text="My Usage" to="/my-usage-panel" /> */}
                <SidebarItem icon={<SiWhatsapp size={20} />} text="Whatsapp" to="/whatsapp-setting" />
                {!isBasicPlan && (
                  <SidebarItem icon={<MdViewCarousel size={20} />} text="Advanced" to="/advanced" />
                )}
              </>
              {/* )} ❌ END COMMENTED OUT */}
            </Sidebar>
          </div>
        )}

      <div
        className={`flex-1 overflow-auto ${isLoginPage || isRegisterPage || notFoundPage || (isMobile && isChatWindow) ? 'w-full' : ''}`}
      >
        <ToastContainer />
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
          <Route path="/dashboard" element={<FullProtectedRoute element={Dashboard} />} />
          <Route path="/c/:slug" element={<WhatsAppRedirect />} />
          {/* <Route path="/notifications" element={<NotificationTimeline />} /> */}
          {/* ❌ COMMENTED OUT — Staff dashboard route
          <Route path="/staff-dashboard" element={<FullProtectedRoute element={StaffJobsPage} />} />
          */}

          <Route path="/templates" element={<FullProtectedRoute element={Templates} />} />
          <Route path="/templates/create" element={<FullProtectedRoute element={CreateTemplates} />} />
          <Route path="/campaigns" element={<FullProtectedRoute element={Campaigns} />} />
          <Route path="/campaigns/create" element={<FullProtectedRoute element={CreateCampaigns} />} />
          <Route path="/campaigns/:id" element={<FullProtectedRoute element={Campaigns_Details} />} />
          <Route path="/contacts" element={<FullProtectedRoute element={ContactManagement} />} />
          <Route path="/bulk-upload" element={<FullProtectedRoute element={BulkImportContacts} />} />
          <Route path="/connect-form" element={<FullProtectedRoute element={ConnectWhatsAppForm} />} />
          <Route path="/whatsapp-setting" element={<FullProtectedRoute element={WhatsAppSettings} />} />
          <Route path="/chats" element={<FullProtectedRoute element={() => <MainChat />} />} />
          <Route path="/chats/:id" element={<FullProtectedRoute element={() => <ChatWindow />} />} />
          <Route path="/subscriptions" element={<FullProtectedRoute element={Subscription} />} />
          <Route path="/my-usage-panel" element={<FullProtectedRoute element={MyUsagePanel} />} />
          <Route
            path="/chat-flow"
            element={<FullProtectedRoute element={() => <FlowBuilder setEnableChatFlow={setEnableChatFlow} />} />}
          />
          <Route path="/Credits" element={<FullProtectedRoute element={Wallet} />} />
          <Route path="/orders" element={<FullProtectedRoute element={Order} />} />
          <Route path="/products" element={<FullProtectedRoute element={ProductView} />} />
          <Route path="/products/create-pr" element={<FullProtectedRoute element={CreateProduct} />} />
          <Route
            path="/meta-catalog-setup"
            element={<FullProtectedRoute element={MetaCatalogSetup} featureName="catalog" requirePlanCheck={true} />}
          />
          <Route
            path="/Segment"
            element={<FullProtectedRoute element={SegmentManager} featureName="Segment" requirePlanCheck={true} />}
          />
          <Route
            path="/advanced"
            element={<FullProtectedRoute element={AdvancedPage} featureName="Advanced" requirePlanCheck={true} />}
          />
          <Route
            path="/rfm-preview"
            element={<FullProtectedRoute element={() => <RFMPreview toast={toast} setToast={setToast} />} />}
          />

          {/* ❌ COMMENTED OUT — Booking routes
          <Route
            path="/booking"
            element={<FullProtectedRoute element={() => <B_Sidebar />} />}
          >
            <Route path="b_dashboard" element={<DashboardPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="billing" element={<div>Billing Coming Soon...</div>} />
            <Route path="reports" element={<div>Reports Coming Soon...</div>} />
            <Route path="settings" element={<div>Settings Page</div>} />
          </Route>
          */}

          <Route path="*" element={<Notfound />} />
        </Routes>
      </div>
    </main>
  );
}

export default AppContent;