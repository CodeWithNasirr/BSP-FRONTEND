// src/admin/components/UIComponents.jsx — Premium design system
import React, { useState } from "react";

// ── Status Badge ─────────────────────────────────────────────────────
const statusColors = {
  ACTIVE:       "bg-emerald-500/10 text-emerald-400 border-emerald-500/15 ring-emerald-500/5",
  INACTIVE:     "bg-red-500/10 text-red-400 border-red-500/15 ring-red-500/5",
  SUSPENDED:    "bg-slate-500/10 text-slate-400 border-slate-500/15 ring-slate-500/5",
  PAID:         "bg-blue-500/10 text-blue-400 border-blue-500/15 ring-blue-500/5",
  UNPAID:       "bg-orange-500/10 text-orange-400 border-orange-500/15 ring-orange-500/5",
  AUTO_EXPIRED: "bg-slate-500/10 text-slate-400 border-slate-500/15 ring-slate-500/5",
};

export function StatusBadge({ status }) {
  const colors = statusColors[status] || statusColors.INACTIVE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ring-1 ${colors}`}>
      <span className={`w-1 h-1 rounded-full ${
        status === "ACTIVE" ? "bg-emerald-400" :
        status === "PAID" ? "bg-blue-400" :
        status === "UNPAID" ? "bg-orange-400" :
        "bg-current"
      }`} />
      {status}
    </span>
  );
}

// ── Unpaid Countdown ────────────────────────────────────────────────
export function UnpaidCountdown({ daysRemaining }) {
  if (daysRemaining === null || daysRemaining === undefined) return null;

  const hours = Math.floor(daysRemaining * 24);
  const isUrgent = daysRemaining < 0.5;
  const isExpired = daysRemaining <= 0;

  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/15">
        <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
        OVERDUE
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${
      isUrgent
        ? "bg-red-500/10 text-red-400 border-red-500/15"
        : "bg-amber-500/10 text-amber-400 border-amber-500/15"
    }`}>
      <span className={`w-1 h-1 rounded-full ${isUrgent ? "bg-red-400 animate-pulse" : "bg-amber-400"}`} />
      {hours}h left
    </span>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────
export function StatCard({ title, value, subtitle, icon: Icon, accent = "amber" }) {
  const accentMap = {
    amber:   { grad: "from-amber-500/20 to-orange-500/5",  icon: "text-amber-400",   border: "border-amber-500/10" },
    emerald: { grad: "from-emerald-500/20 to-green-500/5", icon: "text-emerald-400", border: "border-emerald-500/10" },
    blue:    { grad: "from-blue-500/20 to-indigo-500/5",   icon: "text-blue-400",    border: "border-blue-500/10" },
    purple:  { grad: "from-purple-500/20 to-pink-500/5",   icon: "text-purple-400",  border: "border-purple-500/10" },
    red:     { grad: "from-red-500/20 to-rose-500/5",      icon: "text-red-400",     border: "border-red-500/10" },
    orange:  { grad: "from-orange-500/20 to-yellow-500/5", icon: "text-orange-400",  border: "border-orange-500/10" },
    cyan:    { grad: "from-cyan-500/20 to-blue-500/5",     icon: "text-cyan-400",    border: "border-cyan-500/10" },
    slate:   { grad: "from-slate-500/20 to-slate-500/5",   icon: "text-slate-400",   border: "border-slate-500/10" },
  };
  const c = accentMap[accent] || accentMap.amber;

  return (
    <div className={`relative overflow-hidden bg-[#0d1120] border ${c.border} rounded-2xl p-4 sm:p-5 hover:border-white/[0.08] transition-all group`}>
      {/* Glow */}
      <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${c.grad} rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-none">{title}</p>
          <p className="text-xl sm:text-2xl font-extrabold text-white mt-2 leading-none truncate">{value}</p>
          {subtitle && <p className="text-[10px] sm:text-xs text-slate-600 mt-1.5 leading-snug">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center shrink-0 ${c.icon}`}>
            <Icon size={17} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Data Table — Desktop table, mobile cards ─────────────────────────
export function DataTable({ columns, data, emptyMessage = "No data available" }) {
  const [expandedRow, setExpandedRow] = useState(null);

  if (data.length === 0) {
    return (
      <div className="bg-[#0d1120] border border-white/[0.04] rounded-2xl p-10 sm:p-14 text-center">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  // Determine "primary" and "secondary" columns for mobile layout
  const primaryCol = columns[0]; // always shown as card title
  const actionCol  = columns.find(c => c.key === "actions");
  const restCols   = columns.filter(c => c !== primaryCol && c !== actionCol);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block bg-[#0d1120] border border-white/[0.04] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {columns.map((col) => (
                  <th key={col.key} className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={row.id || i}
                  className="border-b border-white/[0.02] hover:bg-white/[0.015] transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-slate-300 text-[13px]">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {data.map((row, i) => {
          const isExpanded = expandedRow === (row.id || i);
          return (
            <div
              key={row.id || i}
              className="bg-[#0d1120] border border-white/[0.04] rounded-xl overflow-hidden"
            >
              {/* Card header — always visible */}
              <button
                onClick={() => setExpandedRow(isExpanded ? null : (row.id || i))}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-white font-medium truncate">
                    {primaryCol.render ? primaryCol.render(row) : row[primaryCol.key]}
                  </div>
                </div>
                {/* Show 1-2 key badges */}
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {restCols.slice(0, 2).map((col) => (
                    <div key={col.key} className="text-[11px]">
                      {col.render ? col.render(row) : <span className="text-slate-400">{row[col.key]}</span>}
                    </div>
                  ))}
                  <svg className={`w-4 h-4 text-slate-600 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 space-y-2.5 border-t border-white/[0.04]">
                  {restCols.slice(2).map((col) => (
                    <div key={col.key} className="flex items-start justify-between gap-3">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0 pt-0.5">{col.label}</span>
                      <div className="text-[12px] text-slate-300 text-right">
                        {col.render ? col.render(row) : row[col.key]}
                      </div>
                    </div>
                  ))}
                  {actionCol && (
                    <div className="pt-2 border-t border-white/[0.04]">
                      {actionCol.render ? actionCol.render(row) : row[actionCol.key]}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Loading Spinner ──────────────────────────────────────────────────
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="relative">
        <div className="w-10 h-10 border-2 border-amber-400/20 rounded-full" />
        <div className="absolute inset-0 w-10 h-10 border-2 border-transparent border-t-amber-400 rounded-full animate-spin" />
      </div>
    </div>
  );
}

// ── Confirmation Modal ──────────────────────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", confirmColor = "amber", loading = false }) {
  if (!open) return null;

  const colorMap = {
    amber:   "bg-amber-500 hover:bg-amber-400",
    red:     "bg-red-500 hover:bg-red-400",
    emerald: "bg-emerald-500 hover:bg-emerald-400",
    blue:    "bg-blue-500 hover:bg-blue-400",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111827] border border-white/[0.06] rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50 ${colorMap[confirmColor] || colorMap.amber}`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}