// src/pages/ClientsPage.jsx
import React, { useState, useEffect } from "react";
import { adminApi } from "../utils/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Crown,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  UserPlus,
  Shield,
  MoreHorizontal,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, subtext, color }) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/10",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/10",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/10",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/10",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/10",
  };
  return (
    <div className={`p-3 sm:p-4 rounded-2xl border ${colors[color]}`}>
      <Icon size={16} className="mb-2 opacity-60" />
      <p className="text-[9px] sm:text-[10px] opacity-60 mb-0.5 uppercase tracking-wider font-bold">
        {label}
      </p>
      <p className="text-lg sm:text-xl font-extrabold">{value}</p>
      {subtext && <p className="text-[10px] opacity-50 mt-0.5">{subtext}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
    INACTIVE: "bg-slate-500/10 text-slate-400 border-slate-500/15",
    SUSPENDED: "bg-rose-500/10 text-rose-400 border-rose-500/15",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/15",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${styles[status] || styles.INACTIVE}`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

export default function ClientsPage() {
  const { isSuperAdmin } = useAdminAuth();
  const [clients, setClients] = useState([]);
  const [subadmins, setSubadmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedClient, setExpandedClient] = useState(null);

  useEffect(() => {
    fetchClients();
    if (isSuperAdmin) fetchSubadmins();
  }, []);

  const fetchClients = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterStatus) params.set("status", filterStatus);
      const res = await adminApi.get(`/clients/?${params.toString()}`);
      setClients(res.data);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  const fetchSubadmins = async () => {
    try {
      const res = await adminApi.get("/subadmins/");
      setSubadmins(res.data);
    } catch {
      // handle
    }
  };

  const assignSubadmin = async (clientId, subadminId) => {
    try {
      await adminApi.post("/clients/assign/", {
        client_id: clientId,
        subadmin_id: subadminId || null,
      });
      fetchClients();
    } catch {
      // handle
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchClients();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, filterStatus]);

  // Stats
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.subscription_status === "ACTIVE").length;
  const inactiveClients = clients.filter((c) => c.subscription_status === "INACTIVE").length;
  const suspendedClients = clients.filter((c) => c.subscription_status === "SUSPENDED").length;
  const unassignedClients = clients.filter((c) => !c.assigned_subadmin).length;

  const toggleExpand = (id) => {
    setExpandedClient(expandedClient === id ? null : id);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Users size={20} className="text-amber-400" />
            {isSuperAdmin ? "Client Management" : "My Clients"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isSuperAdmin
              ? "Manage all platform clients and assignments"
              : "Clients assigned to you"}
          </p>
        </div>
        {isSuperAdmin && (
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-xs font-semibold">
            <UserPlus size={14} /> Add Client
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          icon={Users}
          label="Total"
          value={totalClients}
          color="blue"
        />
        <StatCard
          icon={UserCheck}
          label="Active"
          value={activeClients}
          subtext={`${Math.round((activeClients / (totalClients || 1)) * 100)}%`}
          color="emerald"
        />
        <StatCard
          icon={UserX}
          label="Inactive"
          value={inactiveClients}
          color="amber"
        />
        <StatCard
          icon={Shield}
          label="Suspended"
          value={suspendedClients}
          color="rose"
        />
        {isSuperAdmin && (
          <StatCard
            icon={Clock}
            label="Unassigned"
            value={unassignedClients}
            color="purple"
          />
        )}
      </div>

      {/* Filters */}
      <div className="bg-[#0d1120] border border-white/[0.04] rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search by name, email, business..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-slate-300 text-sm focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d1120] border border-white/[0.04] rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-3 border-b border-white/[0.04] text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-3">Client</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Plan</div>
          <div className="col-span-2">Business</div>
          {isSuperAdmin && <div className="col-span-2">Assigned To</div>}
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Users size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">No clients found</p>
            <p className="text-xs mt-1 opacity-60">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {clients.map((client) => (
              <div key={client.id}>
                {/* Main Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 px-4 sm:px-5 py-3 items-center hover:bg-white/[0.015] transition-colors">
                  {/* Client Info */}
                  <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-amber-400">
                        {(client.username || "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {client.username}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {client.email}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <StatusBadge status={client.subscription_status} />
                  </div>

                  {/* Plan */}
                  <div className="col-span-2">
                    <span className="text-xs text-slate-300">
                      {client.subscription_plan || (
                        <span className="text-slate-600 italic">None</span>
                      )}
                    </span>
                  </div>

                  {/* Business */}
                  <div className="col-span-2">
                    <span className="text-xs text-slate-400 truncate block">
                      {client.business_name || "—"}
                    </span>
                  </div>

                  {/* Assigned To (SuperAdmin only) */}
                  {isSuperAdmin && (
                    <div className="col-span-2">
                      <select
                        value={client.assigned_subadmin || ""}
                        onChange={(e) =>
                          assignSubadmin(
                            client.id,
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-amber-400/30 transition-all"
                      >
                        <option value="">Unassigned</option>
                        {subadmins.map((sa) => (
                          <option key={sa.id} value={sa.id}>
                            {sa.username}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => toggleExpand(client.id)}
                      className="p-1.5 rounded-lg hover:bg-white/[0.04] text-slate-500 hover:text-white transition-colors"
                    >
                      {expandedClient === client.id ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                {expandedClient === client.id && (
                  <div className="px-4 sm:px-5 pb-4 bg-white/[0.01] border-t border-white/[0.03]">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                      <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                        <p className="text-[10px] text-slate-500 mb-1">Phone</p>
                        <p className="text-xs text-white font-medium">
                          {client.phone || "—"}
                        </p>
                      </div>
                      <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                        <p className="text-[10px] text-slate-500 mb-1">
                          Created
                        </p>
                        <p className="text-xs text-white font-medium">
                          {client.created_at
                            ? new Date(client.created_at).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}
                        </p>
                      </div>
                      <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                        <p className="text-[10px] text-slate-500 mb-1">
                          Last Login
                        </p>
                        <p className="text-xs text-white font-medium">
                          {client.last_login
                            ? new Date(client.last_login).toLocaleDateString(
                                "en-IN"
                              )
                            : "Never"}
                        </p>
                      </div>
                      <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                        <p className="text-[10px] text-slate-500 mb-1">ID</p>
                        <p className="text-xs text-slate-400 font-mono">
                          #{client.id}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}