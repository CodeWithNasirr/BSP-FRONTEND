// src/pages/SubAdmin/Dashboard.jsx (v2 — Subscription Workflow)
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
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await adminApi.get("/analytics/sub-dashboard/");
      setData(res.data);
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-400 text-center py-8">{error}</p>;
  if (!data) return null;

  const clientRevCols = [
    { key: "username", label: "Client" },
    { key: "business_name", label: "Business" },
    {
      key: "total_revenue",
      label: "Revenue",
      render: (r) => (
        <span className="text-amber-400 font-medium">
          ₹{Number(r.total_revenue).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">My Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Your assigned clients, revenue & workflow status
        </p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="My Clients"
          value={data.total_clients}
          icon={Users}
          accent="blue"
        />
        <StatCard
          title="Active Clients"
          value={data.active_clients}
          icon={UserCheck}
          accent="emerald"
        />
        <StatCard
          title="Pending Unpaid"
          value={data.pending_unpaid}
          subtitle="Awaiting SuperAdmin approval"
          icon={Clock}
          accent="orange"
        />
        <StatCard
          title="Paid"
          value={data.paid_count}
          icon={CheckCircle}
          accent="blue"
        />
        <StatCard
          title="My Revenue"
          value={`₹${Number(data.total_commission_earned).toLocaleString()}`}
          icon={DollarSign}
          accent="amber"
        />
      </div>

      {/* Chart */}
      <MonthlyRevenueChart data={data.monthly_revenue} />

      {/* Table */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-3">
          Revenue Per Client
        </h3>
        <DataTable
          columns={clientRevCols}
          data={data.revenue_per_client || []}
          emptyMessage="No client revenue data yet"
        />
      </div>
    </div>
  );
}