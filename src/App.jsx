// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import AppContent from "./AppContent";
// import AdminApp from "./admin/AdminApp";

// import { AdminAuthProvider }  from "./admin/context/AdminAuthContext";
// import { ReferralProvider } from "./components/context/ReferralContext";
// export default function App() {
//   return (
//     <Router>
//       <ReferralProvider>
//       <Routes>

//         {/* ADMIN PANEL */}
//         <Route
//           path="/admin/*"
//           element={
//             <AdminAuthProvider>
//               <AdminApp />
//             </AdminAuthProvider>
//           }
//         />

//         {/* MAIN USER APP */}
//         <Route path="/*" element={<AppContent />} />

//       </Routes>
//       </ReferralProvider>
//     </Router>
//   );
// }

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AppContent from "./AppContent";
import AdminApp from "./admin/AdminApp";

import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import { ReferralProvider } from "./components/context/ReferralContext";

export default function App() {

  const hostname = window.location.hostname;

  // Detect admin subdomain
  const isAdmin =
    hostname === "admin.gptxplatform.com" ||
    hostname.startsWith("admin.");

  if (isAdmin) {
    return (
      <Router>
        <AdminAuthProvider>
          <AdminApp />
        </AdminAuthProvider>
      </Router>
    );
  }

  return (
    <Router>
      <ReferralProvider>
        <AppContent />
      </ReferralProvider>
    </Router>
  );
}