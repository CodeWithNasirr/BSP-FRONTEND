// import React, { useState, useEffect, useContext } from 'react';
// import { Context } from './components/context/Context';
// import Sidebar, { SidebarItem } from './components/Sidebar';
// import Templates from './components/Templates/Templates';
// import CreateTemplates from './components/Templates/CreateTemplates';
// import Campaigns from './components/Campaigns/Campaigns';
// import Campaigns_Details from './components/Campaigns/Campaigns_Details';
// import BulkImportContacts from './components/Contact/BulkImportContacts';
// import ContactManagement from './components/Contact/ContactManagement';
// import ConnectWhatsAppForm from './components/ConnectForm';
// import Dashboard from './components/Dashboard';
// import CreateCampaigns from './components/Campaigns/CreateCampaigns';
// import ProtectedRoute from './components/Protected_Route';
// import FullProtectedRoute from './components/FullProtectedRoute';
// import WhatsAppSettings from './components/WhatsAppSettings';
// // import WhatsAppScraper from './components/scrap';
// import ChatWindow from './components/Chat/ChatWindow';

// import Subscription from './components/Subscriptions/Subscription';
// import Notfound from './components/notfound';
// import AuthSlider from './components/Authentications/AuthSlider';
// import Order from './components/Orders/Order';
// // import Booking from './components/Booking/Booking';
// import DashboardPage from './components/Booking/DashboardPage';
// import B_Sidebar from './components/Booking/B_Sidebar';
// import StaffPage from './components/Booking/StaffPage';
// import JobsPage from './components/Booking/JobsPage';
// import StaffJobsPage from './components/Booking/StaffJobsPage';
// import ResetPassword from './components/Authentications/ResetPassword';
// import ForgotPasswordForm from './components/Authentications/ForgotPasswordForm';
// import ProductView from './components/Catalogs/ProductView';
// import CreateProduct from './components/Catalogs/CreateProduct';
// import MetaCatalogSetup from './components/Catalogs/MetaCatalogSetup';
// import SegmentManager from './components/Segment/SegmentManager';
// import RFMPreview from './components/Segment/RFMPreview';
// import AdvancedPage from './components/AdvancedPage';
// import PrivacyPolicy from './components/LandingPage/PrivacyPolicy';
// import LandingPage from './components/LandingPage/LandingPage';
// import CancellationAndRefund from './components/LandingPage/CancellationAndRefund';
// import ContactUs from './components/LandingPage/ContactUs';
// import ShippingAndDelivery from './components/LandingPage/ShippingAndDelivery';
// import TermsAndConditions from './components/LandingPage/TermsAndConditions';
// import MyUsagePanel from './components/MyUsagePanel';
// import FlowBuilder from './components/Flows/FlowBuilder';
// import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
// import { MessageSquareMore, MessagesSquare, ContactRound, MessageCircleMore, House, CreditCard, CircleDollarSign, NotebookTabs, Workflow } from 'lucide-react';
// import { SiWhatsapp } from 'react-icons/si';
// import { MdViewCarousel } from 'react-icons/md';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Wallet from './components/Wallet/Wallet';
// import { useRoutes, matchRoutes } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import MainChat from './components/Chat/MainChat';
// // Define valid routes
// const validRoutes = [
//   '/',
//   '/login',
//   '/register',
//   // '/privacy',
//   // '/contact-us',
//   // '/refund-policy',
//   // '/shipping-policy',
//   // '/terms-policy',
//   // '/forgot-password',
//   // '/reset-password/:uid/:token',
//   '/dashboard',
//   '/staff-dashboard',
//   '/templates',
//   '/templates/create',
//   '/campaigns',
//   '/campaigns/create',
//   '/campaigns/:id',
//   '/contacts',
//   '/bulk-upload',
//   '/connect-form',
//   '/whatsapp-setting',
//   '/chats',
//   '/chats/:id',
//   '/subscriptions',
//   '/my-usage-panel',
//   '/Credits',
//   '/orders',
//   '/products',
//   '/products/create-pr',
//   '/meta-catalog-setup',
//   '/Segment',
//   '/advanced',
//   '/rfm-preview',
// ];

// // Staff-only routes
// const staffAllowedRoutes = ['/staff-dashboard', '/login', '/register', '/forgot-password', '/reset-password/:uid/:token', '/', '/privacy', '/contact-us', '/refund-policy', '/shipping-policy', '/terms-policy'];

// function AppContent() {
//   const location = useLocation();
//   const { userInfo, subscriptionStatus,loadingUser } = useContext(Context);
//   const isLoginPage = location.pathname === '/login';
//   const isRegisterPage = location.pathname === '/register';
//   const isLandingPage = location.pathname === '/';
//   const isResetPasswordPage = location.pathname.startsWith('/reset-password');

