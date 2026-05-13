// // src/components/ProtectedRoute.jsx
// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAdminAuth } from "../context/AdminAuthContext";

// export default function ProtectedRoute({ children, requiredRole }) {
//   const { user, loading, isAuthenticated } = useAdminAuth();

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-slate-950">
//         <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   // Block CLIENT accounts
//   if (user.account_type === "CLIENT") {
//     return (
//       <div className="flex items-center justify-center h-screen bg-slate-950">
//         <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-8 max-w-md text-center">
//           <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
//           <p className="text-slate-400">
//             Client accounts cannot access the admin portal.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Check required role
//   if (requiredRole === "SUPER_ADMIN" && user.account_type !== "SUPER_ADMIN") {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// }

import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, isAuthenticated } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.account_type === "CLIENT") {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="bg-[#0d1120] border border-red-500/15 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-lg font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-400">Client accounts cannot access the admin portal.</p>
        </div>
      </div>
    );
  }
  if (requiredRole === "SUPER_ADMIN" && user.account_type !== "SUPER_ADMIN") return <Navigate to="/dashboard" replace />;
  return children;
}