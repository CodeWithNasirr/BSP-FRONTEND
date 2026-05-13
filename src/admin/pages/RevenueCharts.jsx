// src/admin/pages/RevenueCharts.jsx — Premium charts
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111827] border border-white/[0.08] rounded-xl px-3 py-2 shadow-2xl">
      <p className="text-[10px] text-slate-500 font-medium">{label}</p>
      <p className="text-sm font-bold text-amber-400 font-mono">₹{Number(payload[0].value).toLocaleString()}</p>
    </div>
  );
};

export function MonthlyRevenueChart({ data }) {
  const chartData = (data || []).map(d => ({ month: d.month, revenue: parseFloat(d.revenue) }));
  return (
    <div className="bg-[#0d1120] border border-white/[0.04] rounded-2xl p-4 sm:p-6">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Monthly Revenue</h3>
      {chartData.length === 0 ? (
        <p className="text-slate-600 text-sm text-center py-10">No revenue data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="month" stroke="#1e293b" tick={{ fill: "#475569", fontSize: 10 }} />
            <YAxis stroke="#1e293b" tick={{ fill: "#475569", fontSize: 10 }} tickFormatter={v => `₹${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#revenueGrad)" dot={{ fill: "#f59e0b", r: 3, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function SubAdminRevenueBarChart({ data }) {
  const chartData = (data || []).map(d => ({ name: d.username, revenue: parseFloat(d.total_revenue) }));
  return (
    <div className="bg-[#0d1120] border border-white/[0.04] rounded-2xl p-4 sm:p-6">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Revenue Per SubAdmin</h3>
      {chartData.length === 0 ? (
        <p className="text-slate-600 text-sm text-center py-10">No SubAdmin revenue data</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="name" stroke="#1e293b" tick={{ fill: "#475569", fontSize: 10 }} />
            <YAxis stroke="#1e293b" tick={{ fill: "#475569", fontSize: 10 }} tickFormatter={v => `₹${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}