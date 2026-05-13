// src/admin/pages/WorkflowClientsPage.jsx — Premium responsive
import React, { useState, useEffect, useCallback } from "react";
import { adminApi } from "../utils/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import { StatusBadge, UnpaidCountdown, DataTable, LoadingSpinner } from "../components/UIComponents";
import ClientManagementModal from "../components/ClientManagementModal";
import MarkAsPaidModal from "../components/MarkAsPaidModal";
import { Search, Zap, CreditCard, History, Users, SlidersHorizontal } from "lucide-react";
import ClientHistoryTimeline from "./ClientHistoryTimeline";

export default function WorkflowClientsPage() {
  const { isSuperAdmin, isSubAdmin } = useAdminAuth();
  const [historyClient, setHistoryClient] = useState(null);
  const [clients, setClients]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter]   = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [subadminFilter, setSubadminFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activateClient, setActivateClient] = useState(null);
  const [markPaidClient, setMarkPaidClient] = useState(null);
  const [subadmins, setSubadmins]   = useState([]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.payment_status = paymentFilter;
      if (subadminFilter) params.subadmin = subadminFilter;
      const res = await adminApi.get("/workflow/clients/", { params });
      setClients(res.data);
    } catch { setError("Failed to load clients."); }
    finally { setLoading(false); }
  }, [search, statusFilter, paymentFilter, subadminFilter]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  useEffect(() => {
    if (isSuperAdmin) adminApi.get("/subadmins/").then(r => setSubadmins(r.data)).catch(() => {});
  }, [isSuperAdmin]);

  const handleAssign = async (clientId, subadminId) => {
    try {
      await adminApi.post("/clients/assign/", { client_id: clientId, subadmin_id: subadminId || null });
      fetchClients();
    } catch { alert("Failed to update assignment."); }
  };

  const activeFilters = [statusFilter, paymentFilter, subadminFilter].filter(Boolean).length;

  const columns = [
    {
      key: "username", label: "Client",
      render: (r) => (
        <div>
          <p className="text-white font-semibold text-[13px]">{r.username}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{r.business_name || "—"}</p>
        </div>
      ),
    },
    {
      key: "subscription_status", label: "Status",
      render: (r) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={r.subscription_status} />
          {r.subscription_plan && <span className="text-[10px] text-slate-500">{r.subscription_plan}</span>}
        </div>
      ),
    },
    {
      key: "payment_status", label: "Payment",
      render: (r) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={r.payment_status} />
          <UnpaidCountdown daysRemaining={r.days_pending_unpaid} />
        </div>
      ),
    },
    {
      key: "activated_by_username", label: "Activated By",
      render: (r) => r.activated_by_username ? (
        <div>
          <p className="text-xs text-slate-300">{r.activated_by_username}</p>
          {r.activation_timestamp && <p className="text-[10px] text-slate-600">{new Date(r.activation_timestamp).toLocaleDateString()}</p>}
        </div>
      ) : <span className="text-xs text-slate-600">—</span>,
    },
  ];

  if (isSuperAdmin) {
    columns.push({
      key: "assigned_subadmin", label: "SubAdmin",
      render: (r) => (
        <select value={r.assigned_subadmin || ""} onChange={(e) => handleAssign(r.id, e.target.value)}
          className="bg-white/[0.03] border border-white/[0.06] text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-500/40 max-w-[130px]">
          <option value="">Unassigned</option>
          {subadmins.map(s => <option key={s.id} value={s.id}>{s.username}</option>)}
        </select>
      ),
    });
  }

  columns.push({
    key: "actions", label: "Actions",
    render: (r) => (
      <div className="flex items-center gap-1.5 flex-wrap">
        <button onClick={() => setHistoryClient(r)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:bg-white/[0.06] transition-all">
          <History size={11} /> History
        </button>
        {isSubAdmin && (
          <button onClick={() => setActivateClient(r)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/15 hover:bg-amber-500/20 transition-all">
            <Zap size={11} /> Manage
          </button>
        )}
        {isSuperAdmin && r.subscription_status === "ACTIVE" && r.payment_status === "UNPAID" && (
          <button onClick={() => setMarkPaidClient(r)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 hover:bg-emerald-500/20 transition-all">
            <CreditCard size={11} /> Pay
          </button>
        )}
        {isSuperAdmin && (
          <button onClick={() => setActivateClient(r)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:bg-white/[0.06] transition-all">
            <Zap size={11} /> Edit
          </button>
        )}
      </div>
    ),
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <Users size={18} className="text-amber-400" />
          {isSuperAdmin ? "All Clients" : "My Clients"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Subscription management & payment workflow</p>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.06] text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-amber-500/30 transition-colors placeholder:text-slate-600" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
            showFilters || activeFilters > 0
              ? "bg-amber-400/10 text-amber-400 border-amber-500/20"
              : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:bg-white/[0.04]"
          }`}>
          <SlidersHorizontal size={13} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilters > 0 && <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] font-bold flex items-center justify-center">{activeFilters}</span>}
        </button>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/[0.02] border border-white/[0.06] text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500/30">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-white/[0.02] border border-white/[0.06] text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500/30">
            <option value="">All Payments</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
          </select>
          {isSuperAdmin && (
            <select value={subadminFilter} onChange={(e) => setSubadminFilter(e.target.value)}
              className="bg-white/[0.02] border border-white/[0.06] text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500/30">
              <option value="">All SubAdmins</option>
              {subadmins.map(s => <option key={s.id} value={s.id}>{s.username}</option>)}
            </select>
          )}
          {activeFilters > 0 && (
            <button onClick={() => { setStatusFilter(""); setPaymentFilter(""); setSubadminFilter(""); }}
              className="text-xs text-amber-400 hover:text-amber-300 px-2 py-2 transition-colors">Clear all</button>
          )}
        </div>
      )}

      {/* Stats pills */}
      {!loading && (
        <div className="flex gap-2 sm:gap-3 flex-wrap text-[11px]">
          <span className="px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04] text-slate-400">
            Total <strong className="text-white ml-1">{clients.length}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400">
            Active <strong className="ml-1">{clients.filter(c => c.subscription_status === "ACTIVE").length}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-orange-500/5 border border-orange-500/10 text-orange-400">
            Unpaid <strong className="ml-1">{clients.filter(c => c.payment_status === "UNPAID" && c.subscription_status === "ACTIVE").length}</strong>
          </span>
        </div>
      )}

      {loading ? <LoadingSpinner /> : error ? <p className="text-red-400 text-center py-8">{error}</p> : (
        <DataTable columns={columns} data={clients} emptyMessage="No clients found" />
      )}

      <ClientManagementModal client={activateClient} open={!!activateClient} onClose={() => setActivateClient(null)} onSuccess={fetchClients} userRole={isSuperAdmin} />
      <MarkAsPaidModal client={markPaidClient} open={!!markPaidClient} onClose={() => setMarkPaidClient(null)} onSuccess={fetchClients} />
      <ClientHistoryTimeline clientId={historyClient?.id} open={!!historyClient} onClose={() => setHistoryClient(null)} />
    </div>
  );
}