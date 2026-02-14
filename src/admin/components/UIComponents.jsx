// src/components/UIComponents.jsx (v2 — Subscription Workflow)
import React from "react";

// ── Status Badge ─────────────────────────────────────────────────────
const statusColors = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  INACTIVE: "bg-red-500/10 text-red-400 border-red-500/20",
  SUSPENDED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  PAID: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  UNPAID: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  AUTO_EXPIRED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export function StatusBadge({ status }) {
  const colors = statusColors[status] || statusColors.INACTIVE;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors}`}
    >
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        Overdue
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
        isUrgent
          ? "bg-red-500/10 text-red-400 border-red-500/20"
          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isUrgent ? "bg-red-400 animate-pulse" : "bg-amber-400"
        }`}
      />
      {hours}h remaining
    </span>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────
export function StatCard({ title, value, subtitle, icon: Icon, accent = "amber" }) {
  const accentMap = {
    amber: "from-amber-400 to-orange-500 text-amber-400",
    emerald: "from-emerald-400 to-green-500 text-emerald-400",
    blue: "from-blue-400 to-indigo-500 text-blue-400",
    purple: "from-purple-400 to-pink-500 text-purple-400",
    red: "from-red-400 to-rose-500 text-red-400",
    orange: "from-orange-400 to-yellow-500 text-orange-400",
  };

  const colors = accentMap[accent] || accentMap.amber;
  const [gradFrom] = colors.split(" ");

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 hover:border-slate-700/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {title}
          </p>
        </div>
        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradFrom.replace(
              "text-",
              "from-"
            )} to-transparent/20 flex items-center justify-center`}
          >
            <Icon size={18} className={colors.split(" ").pop()} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}

// ── Data Table ───────────────────────────────────────────────────────
export function DataTable({ columns, data, emptyMessage = "No data available" }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-600">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || i}
                className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-300">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Loading Spinner ──────────────────────────────────────────────────
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ── Confirmation Modal ──────────────────────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", confirmColor = "amber", loading = false }) {
  if (!open) return null;

  const colorMap = {
    amber: "bg-amber-500 hover:bg-amber-600",
    red: "bg-red-500 hover:bg-red-600",
    emerald: "bg-emerald-500 hover:bg-emerald-600",
    blue: "bg-blue-500 hover:bg-blue-600",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${colorMap[confirmColor] || colorMap.amber}`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}