// src/pages/ClientsPage.jsx
import React, { useState, useEffect } from "react";
import { adminApi } from "../utils/api";
import {
  StatusBadge,
  DataTable,
  LoadingSpinner,
} from "../components/UIComponents";
import { useAdminAuth } from "../context/AdminAuthContext";
import { Search, UserPlus } from "lucide-react";

export default function ClientsPage() {
  const { isSuperAdmin } = useAdminAuth();
  const [clients, setClients] = useState([]);
  const [subadmins, setSubadmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

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

  const columns = [
    { key: "username", label: "Username" },
    {
      key: "business_name",
      label: "Business",
      render: (r) => (
        <span className="text-slate-300">{r.business_name || "—"}</span>
      ),
    },
    { key: "email", label: "Email" },
    {
      key: "subscription_status",
      label: "Subscription",
      render: (r) => <StatusBadge status={r.subscription_status} />,
    },
    {
      key: "subscription_plan",
      label: "Plan",
      render: (r) => (
        <span className="text-slate-400 text-xs">
          {r.subscription_plan || "None"}
        </span>
      ),
    },
    ...(isSuperAdmin
      ? [
          {
            key: "assigned_subadmin",
            label: "Assigned To",
            render: (r) => (
              <select
                value={r.assigned_subadmin || ""}
                onChange={(e) =>
                  assignSubadmin(
                    r.id,
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-400/40"
              >
                <option value="">Unassigned</option>
                {subadmins.map((sa) => (
                  <option key={sa.id} value={sa.id}>
                    {sa.username}
                  </option>
                ))}
              </select>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">
          {isSuperAdmin ? "Client Management" : "My Clients"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isSuperAdmin
            ? "Manage all platform clients"
            : "Clients assigned to you"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800/50 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400/40"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800/50 text-slate-300 text-sm focus:outline-none focus:border-amber-400/40"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={clients}
          emptyMessage="No clients found"
        />
      )}
    </div>
  );
}