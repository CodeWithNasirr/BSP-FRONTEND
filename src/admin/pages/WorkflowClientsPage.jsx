// src/pages/WorkflowClientsPage.jsx (v2 — Subscription Workflow)
import React, { useState, useEffect, useCallback } from "react";
import { adminApi } from "../utils/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  StatusBadge,
  UnpaidCountdown,
  DataTable,
  LoadingSpinner,
} from "../components/UIComponents";
import ClientManagementModal from "../components/ClientManagementModal";
import MarkAsPaidModal from "../components/MarkAsPaidModal";
import { Search, Filter, Zap, CheckCircle, Users, CreditCard, History } from "lucide-react"; 
import ClientHistoryTimeline from "./ClientHistoryTimeline";
export default function WorkflowClientsPage() {
  const { isSuperAdmin, isSubAdmin } = useAdminAuth();

  const [historyClient, setHistoryClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  // Modal state
  const [activateClient, setActivateClient] = useState(null);
  const [markPaidClient, setMarkPaidClient] = useState(null);
  const [subadmins, setSubadmins] = useState([]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.payment_status = paymentFilter;
      const res = await adminApi.get("/workflow/clients/", { params });
      setClients(res.data);
    } catch (err) {
      setError("Failed to load clients.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (isSuperAdmin) {
      adminApi
        .get("/subadmins/")
        .then((res) => setSubadmins(res.data))
        .catch(() => {});
    }
  }, [isSuperAdmin]);

  // ── Assign SubAdmin ──
  const handleAssign = async (clientId, subadminId) => {
    try {
      await adminApi.post("/clients/assign/", {
        client_id: clientId,
        subadmin_id: subadminId || null,
      });
      fetchClients();
    } catch {
      alert("Failed to update assignment.");
    }
  };

  // ── Table Columns ──
  const columns = [
    {
      key: "username",
      label: "Client",
      render: (r) => (
        <div>
          <p className="text-white font-medium text-sm">{r.username}</p>
          <p className="text-[11px] text-slate-500">{r.business_name || "—"}</p>
        </div>
      ),
    },
    {
      key: "subscription_status",
      label: "Status",
      render: (r) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={r.subscription_status} />
          {r.subscription_plan && (
            <span className="text-[10px] text-slate-500">{r.subscription_plan}</span>
          )}
        </div>
      ),
    },
    {
      key: "payment_status",
      label: "Payment",
      render: (r) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={r.payment_status} />
          <UnpaidCountdown daysRemaining={r.days_pending_unpaid} />
        </div>
      ),
    },
    {
      key: "activated_by_username",
      label: "Activated By",
      render: (r) => (
        <div>
          {r.activated_by_username ? (
            <>
              <p className="text-xs text-slate-300">{r.activated_by_username}</p>
              {r.activation_timestamp && (
                <p className="text-[10px] text-slate-600">
                  {new Date(r.activation_timestamp).toLocaleDateString()}
                </p>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-600">—</span>
          )}
        </div>
      ),
    },
  ];

  // SuperAdmin: add SubAdmin assignment column
  if (isSuperAdmin) {
    columns.push({
      key: "assigned_subadmin",
      label: "SubAdmin",
      render: (r) => (
        <select
          value={r.assigned_subadmin || ""}
          onChange={(e) => handleAssign(r.id, e.target.value)}
          className="bg-slate-800/50 border border-slate-700/30 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-500/50 max-w-[140px]"
        >
          <option value="">Unassigned</option>
          {subadmins.map((s) => (
            <option key={s.id} value={s.id}>
              {s.username}
            </option>
          ))}
        </select>
      ),
    });
  }

  // Actions column - FIXED: Single column with all actions including History
  columns.push({
    key: "actions",
    label: "Actions",
    render: (r) => (
      <div className="flex items-center gap-2 flex-wrap">
        {/* View History Button - Available to both SuperAdmin and SubAdmin */}
        <button
          onClick={() => setHistoryClient(r)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/30 text-slate-300 border border-slate-700/30 hover:bg-slate-700/50 transition-all"
        >
          <History size={12} />
          History
        </button>

        {/* SubAdmin: Activate button */}
        {isSubAdmin && (
          <button
            onClick={() => setActivateClient(r)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
          >
            <Zap size={12} />
            Manage
          </button>
        )}

        {/* SuperAdmin: Mark Paid button (only if ACTIVE + UNPAID) */}
        {isSuperAdmin &&
          r.subscription_status === "ACTIVE" &&
          r.payment_status === "UNPAID" && (
            <button
              onClick={() => setMarkPaidClient(r)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all"
            >
              <CreditCard size={12} />
              Mark Paid
            </button>
          )}

        {/* SuperAdmin: also can activate/edit */}
        {isSuperAdmin && (
          <button
            onClick={() => setActivateClient(r)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/30 text-slate-400 border border-slate-700/30 hover:bg-slate-700/50 transition-all"
          >
            <Zap size={12} />
            Edit
          </button>
        )}
      </div>
    ),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={20} className="text-amber-400" />
            {isSuperAdmin ? "All Clients" : "My Clients"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Subscription management & payment workflow
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800/50 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900/50 border border-slate-800/50 text-slate-300 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500/50"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="bg-slate-900/50 border border-slate-800/50 text-slate-300 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500/50"
        >
          <option value="">All Payments</option>
          <option value="PAID">Paid</option>
          <option value="UNPAID">Unpaid</option>
        </select>
      </div>

      {/* Stats bar */}
      {!loading && (
        <div className="flex gap-4 text-xs text-slate-500">
          <span>
            Total: <strong className="text-white">{clients.length}</strong>
          </span>
          <span>
            Active:{" "}
            <strong className="text-emerald-400">
              {clients.filter((c) => c.subscription_status === "ACTIVE").length}
            </strong>
          </span>
          <span>
            Unpaid:{" "}
            <strong className="text-orange-400">
              {clients.filter((c) => c.payment_status === "UNPAID" && c.subscription_status === "ACTIVE").length}
            </strong>
          </span>
          <span>
            Paid:{" "}
            <strong className="text-[#25D366]">
              {clients.filter((c) => c.payment_status === "PAID").length}
            </strong>
          </span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-red-400 text-center py-8">{error}</p>
      ) : (
        <DataTable
          columns={columns}
          data={clients}
          emptyMessage="No clients found"
        />
      )}

      {/* Modals */}
      <ClientManagementModal
        client={activateClient}
        open={!!activateClient}
        onClose={() => setActivateClient(null)}
        onSuccess={fetchClients}
        userRole={isSuperAdmin}
      />

      <MarkAsPaidModal
        client={markPaidClient}
        open={!!markPaidClient}
        onClose={() => setMarkPaidClient(null)}
        onSuccess={fetchClients}
      />

      <ClientHistoryTimeline
        clientId={historyClient?.id}
        open={!!historyClient}
        onClose={() => setHistoryClient(null)}
      />
    </div>
  );
}