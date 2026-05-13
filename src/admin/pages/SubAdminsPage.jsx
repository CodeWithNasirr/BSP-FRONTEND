// src/admin/pages/SubAdminsPage.jsx — Premium responsive
import React, { useState, useEffect } from "react";
import { adminApi } from "../utils/api";
import { StatusBadge, DataTable, LoadingSpinner } from "../components/UIComponents";
import { useNavigate } from "react-router-dom";
import { UserPlus, ToggleLeft, ToggleRight, Ban, CheckCircle, Activity } from "lucide-react";

export default function SubAdminsPage() {
  const navigate = useNavigate();
  const [subadmins, setSubadmins] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]           = useState({ username: "", email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [creating, setCreating]   = useState(false);

  useEffect(() => { fetchSubadmins(); }, []);
  const fetchSubadmins = async () => { setLoading(true); try { const r = await adminApi.get("/subadmins/"); setSubadmins(r.data); } catch {} finally { setLoading(false); } };

  const handleCreate = async (e) => {
    e.preventDefault(); setFormError(""); setCreating(true);
    try { await adminApi.post("/subadmins/create/", form); setShowCreate(false); setForm({ username: "", email: "", password: "" }); fetchSubadmins(); }
    catch (err) { setFormError(err.response?.data?.username?.[0] || err.response?.data?.email?.[0] || err.response?.data?.error || "Failed to create SubAdmin."); }
    finally { setCreating(false); }
  };

  const toggleAccess = async (id, cur) => { try { await adminApi.patch(`/subadmins/${id}/toggle-access/`, { admin_access: !cur }); fetchSubadmins(); } catch {} };
  const updateStatus = async (id, s)   => { try { await adminApi.patch(`/subadmins/${id}/suspend/`, { status: s }); fetchSubadmins(); } catch {} };

  const columns = [
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "admin_access", label: "Access",
      render: (r) => (
        <button onClick={() => toggleAccess(r.id, r.admin_access)}
          className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-lg transition-all ${
            r.admin_access ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.03] text-slate-500"
          }`}>
          {r.admin_access ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
          {r.admin_access ? "On" : "Off"}
        </button>
      ),
    },
    { key: "assigned_client_count", label: "Clients", render: (r) => <span className="text-sm font-medium text-slate-300">{r.assigned_client_count || 0}</span> },
    {
      key: "actions", label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => navigate(`/subadmins/${r.id}/activity`)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/15 hover:bg-amber-500/20 transition-all">
            <Activity size={11} /> Activity
          </button>
          {r.status === "ACTIVE" ? (
            <button onClick={() => updateStatus(r.id, "SUSPENDED")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/15 hover:bg-red-500/20 transition-all">
              <Ban size={11} /> Suspend
            </button>
          ) : (
            <button onClick={() => updateStatus(r.id, "ACTIVE")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 hover:bg-emerald-500/20 transition-all">
              <CheckCircle size={11} /> Activate
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white">SubAdmin Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Create and manage SubAdmin accounts</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-sm font-bold hover:shadow-lg hover:shadow-amber-500/20 transition-all self-start sm:self-auto">
          <UserPlus size={15} /> Create SubAdmin
        </button>
      </div>

      {showCreate && (
        <div className="bg-[#0d1120] border border-white/[0.04] rounded-2xl p-4 sm:p-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">New SubAdmin</h3>
          {formError && <p className="text-red-400 text-sm mb-3">{formError}</p>}
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required
              className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400/30" />
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
              className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400/30" />
            <div className="flex gap-2">
              <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400/30" />
              <button type="submit" disabled={creating}
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-sm font-bold disabled:opacity-50 shrink-0">
                {creating ? "..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={subadmins} emptyMessage="No SubAdmins created yet" />
    </div>
  );
}