// src/admin/components/Sidebar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  LayoutDashboard,
  Users,
  UserCog,
  BarChart3,
  ScrollText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  History,
  Radio,          // ← Webhook Analytics icon
} from "lucide-react";

const superAdminLinks = [
  { to: "/admin/dashboard",           icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/subadmins",           icon: UserCog,          label: "SubAdmins" },
  { to: "/admin/clients",             icon: Users,            label: "Clients" },
  { to: "/admin/history",             icon: History,          label: "Sub. History" },
  { to: "/admin/revenue",             icon: BarChart3,        label: "Revenue" },
  { to: "/admin/logs",                icon: ScrollText,       label: "Revenue Logs" },
  { to: "/admin/webhook-analytics",   icon: Radio,            label: "Webhooks", badge: true },
];

const subAdminLinks = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/clients",   icon: Users,            label: "My Clients" },
  { to: "/admin/history",   icon: History,          label: "Sub. History" },
  { to: "/admin/revenue",   icon: BarChart3,        label: "My Revenue" },
];

export default function Sidebar() {
  const { user, logout, isSuperAdmin } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const links = isSuperAdmin ? superAdminLinks : subAdminLinks;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-950 border-r border-slate-800/50 flex flex-col transition-all duration-300 z-50 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-800/50">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
          <Shield size={18} className="text-slate-950" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-white tracking-wide truncate">
              Admin Portal
            </h1>
            <p className="text-[10px] text-amber-400/70 uppercase tracking-widest">
              {isSuperAdmin ? "Super Admin" : "Sub Admin"}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? "bg-amber-400/10 text-amber-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && (
                  <span className="truncate flex-1">{label}</span>
                )}
                {/* Webhook special badge dot */}
                {badge && !collapsed && (
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    isActive ? "bg-amber-400" : "bg-amber-400/40"
                  }`} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800/50 p-3 space-y-2">
        {!collapsed && (
          <div className="px-3 py-2">
            <p className="text-xs text-slate-500 truncate">{user?.username}</p>
            <p className="text-[10px] text-slate-600 truncate">{user?.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}