// src/pages/SuperAdmin/Dashboard.jsx (v2 — Subscription Workflow)
import React, { useState, useEffect } from "react";
import { adminApi } from "../../utils/api";
import { StatCard, DataTable, LoadingSpinner } from "../../components/UIComponents";
import { MonthlyRevenueChart, SubAdminRevenueBarChart } from "../RevenueCharts";
import {
  DollarSign,
  Users,
  UserCheck,
  UserCog,
  AlertTriangle,
  Clock,
  CheckCircle,
  PieChart,
} from "lucide-react";

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await adminApi.get("/analytics/super-dashboard/");
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

  const topClientCols = [
    { key: "username", label: "Username" },
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

  const subadminCols = [
    { key: "username", label: "SubAdmin" },
    { key: "client_count", label: "Clients" },
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

  const planCols = [
    { key: "plan", label: "Plan" },
    { key: "count", label: "Subscriptions" },
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
        <h1 className="text-xl font-bold text-white">Platform Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Revenue analytics, workflow metrics & platform health
        </p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${Number(data.total_revenue).toLocaleString()}`}
          icon={DollarSign}
          accent="amber"
        />
        <StatCard
          title="Total Clients"
          value={data.total_clients}
          icon={Users}
          accent="blue"
        />
        <StatCard
          title="Active Clients"
          value={data.active_clients}
          subtitle={`${data.total_clients > 0 ? Math.round((data.active_clients / data.total_clients) * 100) : 0}% active`}
          icon={UserCheck}
          accent="emerald"
        />
        <StatCard
          title="Total SubAdmins"
          value={data.total_subadmins}
          icon={UserCog}
          accent="purple"
        />
      </div>

      {/* Workflow stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Unpaid"
          value={data.pending_unpaid_count}
          subtitle={`₹${Number(data.pending_unpaid_amount).toLocaleString()} pending`}
          icon={Clock}
          accent="orange"
        />
        <StatCard
          title="Paid Clients"
          value={data.paid_clients_count}
          icon={CheckCircle}
          accent="blue"
        />
        <StatCard
          title="Auto-Expired"
          value={data.auto_expired_count}
          subtitle="Deactivated due to unpaid"
          icon={AlertTriangle}
          accent="red"
        />
        <StatCard
          title="Plans Breakdown"
          value={data.revenue_per_plan?.length || 0}
          subtitle="Active plan types"
          icon={PieChart}
          accent="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyRevenueChart data={data.monthly_revenue} />
        <SubAdminRevenueBarChart data={data.revenue_per_subadmin} />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">
            Revenue Per SubAdmin
          </h3>
          <DataTable
            columns={subadminCols}
            data={data.revenue_per_subadmin || []}
            emptyMessage="No SubAdmin revenue data"
          />
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">
            Top 5 Clients by Revenue
          </h3>
          <DataTable
            columns={topClientCols}
            data={data.top_5_clients_by_revenue || []}
            emptyMessage="No client revenue data"
          />
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">
            Revenue Per Plan
          </h3>
          <DataTable
            columns={planCols}
            data={data.revenue_per_plan || []}
            emptyMessage="No plan revenue data"
          />
        </div>
      </div>
    </div>
  );
}