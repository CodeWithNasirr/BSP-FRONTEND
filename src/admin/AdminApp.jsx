// import { Routes, Route, Navigate } from "react-router-dom";
// import { useAdminAuth } from "./context/AdminAuthContext";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Sidebar from "./components/Sidebar";

// import LoginPage from "./pages/LoginPage";
// import SuperAdminDashboard from "./pages/SuperAdmin/Dashboard";
// import SubAdminDashboard from "./pages/SubAdmin/Dashboard";
// import SubAdminsPage from "./pages/SubAdminsPage";
// import WorkflowClientsPage from "./pages/WorkflowClientsPage";
// import RevenuePage from "./pages/RevenuePage";
// import RevenueLogsPage from "./pages/RevenueLogsPage";
// import SubscriptionHistoryPage from "./pages/SubscriptionHistoryPage";
// import SubAdminActivityPage from "./pages/SubAdminActivityPage"; // NEW
// import WebhookDashboardPage from "./pages/WebhookDashboardPage"; // ← NEW
// import NotificationTimeline from "../components/Notifications/NotificationTimeline";

// function DashboardRouter() {
//   const { isSuperAdmin } = useAdminAuth();
//   return isSuperAdmin ? <SuperAdminDashboard /> : <SubAdminDashboard />;
// }

// export default function AdminApp() {
//   const { isAuthenticated } = useAdminAuth();

//   return (
//     <div className="flex min-h-screen bg-slate-950">

//       {isAuthenticated && <Sidebar />}

//       <main className="flex-1 ml-64 p-8">
//         <Routes>

//           {/* LOGIN ROUTE ALWAYS EXISTS */}
//           <Route
//             path="login"
//             element={
//               isAuthenticated
//                 ? <Navigate to="../dashboard" replace />
//                 : <LoginPage />
//             }
//           />

//           {/* PROTECTED ROUTES */}
//           <Route
//             path="dashboard"
//             element={
//               isAuthenticated
//                 ? <DashboardRouter />
//                 : <Navigate to="../login" replace />
//             }
//           />

//           <Route
//             path="subadmins"
//             element={
//               isAuthenticated
//                 ? <ProtectedRoute requiredRole="SUPER_ADMIN"><SubAdminsPage /></ProtectedRoute>
//                 : <Navigate to="../login" replace />
//             }
//           />
//            {/* NEW: SubAdmin Activity Route - SuperAdmin only */}
//           <Route
//             path="subadmins/:subadminId/activity"
//             element={
//               isAuthenticated
//                 ? <ProtectedRoute requiredRole="SUPER_ADMIN"><SubAdminActivityPage /></ProtectedRoute>
//                 : <Navigate to="../login" replace />
//             }
//           />

//           <Route
//             path="clients"
//             element={isAuthenticated ? <WorkflowClientsPage /> : <Navigate to="../login" replace />}
//           />

//           <Route
//             path="revenue"
//             element={isAuthenticated ? <RevenuePage /> : <Navigate to="../login" replace />}
//           />
          
//           <Route
//             path="notifications"
//             element={isAuthenticated ? <NotificationTimeline /> : <Navigate to="../login" replace />}
//           />


//           <Route
//             path="logs"
//             element={
//               isAuthenticated
//                 ? <ProtectedRoute requiredRole="SUPER_ADMIN"><RevenueLogsPage /></ProtectedRoute>
//                 : <Navigate to="../login" replace />
//             }
//           />

//           <Route
//             path="history"
//             element={isAuthenticated ? <SubscriptionHistoryPage /> : <Navigate to="../login" replace />}
//           />

//            {/* WEBHOOK ANALYTICS — SuperAdmin only */}
//           <Route
//             path="webhook-analytics"
//             element={
//               isAuthenticated
//                 ? <ProtectedRoute requiredRole="SUPER_ADMIN"><WebhookDashboardPage /></ProtectedRoute>
//                 : <Navigate to="../login" replace />
//             }
//           />

