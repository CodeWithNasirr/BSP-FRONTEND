// src/pages/RevenuePage.jsx
import React from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import SuperAdminDashboard from "./SuperAdmin/Dashboard";
import SubAdminDashboard from "./SubAdmin/Dashboard";

export default function RevenuePage() {
  const { isSuperAdmin } = useAdminAuth();
  return isSuperAdmin ? <SuperAdminDashboard /> : <SubAdminDashboard />;
}