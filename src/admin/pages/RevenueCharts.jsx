// src/components/RevenueCharts.jsx
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-amber-400">
        ₹{Number(payload[0].value).toLocaleString()}
      </p>
    </div>
  );
};

export function MonthlyRevenueChart({ data }) {
  const chartData = (data || []).map((d) => ({
    month: d.month,
    revenue: parseFloat(d.revenue),
  }));

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
      <h3 className="text-sm font-medium text-slate-400 mb-4">
        Monthly Revenue
      </h3>
      {chartData.length === 0 ? (
        <p className="text-slate-600 text-sm text-center py-8">
          No revenue data yet
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="month"
              stroke="#475569"
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <YAxis
              stroke="#475569"
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#revenueGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function SubAdminRevenueBarChart({ data }) {
  const chartData = (data || []).map((d) => ({
    name: d.username,
    revenue: parseFloat(d.total_revenue),
  }));

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
      <h3 className="text-sm font-medium text-slate-400 mb-4">
        Revenue Per SubAdmin
      </h3>
      {chartData.length === 0 ? (
        <p className="text-slate-600 text-sm text-center py-8">
          No SubAdmin revenue data yet
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="name"
              stroke="#475569"
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <YAxis
              stroke="#475569"
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="revenue"
              fill="#f59e0b"
              radius={[6, 6, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}