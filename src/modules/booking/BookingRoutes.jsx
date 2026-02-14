import { Routes, Route, Navigate } from "react-router-dom";
import B_Sidebar from "../../components/Booking/B_Sidebar";
import DashboardPage from "../../components/Booking/DashboardPage";
import JobsPage from "../../components/Booking/JobsPage";
import StaffPage from "../../components/Booking/StaffPage";

export default function BookingRoutes() {
  return (
    <Routes>
      <Route path="/" element={<B_Sidebar />}>
        <Route path="b_dashboard" element={<DashboardPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="billing" element={<div>Billing Coming Soon...</div>} />
        <Route path="reports" element={<div>Reports Coming Soon...</div>} />
        <Route path="settings" element={<div>Settings Page</div>} />
        <Route path="*" element={<Navigate to="b_dashboard" replace />} />
      </Route>
    </Routes>
  );
}
