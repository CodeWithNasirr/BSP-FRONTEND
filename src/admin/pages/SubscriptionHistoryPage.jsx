// src/pages/SubscriptionHistoryPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { adminApi } from "../utils/api";
import { StatusBadge, DataTable, LoadingSpinner } from "../components/UIComponents";
import { History, Calendar } from "lucide-react";

export default function SubscriptionHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const res = await adminApi.get("/workflow/history/", { params });

      setHistory(res.data);
    } catch {
      setError("Failed to load subscription history.");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const columns = [
    {
      key: "created_at",
      label: "Date",
      render: (r) => (
        <span className="text-xs text-slate-400">
          {new Date(r.created_at).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "client_username",
      label: "Client",
      render: (r) => (
        <div>
          <p className="text-sm text-white">{r.client_username}</p>
          <p className="text-[10px] text-slate-600">{r.client_business}</p>
        </div>
      ),
    },
    {
      key: "old_status",
      label: "Old Status",
      render: (r) => (
        r.old_status ? <StatusBadge status={r.old_status} /> : <span className="text-xs text-slate-600">—</span>
      ),
    },
    {
      key: "new_status",
      label: "New Status",
      render: (r) => <StatusBadge status={r.new_status} />,
    },
    {
      key: "plan_change",
      label: "Plan Change",
      render: (r) => (
        <span className="text-xs text-slate-400">
          {r.old_plan || "—"} → {r.new_plan || "—"}
        </span>
      ),
    },
    {
      key: "start_date",
      label: "Plan Start",
      render: (r) => (
        <span className="text-xs text-emerald-400">
          {formatDate(r.start_date)}
        </span>
      ),
    },
    {
      key: "end_date",
      label: "Plan End",
      render: (r) => (
        <span className={`text-xs ${r.end_date ? "text-rose-400" : "text-slate-600"}`}>
          {formatDate(r.end_date)}
        </span>
      ),
    },
    {
      key: "changed_by_username",
      label: "Changed By",
      render: (r) => (
        <span
          className={`text-xs font-medium ${
            r.changed_by_username === "System"
              ? "text-slate-500 italic"
              : "text-amber-400"
          }`}
        >
          {r.changed_by_username}
        </span>
      ),
    },
    {
  key: "note",
  label: "Note",
  render: (r) => {
    if (!r.note)
      return <span className="text-xs text-slate-600">—</span>;

    const isAutoDeact = r.note
      .toLowerCase()
      .includes("auto deactivated");

    const shortText =
      r.note.length > 60 ? r.note.slice(0, 60) + "..." : r.note;

    return (
      <div className="relative group inline-block">
        {/* Short text */}
        <span
          className={`text-xs cursor-pointer ${
            isAutoDeact ? "text-red-400" : "text-slate-400"
          }`}
        >
          {shortText}
        </span>

        {/* Hover tooltip */}
        <div
          className="
            absolute left-0 top-full mt-2 w-72
            rounded-md bg-slate-800 text-white text-xs
            p-2 shadow-lg
            opacity-0 translate-y-1
            pointer-events-none
            transition-all duration-200 ease-out
            group-hover:opacity-100
            group-hover:translate-y-0
            z-50
          "
        >
          {r.note}
        </div>
      </div>
    );
  },
},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <History size={20} className="text-amber-400" />
          Subscription History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Audit trail of all subscription changes, activations, and payments
        </p>
      </div>

      {/* Date filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-500" />
          <span className="text-xs text-slate-500">From</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-slate-900/50 border border-slate-800/50 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">To</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-slate-900/50 border border-slate-800/50 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Stats */}
      {!loading && (
        <div className="flex gap-4 text-xs text-slate-500">
          <span>
            Total records: <strong className="text-white">{history.length}</strong>
          </span>
          <span>
            Auto-expired:{" "}
            <strong className="text-red-400">
              {history.filter((h) => h.note?.toLowerCase().includes("auto deactivated")).length}
            </strong>
          </span>
          <span>
            Payments:{" "}
            <strong className="text-blue-400">
              {history.filter((h) => h.note?.toLowerCase().includes("payment confirmed")).length}
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
          data={history}
          emptyMessage="No subscription history found"
        />
      )}
    </div>
  );
}