//   const [enableChatFlow, setEnableChatFlow] = useState(() => localStorage.getItem('chatFlowEnabled') === 'true');
//   const dynamicRoutes = [...validRoutes, ...(enableChatFlow ? ['/chat-flow'] : [])];

//   const match = matchRoutes(dynamicRoutes.map((path) => ({ path })), location);
//   const isValidRoute = !!match;
//   const notFoundPage = !isLoginPage && !isRegisterPage && !isValidRoute;
//   const [canShowSidebar, setCanShowSidebar] = useState(false);

//   const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth < 640);
//     window.addEventListener('resize', handleResize);
//     return () => window.addEventListener('resize', handleResize);
//   }, []);

//   const isChatWindow =
//     (location.pathname.startsWith('/chats/') && location.pathname.split('/').length === 3) ||
//     (location.pathname === '/chats' && new URLSearchParams(location.search).has('recipient'));
//     const [toast, setToast] = useState({ message: null, type: null });
//   const isBasicPlan = subscriptionStatus?.is_active && subscriptionStatus?.plan === 'BASIC';


//   // Redirect staff to /staff-dashboard if they try to access unauthorized routes
//   const isStaff = userInfo?.role === 'staff';
  
  
//   const isRouteAllowed = isStaff ? staffAllowedRoutes.some((route) => matchRoutes([{ path: route }], location)) : true;

//   // if (loadingUser) {
//   //   return <div className="flex items-center justify-center h-screen text-white bg-gray-900">Loading...</div>;
//   // }

//   if (isStaff && !isRouteAllowed && !isLoginPage && !isRegisterPage && !isResetPasswordPage && !isLandingPage) {
//     return <Navigate to="/staff-dashboard" replace />;
//   }
  
//   // Check if the current route is restricted for the plan
//   useEffect(() => {
//     if (!subscriptionStatus) {
//       setCanShowSidebar(false); // wait until subscription is loaded
//       return;
//     }

//     // Define plan-restricted routes
//     const restrictedRoutes = ['/advanced', '/chat-flow'];

//     const isRestricted = restrictedRoutes.some((path) => location.pathname.startsWith(path));
//     const isBasicPlan = subscriptionStatus?.is_active && subscriptionStatus?.plan === 'BASIC';

//     // If user is basic and route is restricted, hide sidebar
//     setCanShowSidebar(!(isRestricted && isBasicPlan));
//   }, [location.pathname, subscriptionStatus]);


//   return (
//     <main
//       className={`flex ${isLoginPage || isRegisterPage || notFoundPage || (isMobile && isChatWindow) ? 'w-full h-screen' : 'min-h-screen'}`}
//     >
//       {!isLoginPage &&
//         !isRegisterPage &&
//         !notFoundPage &&
//         !isResetPasswordPage &&
//         !isLandingPage &&
//         !(isMobile && isChatWindow) && canShowSidebar &&  (
//           <div className="text-black">
//             <Sidebar>
//               {isStaff ? (
//                 <SidebarItem icon={<MessagesSquare size={20} />} text="My Jobs" to="/staff-dashboard" />
//               ) : (
//                 <>
//                   <SidebarItem icon={<MessagesSquare size={20} />} text="Dashboard" to="/dashboard" />
//                   <SidebarItem icon={<ContactRound size={20} />} text="Contacts" to="/contacts" />
//                   <SidebarItem icon={<MessagesSquare size={20} />} text="Campaigns" to="/campaigns" />
//                   <SidebarItem icon={<MessageSquareMore size={20} />} text="Templates" to="/templates" />
//                   <SidebarItem icon={<MessageCircleMore size={20} />} text="Chats" to="/chats" />
//                   {!isBasicPlan && (
//                     <SidebarItem
//                       icon={<Workflow size={20} />}
//                       text="Flows"
//                       to="/chat-flow"
                
//                     />
//                   )}
//                   <SidebarItem icon={<CreditCard size={20} />} text="Subscriptions" to="/subscriptions" />
//                   <SidebarItem icon={<CircleDollarSign size={20} />} text="Credits" to="/Credits" />
//                   <SidebarItem icon={<NotebookTabs size={20} />} text="My Usage" to="/my-usage-panel" />
//                   <SidebarItem icon={<SiWhatsapp size={20} />} text="Whatsapp" to="/whatsapp-setting" />
//                   {!isBasicPlan && (
//                     <SidebarItem
//                       icon={<MdViewCarousel size={20} />}
//                       text="Advanced"
//                       to="/advanced"
                      
//                     />
//                   )}
//                 </>
//               )}
//             </Sidebar>
//           </div>
//         )}

