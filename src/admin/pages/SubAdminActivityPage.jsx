// src/pages/SubAdminActivityPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../utils/api";
import { 
  Users, 
  ArrowLeft, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  Zap, 
  DollarSign,
  Activity,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Clock,
  AlertCircle
} from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function SubAdminActivityPage() {
  const { subadminId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedMonths, setExpandedMonths] = useState({});

  useEffect(() => {
    fetchActivity();
  }, [subadminId]);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(`/workflow/subadmin-activity/${subadminId}/`);
      setData(res.data);
      // Auto-expand current month
      if (res.data.monthly_performance?.length > 0) {
        setExpandedMonths({ [res.data.monthly_performance[0].month]: true });
      }
    } catch (err) {
      setError("Failed to load SubAdmin activity.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMonth = (month) => {
    setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? "₹0.00" : `₹${num.toFixed(2)}`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  // Prepare chart data
  const chartData = {
    labels: data?.monthly_performance?.map(m => m.month_name) || [],
    datasets: [
      {
        label: "Activations",
        data: data?.monthly_performance?.map(m => m.activations) || [],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
      },
      {
        label: "Commissions (₹)",
        data: data?.monthly_performance?.map(m => parseFloat(m.commissions || 0)) || [],
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
        yAxisID: "y1"
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#94A3B8" }
      }
    },
    scales: {
      x: {
        ticks: { color: "#94A3B8" },
        grid: { color: "#334155" }
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        ticks: { color: "#94A3B8" },
        grid: { color: "#334155" },
        title: { display: true, text: "Activations", color: "#94A3B8" }
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        ticks: { color: "#94A3B8" },
        grid: { drawOnChartArea: false },
        title: { display: true, text: "Commissions (₹)", color: "#94A3B8" }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { subadmin, summary, recent_activations, monthly_performance } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={20} className="text-amber-400" />
            SubAdmin Activity
          </h1>
          <p className="text-sm text-slate-500">
            Performance overview for {subadmin.username}
          </p>
        </div>
      </div>

      {/* SubAdmin Info Card */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
              <UserCheck size={28} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{subadmin.username}</h2>
              <p className="text-sm text-slate-400">{subadmin.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  subadmin.status === "ACTIVE" 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {subadmin.status}
                </span>
                <span className="text-xs text-slate-500">ID: {subadmin.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard 
          icon={Users} 
          label="Assigned Clients" 
          value={summary.total_assigned_clients}
          subtext={`${summary.active_clients} active`}
          color="blue"
        />
        <StatCard 
          icon={Zap} 
          label="Total Activations" 
          value={summary.total_activations}
          color="emerald"
        />
        <StatCard 
          icon={DollarSign} 
          label="Total Commissions" 
          value={formatCurrency(summary.total_commissions_earned)}
          color="amber"
        />
        <StatCard 
          icon={Clock} 
          label="Pending Payout" 
          value={formatCurrency(summary.pending_commissions)}
          color="orange"
        />
      </div>

      {/* Performance Chart */}
      {monthly_performance?.length > 0 && (
        <div className="bg-slate-800/30 rounded-2xl p-4 sm:p-6 border border-slate-700/30">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-amber-400" />
            Monthly Performance (Last 12 Months)
          </h3>
          <div className="h-64 sm:h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Monthly Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Calendar size={16} className="text-amber-400" />
          Monthly Breakdown
        </h3>
        
        {monthly_performance.map((month) => (
          <div 
            key={month.month} 
            className="bg-slate-800/30 rounded-xl border border-slate-700/30 overflow-hidden"
          >
            <button
              onClick={() => toggleMonth(month.month)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-slate-400" />
                <span className="font-medium text-white">{month.month_name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-3 text-xs">
                  <span className="text-emerald-400">{month.activations} activations</span>
                  {parseFloat(month.commissions || 0) > 0 && (
                    <span className="text-amber-400">{formatCurrency(month.commissions)}</span>
                  )}
                </div>
                {expandedMonths[month.month] ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </div>
            </button>

            {expandedMonths[month.month] && (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Activations</p>
                    <p className="text-lg font-bold text-emerald-400">{month.activations}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Commissions</p>
                    <p className="text-lg font-bold text-amber-400">{formatCurrency(month.commissions)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Activations */}
      {recent_activations?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity size={16} className="text-amber-400" />
            Recent Activations
          </h3>
          
          <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 overflow-hidden">
            <div className="divide-y divide-slate-700/30">
              {recent_activations.map((act, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Zap size={14} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{act.client_name}</p>
                      <p className="text-xs text-slate-500">{formatDate(act.date)}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                    {act.plan}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, subtext, color }) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20"
  };

  return (
    <div className={`p-3 sm:p-4 rounded-xl border ${colors[color]}`}>
      <Icon size={18} className="mb-2 opacity-70" />
      <p className="text-[10px] sm:text-xs opacity-70 mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-lg sm:text-xl font-bold">{value}</p>
      {subtext && <p className="text-[10px] sm:text-xs opacity-60 mt-0.5">{subtext}</p>}
    </div>
  );
}