// src/admin/pages/Compliance/complianceHelpers.jsx
// Shared presentational primitives + colour maps for the Compliance Center.
import React from "react";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

// ── Risk band → colour ────────────────────────────────────────────────
export const RISK_BAND_META = {
  healthy:  { label: "Healthy",  cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15", dot: "bg-emerald-400", hex: "#34d399" },
  low:      { label: "Low",      cls: "bg-green-500/10 text-green-400 border-green-500/15",       dot: "bg-green-400",   hex: "#4ade80" },
  medium:   { label: "Medium",   cls: "bg-amber-500/10 text-amber-400 border-amber-500/15",       dot: "bg-amber-400",   hex: "#fbbf24" },
  high:     { label: "High",     cls: "bg-orange-500/10 text-orange-400 border-orange-500/15",    dot: "bg-orange-400",  hex: "#fb923c" },
  critical: { label: "Critical", cls: "bg-red-500/10 text-red-400 border-red-500/15",             dot: "bg-red-400",     hex: "#f87171" },
};

export function RiskBandBadge({ band }) {
  const m = RISK_BAND_META[band] || RISK_BAND_META.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${m.cls}`}>
      <span className={`w-1 h-1 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

// ── Quality rating → colour ───────────────────────────────────────────
export const QUALITY_META = {
  GREEN:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  YELLOW:  "bg-amber-500/10 text-amber-400 border-amber-500/15",
  RED:     "bg-red-500/10 text-red-400 border-red-500/15",
  UNKNOWN: "bg-slate-500/10 text-slate-400 border-slate-500/15",
};

export function QualityBadge({ rating }) {
  const key = (rating || "UNKNOWN").toUpperCase();
  const cls = QUALITY_META[key] || QUALITY_META.UNKNOWN;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      {key}
    </span>
  );
}

// ── Guard verdict → colour + icon ─────────────────────────────────────
export const VERDICT_META = {
  allow: { label: "Allow", icon: ShieldCheck, cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", ring: "text-emerald-400" },
  warn:  { label: "Warn",  icon: ShieldAlert, cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",       ring: "text-amber-400" },
  block: { label: "Block", icon: ShieldX,     cls: "bg-red-500/10 text-red-400 border-red-500/20",             ring: "text-red-400" },
};

export function VerdictBadge({ verdict }) {
  const m = VERDICT_META[verdict] || VERDICT_META.warn;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${m.cls}`}>
      <Icon size={11} />
      {m.label}
    </span>
  );
}

// ── Severity pill (readiness / violations) ────────────────────────────
export function SeverityPill({ severity }) {
  const map = {
    critical: "bg-red-500/10 text-red-400 border-red-500/15",
    important:"bg-amber-500/10 text-amber-400 border-amber-500/15",
    high:     "bg-orange-500/10 text-orange-400 border-orange-500/15",
    medium:   "bg-amber-500/10 text-amber-400 border-amber-500/15",
    advisory: "bg-slate-500/10 text-slate-400 border-slate-500/15",
    low:      "bg-slate-500/10 text-slate-400 border-slate-500/15",
  };
  const cls = map[severity] || map.advisory;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${cls}`}>
      {severity}
    </span>
  );
}

// ── Score ring (0–100) — trust green→red, risk red→green ──────────────
export function ScoreRing({ value = 0, size = 76, stroke = 7, invert = false, label }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (v / 100) * circ;
  // invert=true → high value is GOOD (trust). invert=false → high value is BAD (risk).
  const good = invert ? v : 100 - v;
  const color = good >= 70 ? "#34d399" : good >= 40 ? "#fbbf24" : "#f87171";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold text-white leading-none">{Math.round(v)}</span>
        {label && <span className="text-[8px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</span>}
      </div>
    </div>
  );
}

// ── Section card wrapper ──────────────────────────────────────────────
export function SectionCard({ title, subtitle, icon: Icon, action, children, className = "" }) {
  return (
    <div className={`bg-[#0d1120] border border-white/[0.04] rounded-2xl p-4 sm:p-5 ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center shrink-0 text-amber-400">
                <Icon size={15} />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{title}</h3>
              {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Misc format helpers ───────────────────────────────────────────────
export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export const fmtPct = (v) => (v === null || v === undefined ? "—" : `${v}%`);

export const titleCase = (s) =>
  (s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
