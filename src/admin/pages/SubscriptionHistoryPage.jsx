// src/admin/pages/SubscriptionHistoryPage.jsx — Premium responsive
import React, { useState, useEffect, useCallback } from "react";
import { adminApi } from "../utils/api";
import { StatusBadge, DataTable, LoadingSpinner } from "../components/UIComponents";
import { History, Calendar } from "lucide-react";

export default function SubscriptionHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]   = useState("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const res = await adminApi.get("/workflow/history/", { params });
      setHistory(res.data);
    } catch { setError("Failed to load subscription history."); }
    finally { setLoading(false); }
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";

  const columns = [
    { key: "created_at", label: "Date", render: (r) => <span className="text-[11px] text-slate-400 font-mono">{new Date(r.created_at).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span> },
    { key: "client_username", label: "Client", render: (r) => (<div><p className="text-[13px] text-white font-medium">{r.client_username}</p><p className="text-[10px] text-slate-600">{r.client_business}</p></div>) },
    { key: "old_status", label: "Old", render: (r) => r.old_status ? <StatusBadge status={r.old_status} /> : <span className="text-[10px] text-slate-600">—</span> },
    { key: "new_status", label: "New", render: (r) => <StatusBadge status={r.new_status} /> },
    { key: "plan_change", label: "Plan", render: (r) => <span className="text-[11px] text-slate-400">{r.old_plan || "—"} → {r.new_plan || "—"}</span> },
    { key: "start_date", label: "Start", render: (r) => <span className="text-[11px] text-emerald-400">{formatDate(r.start_date)}</span> },
    { key: "end_date", label: "End", render: (r) => <span className={`text-[11px] ${r.end_date ? "text-rose-400" : "text-slate-600"}`}>{formatDate(r.end_date)}</span> },
    { key: "changed_by_username", label: "By", render: (r) => <span className={`text-[11px] font-medium ${r.changed_by_username === "System" ? "text-slate-500 italic" : "text-amber-400"}`}>{r.changed_by_username}</span> },
    {
      key: "note", label: "Note",
      render: (r) => {
        if (!r.note) return <span className="text-[10px] text-slate-600">—</span>;
        const isAuto = r.note.toLowerCase().includes("auto deactivated");
        const short = r.note.length > 50 ? r.note.slice(0, 50) + "…" : r.note;
        return (
          <div className="relative group inline-block">
            <span className={`text-[11px] cursor-help ${isAuto ? "text-red-400" : "text-slate-400"}`}>{short}</span>
            <div className="absolute left-0 top-full mt-1.5 w-60 rounded-xl bg-[#111827] border border-white/[0.08] text-white text-[11px] p-3 shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 leading-relaxed">
              {r.note}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <History size={18} className="text-amber-400" /> Subscription History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Audit trail of all subscription changes</p>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="text-slate-500" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="bg-white/[0.02] border border-white/[0.06] text-slate-300 text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500/30" />
        </div>
        <span className="text-[10px] text-slate-600">to</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="bg-white/[0.02] border border-white/[0.06] text-slate-300 text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500/30" />
        {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">Clear</button>}
      </div>

      {!loading && (
        <div className="flex gap-2 sm:gap-3 flex-wrap text-[11px]">
          <span className="px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04] text-slate-400">Total <strong className="text-white ml-1">{history.length}</strong></span>
          <span className="px-2.5 py-1 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400">Auto-expired <strong className="ml-1">{history.filter(h => h.note?.toLowerCase().includes("auto deactivated")).length}</strong></span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/5 border border-blue-500/10 text-blue-400">Payments <strong className="ml-1">{history.filter(h => h.note?.toLowerCase().includes("payment confirmed")).length}</strong></span>
        </div>
      )}

      {loading ? <LoadingSpinner /> : error ? <p className="text-red-400 text-center py-8">{error}</p> : <DataTable columns={columns} data={history} emptyMessage="No subscription history found" />}
    </div>
  );
}