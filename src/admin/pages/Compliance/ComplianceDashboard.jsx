// src/admin/pages/Compliance/ComplianceDashboard.jsx
// §1 Platform Health Dashboard + §7 Reputation snapshot.
import React, { useEffect, useState } from "react";
import { complianceApi } from "../../utils/complianceApi";
import { StatCard, LoadingSpinner } from "../../components/UIComponents";
import { SectionCard, fmtPct } from "./complianceHelpers";
import { TrendAreaChart, RiskBandDonut, LabelledDonut } from "./ComplianceCharts";
import { QUALITY_META } from "./complianceHelpers";
import {
  Building2, Radio, ShieldX, Eye, UserCheck, Gauge, Activity, TrendingUp, PieChart,
} from "lucide-react";

const QUALITY_HEX = { GREEN: "#34d399", YELLOW: "#fbbf24", RED: "#f87171", UNKNOWN: "#64748b" };

export default function ComplianceDashboard() {
  const [data, setData] = useState(null);
  const [trend, setTrend] = useState(null);
  const [reputation, setReputation] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      complianceApi.get("/compliance/dashboard/"),
      complianceApi.get("/compliance/analytics/reputation/"),
    ])
      .then(([d, rep]) => { setData(d.data); setReputation(rep.data); })
      .catch(() => setError("Failed to load the compliance dashboard."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    complianceApi.get(`/compliance/restriction-trend/?days=${days}`)
      .then((r) => setTrend(r.data)).catch(() => setTrend({ series: [] }));
  }, [days]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-400 text-center py-8 text-sm">{error}</p>;
  if (!data) return null;

  const c = data.cards || {};

  return (
    <div className="space-y-5">
      {/* Portfolio stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Connected Businesses" value={c.total_connected_businesses ?? 0} icon={Building2} accent="blue" />
        <StatCard title="Connected WABAs" value={c.total_connected_wabas ?? 0} icon={Radio} accent="cyan" />
        <StatCard title="Restricted BMs" value={c.restricted_business_managers ?? 0} subtitle="Meta-blocked" icon={ShieldX} accent="red" />
        <StatCard title="Under Review" value={c.businesses_under_review ?? 0} subtitle="Last 30 days" icon={Eye} accent="orange" />
      </div>

      {/* Health stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Signup Success" value={fmtPct(c.embedded_signup_success_rate)} subtitle="Embedded signup · 30d" icon={UserCheck} accent="emerald" />
        <StatCard title="Avg Trust Score" value={c.customer_trust_score_average ?? 0} subtitle="Across all customers" icon={Gauge} accent="amber" />
        <StatCard title="API Success" value={fmtPct(c.api_success_rate)} subtitle={`${fmtPct(c.api_error_rate)} errors · 7d`} icon={Activity} accent="emerald" />
        <StatCard title="Verification Rate" value={fmtPct(c.business_verification_rate)} subtitle="Healthy-band share" icon={TrendingUp} accent="purple" />
      </div>

      {/* Restriction trend */}
      <SectionCard
        title="Restriction Trend"
        subtitle="New restriction events over time"
        icon={TrendingUp}
        action={
          <div className="flex gap-1 bg-white/[0.03] rounded-lg p-0.5">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  days === d ? "bg-amber-400/10 text-amber-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        }
      >
        <TrendAreaChart data={trend?.series || []} />
      </SectionCard>

      {/* Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Risk Band Distribution" subtitle="Customers by computed risk band" icon={PieChart}>
          <RiskBandDonut distribution={data.risk_band_distribution} />
        </SectionCard>
        <SectionCard title="WABA Quality Ratings" subtitle="Meta messaging quality across WABAs" icon={PieChart}>
          <LabelledDonut distribution={data.quality_rating_distribution} colorMap={QUALITY_HEX} />
        </SectionCard>
      </div>

      {/* Reputation */}
      {reputation && (
        <SectionCard title="Platform Reputation" subtitle="Portfolio-wide trust & restriction posture" icon={Gauge}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniStat label="Avg Trust" value={reputation.avg_trust_score} />
            <MiniStat label="Avg Risk" value={reputation.avg_risk_score} />
            <MiniStat label="Restriction Rate" value={fmtPct(reputation.restriction_rate_pct)} />
            <MiniStat label="Appeal Success" value={reputation.appeal_success_rate_pct === null ? "—" : fmtPct(reputation.appeal_success_rate_pct)} />
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-3">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-extrabold text-white mt-1">{value}</p>
    </div>
  );
}
