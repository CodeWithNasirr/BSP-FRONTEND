// components/Booking/B_Sidebar.jsx
import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserPlus,
  DollarSign,
  TrendingUp,
  Settings,
  Bell,
  Moon,
  ChevronLeft,
  Search,
} from "lucide-react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";

const NavItem = ({ icon: Icon, label, active, collapsed, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active
        ? "bg-blue-600 text-white"
        : "text-gray-400 hover:bg-gray-800 hover:text-white"
    }`}
  >
    <Icon size={20} />
    {!collapsed && <span className="text-sm font-medium">{label}</span>}
  </button>
);

const B_Sidebar = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/booking/b_dashboard" },
    { key: "jobs", label: "Jobs / Service Orders", icon: Briefcase, path: "/booking/jobs" },
    { key: "staff", label: "Staff / Team", icon: UserPlus, path: "/booking/staff" },
    { key: "billing", label: "Billing & Invoices", icon: DollarSign, path: "/booking/billing" },
    { key: "reports", label: "Reports & Analytics", icon: TrendingUp, path: "/booking/reports" },
    { key: "settings", label: "Settings", icon: Settings, path: "/booking/settings" },
];

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-20" : "w-64"
        } bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <LayoutDashboard size={20} />
              </div>
              <span className="font-bold text-lg">CRM Pro</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            <ChevronLeft
              size={20}
              className={`transition-transform ${
                sidebarCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <NavItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.path}
              collapsed={sidebarCollapsed}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-900">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Page Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-white capitalize">
            {menuItems.find((item) => item.path === location.pathname)?.label || "Booking"}
          </h1>

          {/* Search & Actions */}
          <div className="flex flex-1 sm:flex-none items-center gap-3 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 sm:flex-none w-full sm:w-80">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search customers, jobs..."
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-all"
              />
            </div>

            {/* Back Button */}
            <Link
              to="/dashboard"
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>

    </div>
  );
};

export default B_Sidebar;
