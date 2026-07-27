// src/admin/pages/Compliance/CustomerInvestigation.jsx
// §Restriction Investigation Timeline + §Customer Readiness Check + inline Guard.
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { complianceApi } from "../../utils/complianceApi";
import { LoadingSpinner } from "../../components/UIComponents";
import {
  SectionCard, ScoreRing, RiskBandBadge, QualityBadge, VerdictBadge,
  SeverityPill, fmtDate, titleCase,
} from "./complianceHelpers";
import {
  ArrowLeft, Building2, ShieldCheck, ListChecks, History, AlertTriangle,
  CheckCircle2, XCircle, TrendingDown, TrendingUp, Sparkles, Play, CircleDot,
} from "lucide-react";
import { toast } from "react-toastify";

const GUARD_ACTIONS = [
  ["campaign_created", "Campaign created"],
  ["broadcast_started", "Broadcast started"],
  ["bulk_import", "Bulk import"],
  ["template_created", "Template created"],
  ["phone_registered", "Phone registered"],
  ["waba_connected", "WABA connected"],
  ["token_refreshed", "Token refreshed"],
];

export default function CustomerInvestigation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("timeline");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      complianceApi.get(`/compliance/customers/${id}/`),
      complianceApi.get(`/compliance/customers/${id}/readiness/`),
    ])
      .then(([c, r]) => { setData(c.data); setReadiness(r.data); })
      .catch((e) => setError(e.response?.status === 404 ? "Customer not found." : "Failed to load customer."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-400 text-center py-8 text-sm">{error}</p>;
  if (!data) return null;

  const b = data.business || {};
  const p = data.risk_profile;

  return (
    <div className="space-y-4">
      <button onClick={() => navigate("/compliance/customers")}
        className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-white transition-colors">
        <ArrowLeft size={15} /> Back to customers
      </button>

      {/* Business header */}
      <SectionCard>
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-amber-400 shrink-0">
            <Building2 size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white">{b.business_name || `Customer #${b.id}`}</h2>
              {b.meta_blocked && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/15">
                  <AlertTriangle size={10} /> Restricted
                </span>
              )}
              {p && <RiskBandBadge band={p.risk_band} />}
              {p && <QualityBadge rating={p.quality_rating} />}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              WABA {b.waba_id || "—"} · Phone {b.phone_id || "—"} · BM {b.business_id || "—"}
            </p>
          </div>
          {p && (
            <div className="flex gap-4">
              <ScoreRing value={p.trust_score} invert label="Trust" />
              <ScoreRing value={p.risk_score} label="Risk" />
            </div>
          )}
        </div>
      </SectionCard>

      {/* Readiness + Guard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {readiness && <ReadinessPanel readiness={readiness} />}
        <GuardPanel clientId={id} />
      </div>

      {/* Risk factors + trust reasons + recommendations */}
      {p && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SectionCard title="Risk Factors" subtitle="What is driving the risk score" icon={AlertTriangle}>
            <FactorList items={p.risk_factors} kind="risk" empty="No risk factors recorded." />
          </SectionCard>
          <SectionCard title="Trust Signals" subtitle="Positive & negative trust drivers" icon={ShieldCheck}>
            <TrustList items={p.trust_reasons} />
          </SectionCard>
          <SectionCard title="Recommendations" subtitle="Suggested compliance actions" icon={Sparkles}>
            <RecoList items={p.recommendations} />
          </SectionCard>
        </div>
      )}

      {/* Audit tabs */}
      <SectionCard>
        <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-4">
          {[
            ["timeline", "Timeline", History, data.timeline?.length],
            ["alerts", "Alerts", AlertTriangle, data.alerts?.length],
            ["violations", "Violations", XCircle, data.policy_violations?.length],
            ["api", "API Logs", CircleDot, data.api_logs?.length],
            ["signup", "Signup", ListChecks, data.signup_logs?.length],
          ].map(([key, label, Icon, n]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-colors ${
                tab === key ? "bg-amber-400/10 text-amber-400" : "text-slate-500 hover:text-slate-300"
              }`}>
              <Icon size={13} /> {label}
              {n ? <span className="text-[10px] text-slate-600">({n})</span> : null}
            </button>
          ))}
        </div>

        {tab === "timeline" && <Timeline events={data.timeline} />}
        {tab === "alerts" && <AlertsList alerts={data.alerts} />}
        {tab === "violations" && <ViolationsList items={data.policy_violations} />}
        {tab === "api" && <ApiLogs logs={data.api_logs} />}
        {tab === "signup" && <SignupLogs logs={data.signup_logs} />}
      </SectionCard>
    </div>
  );
}

// ── Readiness ─────────────────────────────────────────────────────────
function ReadinessPanel({ readiness }) {
  return (
    <SectionCard
      title="Production Readiness"
      subtitle={readiness.ready ? "Cleared for production messaging" : "Blocking issues must be resolved"}
      icon={CheckCircle2}
      action={
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
          readiness.ready ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
        }`}>
          {readiness.ready ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {readiness.ready ? "Ready" : "Not Ready"} · {readiness.score}%
        </span>
      }
    >
      <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-hide">
        {(readiness.checks || []).map((c) => (
          <div key={c.key} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.015]">
            {c.ok
              ? <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              : <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[12px] font-medium text-slate-200">{c.label}</p>
                <SeverityPill severity={c.severity} />
              </div>
              {c.detail && <p className="text-[11px] text-slate-500 mt-0.5">{c.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ── Guard (inline evaluate) ───────────────────────────────────────────
function GuardPanel({ clientId }) {
  const [action, setAction] = useState("campaign_created");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const evaluate = () => {
    setBusy(true);
    complianceApi
      .post("/compliance/guard/evaluate/", { action, client_account_id: Number(clientId) })
      .then((r) => setResult(r.data))
      .catch(() => toast.error("Guard evaluation failed."))
      .finally(() => setBusy(false));
  };

  return (
    <SectionCard title="Compliance Guard" subtitle="Simulate an action against platform rules" icon={ShieldCheck}>
      <div className="flex gap-2">
        <select value={action} onChange={(e) => setAction(e.target.value)}
          className="flex-1 bg-[#0a0e17] border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-amber-400/30">
          {GUARD_ACTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button onClick={evaluate} disabled={busy}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-colors disabled:opacity-50">
          <Play size={14} /> {busy ? "…" : "Evaluate"}
        </button>
      </div>

      {result && (
        <div className={`mt-3 rounded-xl border p-3.5 ${
          result.verdict === "block" ? "bg-red-500/[0.06] border-red-500/20"
          : result.verdict === "warn" ? "bg-amber-500/[0.06] border-amber-500/20"
          : "bg-emerald-500/[0.06] border-emerald-500/20"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <VerdictBadge verdict={result.verdict} />
            <span className="text-[11px] text-slate-500 font-mono">
              trust {result.trust_score ?? "—"} · risk {result.risk_score ?? "—"}
            </span>
          </div>
          <ul className="space-y-1.5">
            {(result.reasons || []).map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-slate-300">
                <CircleDot size={11} className="text-slate-600 shrink-0 mt-1" />
                <span>{r.reason} {r.source && <span className="text-slate-600">· {r.source}</span>}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}

// ── Factor / reason / reco lists ──────────────────────────────────────
function FactorList({ items, empty }) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return <p className="text-[12px] text-slate-600">{empty}</p>;
  return (
    <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-hide">
      {list.map((f, i) => {
        const label = f.label || f.name || f.factor || String(f);
        const weight = f.weight ?? f.score ?? f.points;
        return (
          <div key={i} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.015]">
            <span className="text-[12px] text-slate-300 min-w-0 truncate">{label}</span>
            {weight !== undefined && (
              <span className="text-[11px] font-mono font-bold text-orange-400 shrink-0">+{weight}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TrustList({ items }) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return <p className="text-[12px] text-slate-600">No trust signals recorded.</p>;
  return (
    <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-hide">
      {list.map((r, i) => {
        const label = r.label || r.reason || String(r);
        const pts = r.points ?? r.weight ?? r.delta;
        const positive = (pts ?? 0) >= 0;
        return (
          <div key={i} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.015]">
            <div className="flex items-center gap-2 min-w-0">
              {positive ? <TrendingUp size={13} className="text-emerald-400 shrink-0" />
                        : <TrendingDown size={13} className="text-red-400 shrink-0" />}
              <span className="text-[12px] text-slate-300 truncate">{label}</span>
            </div>
            {pts !== undefined && (
              <span className={`text-[11px] font-mono font-bold shrink-0 ${positive ? "text-emerald-400" : "text-red-400"}`}>
                {positive ? "+" : ""}{pts}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RecoList({ items }) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return <p className="text-[12px] text-slate-600">No recommendations.</p>;
  return (
    <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-hide">
      {list.map((r, i) => {
        const text = r.text || r.message || r.title || String(r);
        return (
          <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.015]">
            <Sparkles size={12} className="text-amber-400 shrink-0 mt-0.5" />
            <span className="text-[12px] text-slate-300">{text}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Timeline & audit lists ────────────────────────────────────────────
function Timeline({ events }) {
  const list = events || [];
  if (!list.length) return <Empty msg="No timeline events." />;
  return (
    <div className="relative pl-5">
      <div className="absolute left-1.5 top-1 bottom-1 w-px bg-white/[0.06]" />
      <div className="space-y-3">
        {list.map((e) => (
          <div key={e.id} className="relative">
            <div className="absolute -left-[15px] top-1 w-2.5 h-2.5 rounded-full bg-amber-400/70 ring-4 ring-[#0d1120]" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-semibold text-white">{e.title || titleCase(e.event_type)}</span>
              <span className="text-[10px] text-slate-600">{fmtDate(e.occurred_at)}</span>
            </div>
            {e.detail && <p className="text-[11px] text-slate-500 mt-0.5">{e.detail}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertsList({ alerts }) {
  const list = alerts || [];
  if (!list.length) return <Empty msg="No alerts." />;
  return (
    <div className="space-y-2">
      {list.map((a) => (
        <div key={a.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.015]">
          <SeverityPill severity={a.severity} />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-slate-200">{a.title}</p>
            {a.message && <p className="text-[11px] text-slate-500 mt-0.5">{a.message}</p>}
            <p className="text-[10px] text-slate-600 mt-1">{titleCase(a.alert_type)} · {fmtDate(a.created_at)} · {a.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ViolationsList({ items }) {
  const list = items || [];
  if (!list.length) return <Empty msg="No policy violations." />;
  return (
    <div className="space-y-2">
      {list.map((v) => (
        <div key={v.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.015]">
          <SeverityPill severity={v.severity} />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-slate-200">{titleCase(v.category)}</p>
            {v.description && <p className="text-[11px] text-slate-500 mt-0.5">{v.description}</p>}
            <p className="text-[10px] text-slate-600 mt-1">{v.status} · {fmtDate(v.detected_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ApiLogs({ logs }) {
  const list = logs || [];
  if (!list.length) return <Empty msg="No API logs." />;
  return (
    <div className="space-y-1 max-h-96 overflow-y-auto scrollbar-hide font-mono text-[11px]">
      {list.map((l) => (
        <div key={l.id} className="flex items-center gap-2 p-1.5 rounded bg-white/[0.015]">
          <span className={`px-1.5 py-0.5 rounded font-bold ${
            l.http_status >= 500 ? "bg-red-500/10 text-red-400"
            : l.http_status >= 400 ? "bg-orange-500/10 text-orange-400"
            : "bg-emerald-500/10 text-emerald-400"
          }`}>{l.http_status || "—"}</span>
          <span className="text-slate-500">{l.method}</span>
          <span className="text-slate-300 truncate flex-1">{l.endpoint}</span>
          {l.latency_ms != null && <span className="text-slate-600">{l.latency_ms}ms</span>}
          {l.error_code && <span className="text-red-400">{l.error_code}</span>}
        </div>
      ))}
    </div>
  );
}

function SignupLogs({ logs }) {
  const list = logs || [];
  if (!list.length) return <Empty msg="No signup audit records." />;
  return (
    <div className="space-y-1.5 max-h-96 overflow-y-auto scrollbar-hide">
      {list.map((l) => (
        <div key={l.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.015]">
          {l.success ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                     : <XCircle size={14} className="text-red-400 shrink-0" />}
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-slate-200">{titleCase(l.step)}</p>
            {l.failure_reason && <p className="text-[11px] text-red-400/80">{l.failure_reason}</p>}
          </div>
          <span className="text-[10px] text-slate-600 shrink-0">{fmtDate(l.created_at)}</span>
        </div>
      ))}
    </div>
  );
}

function Empty({ msg }) {
  return <p className="text-[12px] text-slate-600 text-center py-6">{msg}</p>;
}
