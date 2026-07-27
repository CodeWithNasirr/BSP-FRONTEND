// src/admin/pages/Compliance/ComplianceLayout.jsx
// Wraps the Compliance Center with a horizontal sub-navigation + <Outlet/>.
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, ShieldCheck, ListChecks, BarChart3, ShieldHalf } from "lucide-react";

const tabs = [
  { to: "/compliance",           label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/compliance/customers", label: "Customers", icon: Users },
  { to: "/compliance/guard",     label: "Guard",     icon: ShieldCheck },
  { to: "/compliance/rules",     label: "Rules",     icon: ListChecks },
  { to: "/compliance/analytics", label: "Analytics", icon: BarChart3 },
];

export default function ComplianceLayout() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
          <ShieldHalf size={19} className="text-slate-950" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">Compliance Center</h1>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Meta Tech-Provider protection · prevent restrictions before they happen
          </p>
        </div>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-white/[0.05] -mx-1 px-1">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors
              ${isActive ? "text-amber-400" : "text-slate-500 hover:text-slate-300"}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} />
                {label}
                {isActive && <span className="absolute bottom-0 inset-x-2 h-[2px] bg-amber-400 rounded-t-full" />}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
