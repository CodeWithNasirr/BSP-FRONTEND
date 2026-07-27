// src/admin/pages/Compliance/GuardConsole.jsx
// §Compliance Guard — evaluate any action for any customer + recent decision log.
import React, { useEffect, useState, useCallback } from "react";
import { complianceApi } from "../../utils/complianceApi";
import { DataTable, LoadingSpinner } from "../../components/UIComponents";
import { SectionCard, VerdictBadge, fmtDate, titleCase, ScoreRing } from "./complianceHelpers";
import { ShieldCheck, Play, CircleDot, History } from "lucide-react";
import { toast } from "react-toastify";

const GUARD_ACTIONS = [
  ["campaign_created", "Campaign created"],
  ["broadcast_started", "Broadcast started"],
  ["bulk_import", "Bulk import"],
  ["template_created", "Template created"],
  ["phone_registered", "Phone registered"],
  ["waba_connected", "WABA connected"],
  ["signup_completed", "Signup completed"],
  ["token_refreshed", "Token refreshed"],
  ["system_user_assigned", "System User assigned"],
];

export default function GuardConsole() {
  const [clientId, setClientId] = useState("");
  const [action, setAction] = useState("campaign_created");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const [decisions, setDecisions] = useState([]);
  const [verdictFilter, setVerdictFilter] = useState("");
  const [loadingLog, setLoadingLog] = useState(true);

  const loadLog = useCallback(() => {
    setLoadingLog(true);
    const params = new URLSearchParams({ ordering: "-created_at" });
    if (verdictFilter) params.set("verdict", verdictFilter);
    complianceApi
      .get(`/compliance/guard-decisions/?${params.toString()}`)
      .then((r) => setDecisions(r.data.results || r.data || []))
      .catch(() => toast.error("Failed to load guard decisions."))
      .finally(() => setLoadingLog(false));
  }, [verdictFilter]);

  useEffect(() => { loadLog(); }, [loadLog]);

  const evaluate = () => {
    if (!clientId) return toast.warn("Enter a customer ID.");
    setBusy(true);
    complianceApi
      .post("/compliance/guard/evaluate/", { action, client_account_id: Number(clientId) })
      .then((r) => { setResult(r.data); loadLog(); })
      .catch((e) => {
        setResult(null);
        toast.error(e.response?.status === 404 ? "Customer not found." : "Evaluation failed.");
      })
      .finally(() => setBusy(false));
  };

  const columns = [
    { key: "client_account_id", label: "Customer", render: (r) => <span className="font-mono text-slate-300">#{r.client_account_id}</span> },
    { key: "action", label: "Action", render: (r) => <span className="text-slate-300">{titleCase(r.action)}</span> },
    { key: "verdict", label: "Verdict", render: (r) => <VerdictBadge verdict={r.verdict} /> },
    {
      key: "reasons", label: "Top Reason",
      render: (r) => <span className="text-[12px] text-slate-500 truncate block max-w-xs">{r.reasons?.[0]?.reason || "—"}</span>,
    },
    { key: "created_at", label: "When", render: (r) => <span className="text-[11px] text-slate-500">{fmtDate(r.created_at)}</span> },
  ];

  return (
    <div className="space-y-4">
      <SectionCard
        title="Evaluate an Action"
        subtitle="Run the guard against our configurable platform rules — Allow / Warn / Block"
        icon={ShieldCheck}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={clientId}
            onChange={(e) => setClientId(e.target.value.replace(/\D/g, ""))}
            placeholder="Customer ID"
            className="sm:w-40 bg-[#0a0e17] border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/30"
          />
          <select value={action} onChange={(e) => setAction(e.target.value)}
            className="flex-1 bg-[#0a0e17] border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-amber-400/30">
            {GUARD_ACTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button onClick={evaluate} disabled={busy}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-colors disabled:opacity-50">
            <Play size={15} /> {busy ? "Evaluating…" : "Evaluate"}
          </button>
        </div>

        {result && (
          <div className={`mt-4 rounded-xl border p-4 ${
            result.verdict === "block" ? "bg-red-500/[0.06] border-red-500/20"
            : result.verdict === "warn" ? "bg-amber-500/[0.06] border-amber-500/20"
            : "bg-emerald-500/[0.06] border-emerald-500/20"
          }`}>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex gap-3">
                <ScoreRing value={result.trust_score ?? 0} invert label="Trust" size={64} stroke={6} />
                <ScoreRing value={result.risk_score ?? 0} label="Risk" size={64} stroke={6} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <VerdictBadge verdict={result.verdict} />
                  <span className="text-[12px] text-slate-500">{titleCase(action)}</span>
                </div>
                <ul className="space-y-1">
                  {(result.reasons || []).map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-slate-300">
                      <CircleDot size={11} className="text-slate-600 shrink-0 mt-1" />
                      <span>{r.reason}{r.source && <span className="text-slate-600"> · {r.source}</span>}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Recent Guard Decisions"
        subtitle="Every evaluation is logged for audit"
        icon={History}
        action={
          <select value={verdictFilter} onChange={(e) => setVerdictFilter(e.target.value)}
            className="bg-[#0a0e17] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-[12px] text-slate-300 focus:outline-none focus:border-amber-400/30">
            <option value="">All verdicts</option>
            <option value="allow">Allow</option>
            <option value="warn">Warn</option>
            <option value="block">Block</option>
          </select>
        }
      >
        {loadingLog ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={decisions} emptyMessage="No guard decisions logged yet." />
        )}
      </SectionCard>
    </div>
  );
}