//           {/* DEFAULT ROUTE */}
//           <Route
//             path="*"
//             element={
//               <Navigate
//                 to={isAuthenticated ? "dashboard" : "login"}
//                 replace
//               />
//             }
//           />

//         </Routes>
//       </main>
//     </div>
//   );
// }
// src/admin/AdminApp.jsx — Premium responsive layout
import { Routes, Route, Navigate } from "react-router-dom";
import { useAdminAuth } from "./context/AdminAuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";

import LoginPage from "./pages/LoginPage";
import SuperAdminDashboard from "./pages/SuperAdmin/Dashboard";
import SubAdminDashboard from "./pages/SubAdmin/Dashboard";
import SubAdminsPage from "./pages/SubAdminsPage";
import WorkflowClientsPage from "./pages/WorkflowClientsPage";
import RevenuePage from "./pages/RevenuePage";
import RevenueLogsPage from "./pages/RevenueLogsPage";
import SubscriptionHistoryPage from "./pages/SubscriptionHistoryPage";
import SubAdminActivityPage from "./pages/SubAdminActivityPage";
import WebhookDashboardPage from "./pages/WebhookDashboardPage";
import NotificationTimeline from "../components/Notifications/NotificationTimeline";

function DashboardRouter() {
  const { isSuperAdmin } = useAdminAuth();
  return isSuperAdmin ? <SuperAdminDashboard /> : <SubAdminDashboard />;
}

export default function AdminApp() {
  const { isAuthenticated } = useAdminAuth();

  return (
    <div className="flex min-h-screen bg-[#0a0e17]">
      {isAuthenticated && <Sidebar />}

      {/* 
        Main content: 
        - Mobile: full width, pb for bottom nav
        - Desktop: ml-64 for sidebar 
      */}
      <main
        className={`flex-1 min-w-0 ${
          isAuthenticated
            ? "pb-20 lg:pb-0 lg:ml-64"
            : ""
        }`}
      >
        <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1600px] mx-auto">
          <Routes>
            <Route
              path="login"
              element={
                isAuthenticated
                  ? <Navigate to="/dashboard" replace />
                  : <LoginPage />
              }
            />

            <Route
              path="dashboard"
              element={
                isAuthenticated
                  ? <DashboardRouter />
                  : <Navigate to="/login" replace />
              }
            />

            <Route
              path="subadmins"
              element={
                isAuthenticated
                  ? <ProtectedRoute requiredRole="SUPER_ADMIN"><SubAdminsPage /></ProtectedRoute>
                  : <Navigate to="/login" replace />
              }
            />

            <Route
              path="subadmins/:subadminId/activity"
              element={
                isAuthenticated
                  ? <ProtectedRoute requiredRole="SUPER_ADMIN"><SubAdminActivityPage /></ProtectedRoute>
                  : <Navigate to="/login" replace />
              }
            />

            <Route
              path="clients"
              element={isAuthenticated ? <WorkflowClientsPage /> : <Navigate to="/login" replace />}
            />

            <Route
              path="revenue"
              element={isAuthenticated ? <RevenuePage /> : <Navigate to="/login" replace />}
            />

            <Route
              path="notifications"
              element={isAuthenticated ? <NotificationTimeline /> : <Navigate to="/login" replace />}
            />

            <Route
              path="logs"
              element={
                isAuthenticated
                  ? <ProtectedRoute requiredRole="SUPER_ADMIN"><RevenueLogsPage /></ProtectedRoute>
                  : <Navigate to="/login" replace />
              }
            />

            <Route
              path="history"
              element={isAuthenticated ? <SubscriptionHistoryPage /> : <Navigate to="/login" replace />}
            />

            <Route
              path="webhook-analytics"
              element={
                isAuthenticated
                  ? <ProtectedRoute requiredRole="SUPER_ADMIN"><WebhookDashboardPage /></ProtectedRoute>
                  : <Navigate to="/login" replace />
              }
            />

           <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated ? "/dashboard" : "/login"}
                replace
              />
            }
          />
          </Routes>
        </div>
      </main>
    </div>
  );
}