//       <div
//         className={`flex-1 overflow-auto ${isLoginPage || isRegisterPage || notFoundPage || (isMobile && isChatWindow) ? 'w-full' : ''}`}
//       >
//         <ToastContainer />
//         <Routes>
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/privacy" element={<PrivacyPolicy />} />
//           <Route path="/contact-us" element={<ContactUs />} />
//           <Route path="/refund-policy" element={<CancellationAndRefund />} />
//           <Route path="/shipping-policy" element={<ShippingAndDelivery />} />
//           <Route path="/terms-policy" element={<TermsAndConditions />} />
//           <Route path="/login" element={<AuthSlider />} />
//           <Route path="/register" element={<AuthSlider />} />
//           <Route path="/forgot-password" element={<ForgotPasswordForm />} />
//           <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
//           <Route
//             path="/dashboard"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <Dashboard />)}
//               />
//             }
//           />
//           <Route path="/staff-dashboard" element={<FullProtectedRoute element={StaffJobsPage} />} />
//           <Route
//             path="/templates"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <Templates />)}
//               />
//             }
//           />
//           <Route
//             path="/templates/create"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <CreateTemplates />)}
//               />
//             }
//           />
//           <Route
//             path="/campaigns"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <Campaigns />)}
//               />
//             }
//           />
//           <Route
//             path="/campaigns/create"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <CreateCampaigns />)}
//               />
//             }
//           />
//           <Route
//             path="/campaigns/:id"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <Campaigns_Details />)}
//               />
//             }
//           />
//           <Route
//             path="/contacts"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <ContactManagement />)}
//               />
//             }
//           />
//           <Route
//             path="/bulk-upload"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <BulkImportContacts />)}
//               />
//             }
//           />
//           <Route
//             path="/connect-form"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <ConnectWhatsAppForm />)}
//               />
//             }
//           />
//           <Route
//             path="/whatsapp-setting"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <WhatsAppSettings />)}
//               />
//             }
//           />
//           <Route
//             path="/chats"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <MainChat />)}
//               />
//             }
//           />
//           <Route
//             path="/chats/:id"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <ChatWindow />)}
//               />
//             }
//           />
//           <Route
//             path="/subscriptions"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <Subscription />)}
//               />
//             }
//           />
//           <Route
//             path="/my-usage-panel"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <MyUsagePanel />)}
//               />
//             }
//           />
//           <Route
//             path="/chat-flow"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <FlowBuilder setEnableChatFlow={setEnableChatFlow} />)}
//               />
//             }
//           />
//           <Route
//             path="/Credits"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <Wallet />)}
//               />
//             }
//           />
//           <Route
//             path="/orders"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <Order />)}
//               />
//             }
//           />
//           <Route
//             path="/products"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <ProductView />)}
//               />
//             }
//           />
//           <Route
//             path="/products/create-pr"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <CreateProduct />)}
//               />
//             }
//           />
//           <Route
//             path="/meta-catalog-setup"
//             element={
//               isStaff ? <Navigate to="/staff-dashboard" replace /> : <FullProtectedRoute element={MetaCatalogSetup} featureName="catalog" requirePlanCheck={true}/>}
//               />
            
//            <Route
//             path="/Segment"
//             element={
//               isStaff ? <Navigate to="/staff-dashboard" replace /> : <FullProtectedRoute element={SegmentManager} featureName="Segment" requirePlanCheck={true} />}
//               />
      
//           <Route
//             path="/advanced"
//             element={
//               isStaff
//                 ? <Navigate to="/staff-dashboard" replace />
//                 : <FullProtectedRoute element={AdvancedPage} featureName="Advanced" requirePlanCheck={true} />
//             }
//           />
//           <Route
//             path="/rfm-preview"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <RFMPreview toast={toast} setToast={setToast} />)}
//               />
//             }
//           />
//           <Route
//             path="/booking"
//             element={
//               <FullProtectedRoute
//                 element={() => (isStaff ? <Navigate to="/staff-dashboard" replace /> : <B_Sidebar />)}
//               />
//             }
//           >
//             <Route path="b_dashboard" element={<DashboardPage />} />
//             <Route path="jobs" element={<JobsPage />} />
//             <Route path="staff" element={<StaffPage />} />
//             <Route path="billing" element={<div>Billing Coming Soon...</div>} />
//             <Route path="reports" element={<div>Reports Coming Soon...</div>} />
//             <Route path="settings" element={<div>Settings Page</div>} />
//           </Route>
//           <Route path="*" element={<Notfound />} />
//         </Routes>
//       </div>
//     </main>
//   );
// }

// export default function App() {
//   return (
//     <Router>
      
//         <AppContent />
   
//     </Router>
//   );
// }

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AppContent from "./AppContent";
import AdminApp from "./admin/AdminApp";

import { AdminAuthProvider }  from "./admin/context/AdminAuthContext";

export default function App() {
  return (
    <Router>
      <Routes>

        {/* ADMIN PANEL */}
        <Route
          path="/admin/*"
          element={
            <AdminAuthProvider>
              <AdminApp />
            </AdminAuthProvider>
          }
        />

        {/* MAIN USER APP */}
        <Route path="/*" element={<AppContent />} />

      </Routes>
    </Router>
  );
}