// src/admin/pages/Compliance/AnalyticsPage.jsx
// §4 Embedded Signup Quality · §6 API Health · §5 Restriction Correlation.
import React, { useEffect, useState } from "react";
import { complianceApi } from "../../utils/complianceApi";
import { StatCard, LoadingSpinner } from "../../components/UIComponents";
import { SectionCard, fmtPct } from "./complianceHelpers";
import { LabelledDonut, HBarChart } from "./ComplianceCharts";
import {
  UserCheck, Timer, Activity, AlertOctagon, GitCompareArrows, TrendingUp,
  Gauge, Zap, ShieldAlert,
} from "lucide-react";

const ERROR_HEX = ["#f87171", "#fb923c", "#fbbf24", "#a78bfa", "#60a5fa", "#34d399"];

export default function AnalyticsPage() {
  const [signup, setSignup] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);
  const [correlation, setCorrelation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      complianceApi.get("/compliance/analytics/signup-quality/?days=30"),
      complianceApi.get("/compliance/analytics/api-health/?days=7"),
      complianceApi.get("/compliance/restriction-correlation/"),
    ])
      .then(([s, a, c]) => { setSignup(s.data); setApiHealth(a.data); setCorrelation(c.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  // Map error-type dict → colored dict for donut
  const errorColorMap = {};
  Object.keys(signup?.failure_error_types || {}).forEach((k, i) => { errorColorMap[k] = ERROR_HEX[i % ERROR_HEX.length]; });

  return (
    <div className="space-y-6">
      {/* ── Embedded Signup Quality ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <UserCheck size={16} className="text-amber-400" /> Embedded Signup Quality
          <span className="text-[11px] font-normal text-slate-600">· last {signup?.window_days ?? 30}d</span>
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Attempts" value={signup?.attempts ?? 0} icon={UserCheck} accent="blue" />
          <StatCard title="Success Rate" value={fmtPct(signup?.success_rate_pct)} subtitle={`${signup?.completed ?? 0} completed`} icon={TrendingUp} accent="emerald" />
          <StatCard title="Failure Rate" value={fmtPct(signup?.failure_rate_pct)} subtitle={`${signup?.failed ?? 0} failed`} icon={AlertOctagon} accent="red" />
          <StatCard title="Avg Onboarding" value={`${signup?.avg_onboarding_seconds ?? 0}s`} icon={Timer} accent="purple" />
        </div>
        {Object.keys(signup?.failure_error_types || {}).length > 0 && (
          <SectionCard title="Failure Reasons" subtitle="Error taxonomy across failed signups" icon={AlertOctagon}>
            <LabelledDonut distribution={signup.failure_error_types} colorMap={errorColorMap} />
          </SectionCard>
        )}
      </section>

      {/* ── API Health ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity size={16} className="text-amber-400" /> API Health Monitor
          <span className="text-[11px] font-normal text-slate-600">· last {apiHealth?.window_days ?? 7}d</span>
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Total Requests" value={(apiHealth?.total_requests ?? 0).toLocaleString()} icon={Activity} accent="blue" />
          <StatCard title="Error Rate" value={fmtPct(apiHealth?.error_rate_pct)} subtitle={`${apiHealth?.error_4xx ?? 0}×4xx · ${apiHealth?.error_5xx ?? 0}×5xx`} icon={AlertOctagon} accent="red" />
          <StatCard title="Retry Rate" value={fmtPct(apiHealth?.retry_rate_pct)} icon={Zap} accent="orange" />
          <StatCard title="Avg Latency" value={`${apiHealth?.avg_latency_ms ?? 0}ms`} icon={Gauge} accent="cyan" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SectionCard title="Top Failing Endpoints" subtitle="Where errors concentrate" icon={AlertOctagon}>
              <HBarChart data={apiHealth?.top_failing_endpoints || []} dataKey="failures" labelKey="endpoint" unit=" fails" />
            </SectionCard>
          </div>
          <SectionCard title="Error Signatures" subtitle="Permission / OAuth failures" icon={ShieldAlert}>
            <div className="space-y-2">
              <SigRow label="Permission errors" value={apiHealth?.permission_errors ?? 0} />
              <SigRow label="OAuth errors" value={apiHealth?.oauth_errors ?? 0} />
              <SigRow label="4xx client errors" value={apiHealth?.error_4xx ?? 0} />
              <SigRow label="5xx server errors" value={apiHealth?.error_5xx ?? 0} />
            </div>
          </SectionCard>
        </div>
      </section>

      {/* ── Restriction Correlation ── */}
      {correlation && (
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <GitCompareArrows size={16} className="text-amber-400" /> Restriction Correlation
            <span className="text-[11px] font-normal text-slate-600">· what restricted customers share</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="Total Customers" value={correlation.totals?.total ?? 0} icon={UserCheck} accent="blue" />
            <StatCard title="Restricted" value={correlation.totals?.restricted ?? 0} icon={ShieldAlert} accent="red" />
            <StatCard title="Healthy" value={correlation.totals?.healthy ?? 0} icon={TrendingUp} accent="emerald" />
            <StatCard title="Restriction Rate" value={fmtPct(correlation.totals?.restriction_rate_pct)} icon={Gauge} accent="orange" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CohortCard title="Restricted cohort" accent="red" stats={correlation.restricted_cohort} />
            <CohortCard title="Healthy cohort" accent="emerald" stats={correlation.healthy_cohort} />
          </div>

          <SectionCard title="Shared Characteristics" subtitle="Signals where restricted customers diverge most — tighten onboarding here" icon={GitCompareArrows}>
            {(correlation.shared_characteristics || []).length === 0 ? (
              <p className="text-[12px] text-slate-600 text-center py-6">Not enough data to correlate yet.</p>
            ) : (
              <div className="space-y-2">
                {correlation.shared_characteristics.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.015]">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-slate-200">{s.characteristic}</p>
                      <p className="text-[11px] text-slate-500">Restricted {s.restricted} vs Healthy {s.healthy}</p>
                    </div>
                    <span className={`text-[13px] font-mono font-bold shrink-0 ${s.delta >= 0 ? "text-red-400" : "text-emerald-400"}`}>
                      {s.delta >= 0 ? "+" : ""}{s.delta}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </section>
      )}
    </div>
  );
}

function SigRow({ label, value }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.015]">
      <span className="text-[12px] text-slate-400">{label}</span>
      <span className={`text-[13px] font-mono font-bold ${value > 0 ? "text-red-400" : "text-slate-500"}`}>{value}</span>
    </div>
  );
}

function CohortCard({ title, accent, stats }) {
  const border = accent === "red" ? "border-red-500/15" : "border-emerald-500/15";
  const s = stats || {};
  const rows = [
    ["Customers", s.count],
    ["Avg risk", s.avg_risk],
    ["Avg trust", s.avg_trust],
    ["Quality RED", fmtPct(s.quality_red_pct)],
    ["Template rejection", fmtPct(s.avg_template_rejection)],
    ["API error rate", fmtPct(s.avg_api_error_rate)],
  ];
  return (
    <div className={`bg-[#0d1120] border ${border} rounded-2xl p-4`}>
      <h3 className="text-sm font-bold text-white mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col p-2 rounded-lg bg-white/[0.015]">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
            <span className="text-sm font-bold text-white mt-0.5">{value ?? "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
