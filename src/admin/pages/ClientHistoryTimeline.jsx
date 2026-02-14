// src/components/ClientHistoryTimeline.jsx
import React, { useState, useEffect } from "react";
import { adminApi } from "../utils/api";
import { 
  History, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  CreditCard, 
  Users, 
  Calendar,
  TrendingUp,
  ArrowRight,
  User,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  Package,
  CalendarDays
} from "lucide-react";

const EVENT_ICONS = {
  "subscription_change": Zap,
  "payment": CreditCard,
  "commission": Users
};

export default function ClientHistoryTimeline({ clientId, open, onClose }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedMonths, setExpandedMonths] = useState({});
  const [activeTab, setActiveTab] = useState("timeline");

  useEffect(() => {
    if (open && clientId) {
      fetchHistory();
    }
  }, [open, clientId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(`/workflow/client-history/${clientId}/`);
      setHistory(res.data);
      // Auto-expand current month
      if (res.data.monthly_summary?.length > 0) {
        setExpandedMonths({ [res.data.monthly_summary[0].month_year]: true });
      }
    } catch (err) {
      setError("Failed to load client history.");
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 w-full sm:max-w-4xl sm:mx-4 shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl border border-slate-700/50">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <History size={20} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Subscription History
                </h3>
                {history && (
                  <p className="text-xs sm:text-sm text-slate-400">
                    {history.client.business_name || history.client.username}
                    {history.client.current_plan && (
                      <span className="ml-2 text-amber-400">• {history.client.current_plan}</span>
                    )}
                  </p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X size={22} />
            </button>
          </div>

          {/* Tabs */}
          {history && (
            <div className="flex gap-2 mt-4">
              {[
                { id: "timeline", label: "Timeline", icon: Calendar },
                { id: "monthly", label: "By Month", icon: CalendarDays },
                { id: "stats", label: "Statistics", icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <tab.icon size={12} />
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          ) : history ? (
            <>
              {/* Stats Tab */}
              {activeTab === "stats" && <StatsView stats={history.stats} formatCurrency={formatCurrency} />}

              {/* Monthly Tab */}
              {activeTab === "monthly" && (
                <MonthlyView 
                  monthly={history.monthly_summary} 
                  expanded={expandedMonths}
                  toggle={toggleMonth}
                  formatCurrency={formatCurrency}
                />
              )}

              {/* Timeline Tab */}
              {activeTab === "timeline" && (
                <TimelineView 
                  events={history.timeline} 
                  formatCurrency={formatCurrency}
                />
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Stats View Component
function StatsView({ stats, formatCurrency }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={Zap} label="Total Activations" value={stats.total_activations} color="emerald" />
        <StatCard icon={AlertCircle} label="Total Deactivations" value={stats.total_deactivations} color="red" />
        <StatCard icon={Clock} label="Months Subscribed" value={stats.total_months_subscribed} color="blue" />
        <StatCard icon={CreditCard} label="Total Payments" value={stats.total_payments} color="amber" />
        <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats.total_revenue)} color="emerald" />
        <StatCard icon={Users} label="Total Commissions" value={formatCurrency(stats.total_commissions)} color="amber" />
      </div>

      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <User size={14} className="text-slate-400" />
          Current Status
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Current Plan</span>
            <span className="text-amber-400 font-medium">{stats.current_plan || "None"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status</span>
            <span className={stats.current_status === "ACTIVE" ? "text-emerald-400" : "text-red-400"}>
              {stats.current_status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Payment Status</span>
            <span className={stats.payment_status === "PAID" ? "text-emerald-400" : "text-orange-400"}>
              {stats.payment_status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Assigned SubAdmin</span>
            <span className="text-slate-200">{stats.assigned_subadmin || "Unassigned"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Activated By</span>
            <span className="text-slate-200">{stats.activated_by || "N/A"}</span>
          </div>
          {stats.first_activation && (
            <div className="flex justify-between">
              <span className="text-slate-400">First Activation</span>
              <span className="text-slate-200">
                {new Date(stats.first_activation).toLocaleDateString("en-IN")}
              </span>
            </div>
          )}
          {stats.last_payment && (
            <div className="flex justify-between">
              <span className="text-slate-400">Last Payment</span>
              <span className="text-slate-200">
                {new Date(stats.last_payment).toLocaleDateString("en-IN")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Monthly View Component
function MonthlyView({ monthly, expanded, toggle, formatCurrency }) {
  return (
    <div className="space-y-3">
      {monthly.map((month) => (
        <div key={month.month_year} className="bg-slate-800/30 rounded-xl border border-slate-700/30 overflow-hidden">
          <button
            onClick={() => toggle(month.month_year)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CalendarDays size={16} className="text-slate-400" />
              <span className="font-medium text-white">{month.month_year}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-3 text-xs">
                {month.activations > 0 && (
                  <span className="text-emerald-400">{month.activations} activated</span>
                )}
                {month.payments > 0 && (
                  <span className="text-blue-400">{month.payments} payments</span>
                )}
                {month.revenue > 0 && (
                  <span className="text-amber-400">{formatCurrency(month.revenue)}</span>
                )}
              </div>
              {expanded[month.month_year] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {expanded[month.month_year] && (
            <div className="p-4 space-y-3">
              {/* Plans activated this month */}
              {month.plans_activated?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Plans Activated</p>
                  <div className="space-y-1">
                    {month.plans_activated.map((plan, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Package size={12} className="text-amber-400" />
                        <span className="text-slate-200">{plan.plan}</span>
                        <span className="text-slate-500 text-xs">by {plan.by} on {plan.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              <div className="space-y-2">
                {month.events.map((event) => (
                  <div key={event.id} className="flex gap-3 p-2 rounded-lg bg-slate-900/50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      event.color === "emerald" ? "bg-emerald-500/20" :
                      event.color === "red" ? "bg-red-500/20" :
                      event.color === "blue" ? "bg-blue-500/20" :
                      "bg-amber-500/20"
                    }`}>
                      {React.createElement(EVENT_ICONS[event.type] || Zap, {
                        size: 14,
                        className: event.color === "emerald" ? "text-emerald-400" :
                                   event.color === "red" ? "text-red-400" :
                                   event.color === "blue" ? "text-blue-400" :
                                   "text-amber-400"
                      })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-slate-500">{event.day_date}</span>
                        {event.new_plan && (
                          <span className="text-xs text-amber-400">{event.new_plan}</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-200 font-medium truncate">{event.title}</p>
                      <p className="text-xs text-slate-500 truncate">{event.description}</p>
                      {event.changed_by && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          by {event.changed_by} ({event.changed_by_type})
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Timeline View Component
function TimelineView({ events, formatCurrency }) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-slate-700/50" />
      
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="relative flex gap-4">
            {/* Icon */}
            <div className={`relative z-10 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
              event.color === "emerald" ? "bg-emerald-500/20 border-emerald-500/30" :
              event.color === "red" ? "bg-red-500/20 border-red-500/30" :
              event.color === "blue" ? "bg-blue-500/20 border-blue-500/30" :
              "bg-amber-500/20 border-amber-500/30"
            }`}>
              {React.createElement(EVENT_ICONS[event.type] || Zap, {
                size: 16,
                className: event.color === "emerald" ? "text-emerald-400" :
                         event.color === "red" ? "text-red-400" :
                         event.color === "blue" ? "text-blue-400" :
                         "text-amber-400"
              })}
            </div>

            {/* Content */}
            <div className="flex-1 bg-slate-800/30 rounded-xl p-3 sm:p-4 border border-slate-700/30">
              {/* Header */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  event.type === "subscription_change" 
                    ? event.new_status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                    : event.type === "payment"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}>
                  {event.type === "subscription_change" ? "SUBSCRIPTION" :
                   event.type === "payment" ? "PAYMENT" : "COMMISSION"}
                </span>
                <span className="text-xs text-slate-500">{event.day_date}</span>
                {event.is_auto_logged && (
                  <span className="text-[10px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">auto</span>
                )}
              </div>

              {/* Title */}
              <h4 className="text-sm font-medium text-white mb-1">{event.title}</h4>
              
              {/* Description */}
              <p className="text-xs text-slate-400 mb-2">{event.description}</p>

              {/* Details */}
              <div className="flex flex-wrap gap-3 text-xs">
                {/* Status change */}
                {event.old_status && event.new_status && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/50">
                    <span className={event.old_status === "ACTIVE" ? "text-emerald-400" : "text-red-400"}>
                      {event.old_status}
                    </span>
                    <ArrowRight size={12} className="text-slate-600" />
                    <span className={event.new_status === "ACTIVE" ? "text-emerald-400" : "text-red-400"}>
                      {event.new_status}
                    </span>
                  </div>
                )}

                {/* Plan info */}
                {event.new_plan && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 text-amber-400">
                    <Package size={12} />
                    {event.new_plan}
                  </div>
                )}

                {/* Amount */}
                {event.amount && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/50 text-slate-300">
                    <DollarSign size={12} className="text-amber-400" />
                    {formatCurrency(event.amount)}
                  </div>
                )}

                {/* Commission */}
                {event.commission_percent !== undefined && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 text-amber-400">
                    <Users size={12} />
                    {event.commission_percent}% commission
                  </div>
                )}

                {/* Changed by */}
                {event.changed_by && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/50 text-slate-500">
                    <User size={12} />
                    {event.changed_by}
                    <span className="text-slate-600">({event.changed_by_type})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20"
  };

  return (
    <div className={`p-3 rounded-xl border ${colors[color]}`}>
      <Icon size={16} className="mb-2 opacity-70" />
      <p className="text-[10px] opacity-70 mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}