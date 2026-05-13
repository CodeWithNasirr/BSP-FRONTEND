import React, { useState, useEffect } from "react";
import { adminApi } from "../../utils/api";
import { StatCard, DataTable, LoadingSpinner } from "../../components/UIComponents";
import { MonthlyRevenueChart } from "../RevenueCharts";
import { DollarSign, Users, UserCheck, Clock, CheckCircle } from "lucide-react";

export default function SubAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.get("/analytics/sub-dashboard/").then(r => setData(r.data)).catch(() => setError("Failed to load dashboard.")).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-400 text-center py-8 text-sm">{error}</p>;
  if (!data) return null;

  const cols = [
    { key: "username", label: "Client" },
    { key: "business_name", label: "Business" },
    { key: "total_revenue", label: "Revenue", render: (r) => <span className="text-amber-400 font-bold font-mono">₹{Number(r.total_revenue).toLocaleString()}</span> },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-white">My Dashboard</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Your clients, revenue & workflow status</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard title="My Clients" value={data.total_clients} icon={Users} accent="blue" />
        <StatCard title="Active" value={data.active_clients} icon={UserCheck} accent="emerald" />
        <StatCard title="Pending" value={data.pending_unpaid} subtitle="Awaiting approval" icon={Clock} accent="orange" />
        <StatCard title="Paid" value={data.paid_count} icon={CheckCircle} accent="blue" />
        <StatCard title="Revenue" value={`₹${Number(data.total_commission_earned).toLocaleString()}`} icon={DollarSign} accent="amber" />
      </div>
      <MonthlyRevenueChart data={data.monthly_revenue} />
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Revenue Per Client</h3>
        <DataTable columns={cols} data={data.revenue_per_client || []} emptyMessage="No client revenue data" />
      </div>
    </div>
  );
}