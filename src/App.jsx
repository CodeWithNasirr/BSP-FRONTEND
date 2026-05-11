import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AppContent from "./AppContent";
import AdminApp from "./admin/AdminApp";

import { AdminAuthProvider }  from "./admin/context/AdminAuthContext";
import { ReferralProvider } from "./components/context/ReferralContext";
export default function App() {
  return (
    <Router>
      <ReferralProvider>
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
      </ReferralProvider>
    </Router>
  );
}