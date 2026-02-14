// src/pages/SuperAdmin/SubAdminsPage.jsx
import React, { useState, useEffect } from "react";
import { adminApi } from "../utils/api";
import {
  StatusBadge,
  DataTable,
  LoadingSpinner,
} from "../components/UIComponents";
import { useNavigate } from "react-router-dom";

import { UserPlus, ToggleLeft, ToggleRight, Ban, CheckCircle, Eye, Activity } from "lucide-react";

export default function SubAdminsPage() {
  const navigate = useNavigate();
  const [subadmins, setSubadmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSubadmins();
  }, []);

  const fetchSubadmins = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get("/subadmins/");
      setSubadmins(res.data);
    } catch (err) {
      console.error("Failed to fetch subadmins:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setCreating(true);
    try {
      await adminApi.post("/subadmins/create/", form);
      setShowCreate(false);
      setForm({ username: "", email: "", password: "" });
      fetchSubadmins();
    } catch (err) {
      setFormError(
        err.response?.data?.username?.[0] ||
          err.response?.data?.email?.[0] ||
          err.response?.data?.error ||
          "Failed to create SubAdmin."
      );
    } finally {
      setCreating(false);
    }
  };

  const toggleAccess = async (id, currentAccess) => {
    try {
      await adminApi.patch(`/subadmins/${id}/toggle-access/`, {
        admin_access: !currentAccess,
      });
      fetchSubadmins();
    } catch (err) {
      console.error("Failed to toggle access:", err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await adminApi.patch(`/subadmins/${id}/suspend/`, {
        status: newStatus,
      });
      fetchSubadmins();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const viewActivity = (subadminId) => {
    navigate(`/admin/subadmins/${subadminId}/activity`);
  };

  const columns = [
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "admin_access",
      label: "Portal Access",
      render: (r) => (
        <button
          onClick={() => toggleAccess(r.id, r.admin_access)}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${
            r.admin_access
              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              : "bg-slate-700/50 text-slate-500 hover:bg-slate-700"
          }`}
        >
          {r.admin_access ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          {r.admin_access ? "Enabled" : "Disabled"}
        </button>
      ),
    },
    { 
      key: "assigned_client_count", 
      label: "Clients",
      render: (r) => (
        <span className="text-sm font-medium text-slate-300">
          {r.assigned_client_count || 0}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Activity Button */}
          <button
            onClick={() => viewActivity(r.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
          >
            <Activity size={12} />
            Activity
          </button>

          {r.status === "ACTIVE" ? (
            <button
              onClick={() => updateStatus(r.id, "SUSPENDED")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
            >
              <Ban size={12} /> Suspend
            </button>
          ) : (
            <button
              onClick={() => updateStatus(r.id, "ACTIVE")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            >
              <CheckCircle size={12} /> Activate
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">SubAdmin Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create and manage SubAdmin accounts
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/20 transition-all"
        >
          <UserPlus size={16} />
          Create SubAdmin
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4">
            New SubAdmin
          </h3>
          {formError && (
            <p className="text-red-400 text-sm mb-3">{formError}</p>
          )}
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              className="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400/40"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400/40"
            />
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400/40"
              />
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-sm font-semibold disabled:opacity-50"
              >
                {creating ? "..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        columns={columns}
        data={subadmins}
        emptyMessage="No SubAdmins created yet"
      />
    </div>
  );
}