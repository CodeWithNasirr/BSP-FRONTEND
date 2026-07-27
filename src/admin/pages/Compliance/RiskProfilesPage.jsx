// src/admin/pages/Compliance/RiskProfilesPage.jsx
// §Admin Investigation Console — customer risk/trust roster.
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { complianceApi } from "../../utils/complianceApi";
import { DataTable, LoadingSpinner } from "../../components/UIComponents";
import { RiskBandBadge, QualityBadge, fmtDate } from "./complianceHelpers";
import { Search, RefreshCw, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { toast } from "react-toastify";

const BANDS = ["", "healthy", "low", "medium", "high", "critical"];
const PAGE_SIZE = 25;

export default function RiskProfilesPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [band, setBand] = useState("");
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("-risk_score");
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, ordering });
    if (band) params.set("band", band);
    if (search.trim()) params.set("search", search.trim());
    complianceApi
      .get(`/compliance/risk-profiles/?${params.toString()}`)
      .then((r) => {
        // DRF pagination → {count, results}; guard against non-paginated fallback.
        setRows(r.data.results || r.data || []);
        setCount(r.data.count ?? (r.data.results?.length || 0));
      })
      .catch(() => toast.error("Failed to load risk profiles."))
      .finally(() => setLoading(false));
  }, [page, band, search, ordering]);

  useEffect(() => { load(); }, [load]);

  // Debounce search input → reset to page 1.
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); setSearch(searchInput); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const recompute = (id, e) => {
    e.stopPropagation();
    setRecomputing((s) => ({ ...s, [id]: true }));
    complianceApi
      .post(`/compliance/risk-profiles/${id}/recompute/`)
      .then(() => toast.success("Re-score queued."))
      .catch(() => toast.error("Could not queue re-score."))
      .finally(() => setRecomputing((s) => ({ ...s, [id]: false })));
  };

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const columns = [
    {
      key: "business_name", label: "Business",
      render: (r) => (
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-white truncate">{r.business_name || `#${r.client_account_id}`}</p>
          <p className="text-[10px] text-slate-600">ID {r.client_account_id}</p>
        </div>
      ),
    },
    {
      key: "risk_score", label: "Risk",
      render: (r) => <span className="font-mono font-bold text-white">{r.risk_score}</span>,
    },
    { key: "risk_band", label: "Band", render: (r) => <RiskBandBadge band={r.risk_band} /> },
    {
      key: "trust_score", label: "Trust",
      render: (r) => <span className="font-mono font-bold text-emerald-400">{r.trust_score}</span>,
    },
    { key: "quality_rating", label: "Quality", render: (r) => <QualityBadge rating={r.quality_rating} /> },
    { key: "computed_at", label: "Updated", render: (r) => <span className="text-slate-500 text-[11px]">{fmtDate(r.computed_at)}</span> },
    {
      key: "actions", label: "",
      render: (r) => (
        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={(e) => recompute(r.client_account_id, e)}
            disabled={recomputing[r.client_account_id]}
            title="Re-score"
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-white/[0.04] transition-colors disabled:opacity-40"
          >
            <RefreshCw size={14} className={recomputing[r.client_account_id] ? "animate-spin" : ""} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/compliance/customers/${r.client_account_id}`); }}
            title="Investigate"
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-white/[0.04] transition-colors"
          >
            <ArrowUpRight size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search business name or WABA ID…"
            className="w-full bg-[#0d1120] border border-white/[0.06] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/30"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={band}
            onChange={(e) => { setPage(1); setBand(e.target.value); }}
            className="bg-[#0d1120] border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-amber-400/30"
          >
            {BANDS.map((b) => <option key={b} value={b}>{b ? b[0].toUpperCase() + b.slice(1) : "All bands"}</option>)}
          </select>
          <select
            value={ordering}
            onChange={(e) => { setPage(1); setOrdering(e.target.value); }}
            className="bg-[#0d1120] border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-amber-400/30"
          >
            <option value="-risk_score">Highest risk</option>
            <option value="risk_score">Lowest risk</option>
            <option value="-trust_score">Highest trust</option>
            <option value="trust_score">Lowest trust</option>
            <option value="-computed_at">Recently scored</option>
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <DataTable columns={columns} data={rows} emptyMessage="No risk profiles match your filters." />
      )}

      {/* Pagination */}
      {count > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Page {page} of {totalPages} · {count} customers
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-[#0d1120] border border-white/[0.06] text-slate-400 disabled:opacity-30 hover:text-white transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg bg-[#0d1120] border border-white/[0.06] text-slate-400 disabled:opacity-30 hover:text-white transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
