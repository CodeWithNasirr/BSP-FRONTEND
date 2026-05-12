// ─────────────────────────────────────────────────────────────────────────────
// WhatsGPTX Design System — Production UI Components
// Drop this file into src/components/ui/index.jsx
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";

// ── TOKENS (use these as Tailwind class helpers) ─────────────────────────────
export const tokens = {
  card: "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm",
  cardHover: "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
  input: "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all",
  badge: {
    green: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    blue: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    amber: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    red: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    gray: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
};

// ── CARD ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = "", hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`${tokens.card} ${hover ? tokens.cardHover : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ── BUTTON ───────────────────────────────────────────────────────────────────
export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  className = "",
  onClick,
  type = "button",
}) {
  const variants = {
    primary: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm shadow-green-500/25 hover:from-green-600 hover:to-emerald-700 active:scale-[0.98]",
    secondary: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 active:scale-[0.98]",
    ghost: "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98]",
    danger: "bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]",
    whatsapp: "bg-[#25D366] text-white hover:bg-[#22c55e] active:scale-[0.98] shadow-sm shadow-green-500/30",
  };
  const sizes = {
    xs: "px-2.5 py-1.5 text-xs rounded-lg gap-1",
    sm: "px-3 py-2 text-sm rounded-xl gap-1.5",
    md: "px-4 py-2.5 text-sm rounded-xl gap-2",
    lg: "px-5 py-3 text-base rounded-xl gap-2",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
}

// ── STATS CARD ────────────────────────────────────────────────────────────────
export function StatsCard({ label, value, sub, icon, trend, trendUp, color = "green", loading = false }) {
  const colors = {
    green: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-600 dark:text-green-400", ring: "ring-green-200 dark:ring-green-800" },
    blue: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", ring: "ring-blue-200 dark:ring-blue-800" },
    purple: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400", ring: "ring-purple-200 dark:ring-purple-800" },
    amber: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-200 dark:ring-amber-800" },
  };
  const c = colors[color];
  if (loading) return (
    <Card className="p-5">
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-8 rounded-xl bg-gray-200 dark:bg-gray-700" />
        <div className="h-7 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-800" />
      </div>
    </Card>
  );
  return (
    <Card className="p-5" hover>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${c.bg} ring-1 ${c.ring}`}>
          <span className={`${c.text} block`}>{icon}</span>
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trendUp ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">{value}</p>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
        {label}
      </div>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </Card>
  );
}

// ── BADGE ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color = "gray" }) {
  return <span className={tokens.badge[color]}>{children}</span>;
}

// ── AVATAR ────────────────────────────────────────────────────────────────────
export function Avatar({ name = "", src, size = "md", online = false }) {
  const sizes = { xs: "w-6 h-6 text-xs", sm: "w-8 h-8 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base", xl: "w-14 h-14 text-lg" };
  const initials = name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  const colors = ["bg-green-500", "bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-teal-500"];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return (
    <div className="relative shrink-0">
      {src ? (
        <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />
      ) : (
        <div className={`${sizes[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-medium`}>
          {initials || "?"}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full" />
      )}
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── SKELETON ──────────────────────────────────────────────────────────────────
export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />;
}

export function SkeletonCard() {
  return (
    <Card className="p-5">
      <div className="animate-pulse space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </Card>
  );
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer, size = "md" }) {
  if (!open) return null;
  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-end shrink-0">{footer}</div>
        )}
      </div>
    </div>
  );
}

// ── FLOATING ACTION BUTTON ─────────────────────────────────────────────────────
export function FAB({ icon, label, onClick, color = "green" }) {
  const colors = {
    green: "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/30",
    blue: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30",
  };
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-4 py-3 ${colors[color]} text-white rounded-2xl shadow-lg active:scale-95 transition-all duration-150 font-medium text-sm`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ── TOPBAR ────────────────────────────────────────────────────────────────────
export function Topbar({ title, subtitle, actions, onMenuClick }) {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      {onMenuClick && (
        <button onClick={onMenuClick} className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-600 dark:text-gray-300">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}