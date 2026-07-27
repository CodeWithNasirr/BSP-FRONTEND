// src/admin/pages/Compliance/ComplianceCharts.jsx
// Recharts wrappers styled to match the admin dark theme.
import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";
import { RISK_BAND_META } from "./complianceHelpers";

const DarkTooltip = ({ active, payload, label, unit = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111827] border border-white/[0.08] rounded-xl px-3 py-2 shadow-2xl">
      {label !== undefined && <p className="text-[10px] text-slate-500 font-medium mb-0.5">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color || p.payload?.fill || "#fbbf24" }}>
          {p.name}: {Number(p.value).toLocaleString()}{unit}
        </p>
      ))}
    </div>
  );
};

// ── Restriction / event trend (area) ──────────────────────────────────
export function TrendAreaChart({ data, dataKey = "count", xKey = "day", color = "#f87171", height = 240 }) {
  const chartData = data || [];
  if (chartData.length === 0) {
    return <p className="text-slate-600 text-sm text-center py-12">No events in this window</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
        <XAxis dataKey={xKey} stroke="#1e293b" tick={{ fill: "#475569", fontSize: 10 }} />
        <YAxis stroke="#1e293b" tick={{ fill: "#475569", fontSize: 10 }} allowDecimals={false} />
        <Tooltip content={<DarkTooltip />} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
          fill={`url(#grad-${dataKey})`} dot={{ fill: color, r: 3, strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Risk-band distribution (donut) ────────────────────────────────────
export function RiskBandDonut({ distribution, height = 220 }) {
  const order = ["healthy", "low", "medium", "high", "critical"];
  const data = order
    .filter((k) => distribution && distribution[k])
    .map((k) => ({ name: RISK_BAND_META[k].label, value: distribution[k], hex: RISK_BAND_META[k].hex }));

  if (data.length === 0) {
    return <p className="text-slate-600 text-sm text-center py-12">No risk profiles computed yet</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
          innerRadius={52} outerRadius={78} paddingAngle={2} stroke="none">
          {data.map((d, i) => <Cell key={i} fill={d.hex} />)}
        </Pie>
        <Tooltip content={<DarkTooltip />} />
        <Legend
          verticalAlign="bottom" height={30}
          iconType="circle" iconSize={8}
          formatter={(v) => <span className="text-[11px] text-slate-400">{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Generic labelled donut (quality ratings, verdicts) ────────────────
export function LabelledDonut({ distribution, colorMap, height = 220 }) {
  const data = Object.entries(distribution || {})
    .filter(([, v]) => v)
    .map(([k, v]) => ({ name: k, value: v, hex: colorMap[(k || "").toUpperCase()] || colorMap[k] || "#64748b" }));

  if (data.length === 0) {
    return <p className="text-slate-600 text-sm text-center py-12">No data yet</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
          innerRadius={52} outerRadius={78} paddingAngle={2} stroke="none">
          {data.map((d, i) => <Cell key={i} fill={d.hex} />)}
        </Pie>
        <Tooltip content={<DarkTooltip />} />
        <Legend verticalAlign="bottom" height={30} iconType="circle" iconSize={8}
          formatter={(v) => <span className="text-[11px] text-slate-400">{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Horizontal-ish bar for top failing endpoints ──────────────────────
export function HBarChart({ data, dataKey, labelKey, color = "#fb923c", height = 260, unit = "" }) {
  const chartData = data || [];
  if (chartData.length === 0) {
    return <p className="text-slate-600 text-sm text-center py-12">No data</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
        <XAxis type="number" stroke="#1e293b" tick={{ fill: "#475569", fontSize: 10 }} allowDecimals={false} />
        <YAxis type="category" dataKey={labelKey} width={140} stroke="#1e293b"
          tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(v) => (v?.length > 22 ? v.slice(0, 21) + "…" : v)} />
        <Tooltip content={<DarkTooltip unit={unit} />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
        <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
