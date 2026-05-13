import React, { useState, useEffect } from "react";
import { adminApi } from "../utils/api";
import { DataTable, LoadingSpinner } from "../components/UIComponents";
import { Calendar } from "lucide-react";

export default function RevenueLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      const res = await adminApi.get(`/analytics/revenue-logs/?${params.toString()}`);
      setLogs(res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const columns = [
    { key: "payment_date", label: "Date", render: (r) => <span className="text-[11px] text-slate-400 font-mono">{new Date(r.payment_date).toLocaleDateString()}</span> },
    { key: "client_username", label: "Client" },
    { key: "client_name", label: "Business" },
    { key: "amount", label: "Amount", render: (r) => <span className="text-amber-400 font-bold font-mono">₹{Number(r.amount).toLocaleString()}</span> },
    { key: "subscription_plan", label: "Plan", render: (r) => <span className="text-slate-400 text-xs">{r.subscription_plan || "—"}</span> },
    { key: "subadmin_username", label: "SubAdmin", render: (r) => <span className="text-slate-400 text-xs">{r.subadmin_username || "—"}</span> },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-white">Revenue Logs</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Detailed payment history</p>
      </div>
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-wider">From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-slate-300 text-sm focus:outline-none focus:border-amber-500/30" />
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-wider">To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-slate-300 text-sm focus:outline-none focus:border-amber-500/30" />
        </div>
        <button onClick={fetchLogs} className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 text-sm font-bold">Filter</button>
      </div>
      {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={logs} emptyMessage="No revenue logs found" />}
    </div>
  );
}