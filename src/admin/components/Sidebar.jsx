// src/admin/components/Sidebar.jsx — Premium responsive navigation
import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  LayoutDashboard, Users, UserCog, BarChart3, ScrollText,
  LogOut, Shield, ShieldHalf, History, Radio, Bell, Megaphone, Menu, X, ChevronLeft, ChevronRight,
} from "lucide-react";

const superAdminLinks = [
  { to: "/dashboard",         icon: LayoutDashboard, label: "Dashboard",     mobile: true },
  { to: "/clients",           icon: Users,           label: "Clients",       mobile: true },
  { to: "/subadmins",         icon: UserCog,         label: "SubAdmins",     mobile: false },
  { to: "/history",           icon: History,         label: "History",        mobile: true },
  { to: "/revenue",           icon: BarChart3,       label: "Revenue",        mobile: true },
  { to: "/logs",              icon: ScrollText,      label: "Logs",           mobile: false },
  { to: "/notifications",     icon: Bell,            label: "Notifications",  mobile: false },
  { to: "/webhook-analytics", icon: Radio,           label: "Webhooks",       mobile: false, badge: true },
  { to: "/compliance",        icon: ShieldHalf,      label: "Compliance",     mobile: false, badge: true },
  { to: "/announcements",     icon: Megaphone,       label: "Announcements",  mobile: false },
];

const subAdminLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard",  mobile: true },
  { to: "/clients",   icon: Users,           label: "My Clients", mobile: true },
  { to: "/history",   icon: History,         label: "History",     mobile: true },
  { to: "/revenue",   icon: BarChart3,       label: "Revenue",     mobile: true },
];

export default function Sidebar() {
  const { user, logout, isSuperAdmin } = useAdminAuth();
  const [collapsed, setCollapsed]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const links       = isSuperAdmin ? superAdminLinks : subAdminLinks;
  const mobileLinks = links.filter((l) => l.mobile).slice(0, 4); // max 4 bottom tabs

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  // ── DESKTOP SIDEBAR (hidden on mobile) ─────────────────────────────────
  const DesktopSidebar = () => (
    <aside
      className={`hidden lg:flex fixed left-0 top-0 h-screen flex-col z-40 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        bg-[#0d1120] border-r border-white/[0.04]
        ${collapsed ? "w-[72px]" : "w-64"}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.04] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
          <Shield size={15} className="text-slate-950" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-[13px] font-bold text-white tracking-tight leading-none">Admin</p>
            <p className="text-[9px] text-amber-400/60 uppercase tracking-[0.2em] mt-0.5">
              {isSuperAdmin ? "Super Admin" : "Sub Admin"}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto scrollbar-hide">
        {links.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative
              ${isActive
                ? "bg-amber-400/[0.08] text-amber-400"
                : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-amber-400 rounded-r-full" />
                )}
                <Icon size={17} className="shrink-0" />
                {!collapsed && <span className="truncate flex-1">{label}</span>}
                {badge && !collapsed && (
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-amber-400" : "bg-amber-400/30"}`} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.04] p-2.5 space-y-1 shrink-0">
        {!collapsed && (
          <div className="px-3 py-2">
            <p className="text-[11px] text-slate-500 truncate font-medium">{user?.username}</p>
            <p className="text-[10px] text-slate-600 truncate">{user?.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-1.5 text-slate-600 hover:text-slate-400 transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </aside>
  );

  // ── MOBILE BOTTOM NAV (hidden on desktop) ──────────────────────────────
  const MobileBottomNav = () => (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0d1120]/95 backdrop-blur-xl border-t border-white/[0.06] safe-area-pb">
      <div className="flex items-stretch">
        {mobileLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors relative
              ${isActive ? "text-amber-400" : "text-slate-500"}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute top-0 inset-x-3 h-[2px] bg-amber-400 rounded-b-full" />}
                <Icon size={18} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* More button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium text-slate-500"
        >
          <Menu size={18} />
          <span>More</span>
        </button>
      </div>
    </nav>
  );

  // ── MOBILE DRAWER ──────────────────────────────────────────────────────
  const MobileDrawer = () => (
    <>
      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sheet */}
      <div
        className={`lg:hidden fixed inset-x-0 bottom-0 z-[70] bg-[#0d1120] border-t border-white/[0.06] rounded-t-3xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] max-h-[80vh] overflow-y-auto
          ${mobileOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-8 h-1 bg-white/10 rounded-full" />
        </div>

        {/* User info */}
        <div className="px-5 pb-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Shield size={18} className="text-slate-950" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.username}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button onClick={() => setMobileOpen(false)} className="ml-auto p-2 text-slate-500">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* All links */}
        <nav className="p-3 space-y-0.5">
          {links.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? "bg-amber-400/[0.08] text-amber-400"
                  : "text-slate-400 active:bg-white/[0.03]"
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && <span className="w-1.5 h-1.5 rounded-full bg-amber-400/40" />}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/[0.04]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-400/70 active:bg-red-500/[0.06] transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileBottomNav />
      <MobileDrawer />
    </>
  );
}