// src/admin/pages/WebhookDashboardPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { adminApi } from "../utils/api";
import {
  Radio, AlertTriangle, CheckCircle2, RefreshCw,
  Inbox, ShieldAlert, Zap, TrendingDown, Activity,
  ChevronDown, ChevronUp, Trash2, RotateCcw, Clock,
  MousePointerClick, BarChart2, Megaphone,
} from "lucide-react";
import { LoadingSpinner } from "../components/UIComponents";

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt       = (n) => (n ?? 0).toLocaleString();
const pct       = (n) => ((n ?? 0).toFixed(1)) + "%";
const shortDate = (d) => (d ?? "").slice(5); // "2026-02-22" → "02-22"

function lossColor(v) {
  if (v > 10) return "#ef4444";
  if (v > 2)  return "#f59e0b";
  return "#22c55e";
}
function lossBg(v) {
  if (v > 10) return { bg: "#2e0a0a", border: "#dc2626" };
  if (v > 2)  return { bg: "#2e2008", border: "#d97706" };
  return       { bg: "#0d2e1c", border: "#16a34a" };
}

const HEALTH_CONFIG = {
  healthy:  { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", label: "Healthy" },
  degraded: { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20",   label: "Degraded" },
  critical: { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20",     label: "Critical" },
  unknown:  { bg: "bg-slate-500/10",   text: "text-slate-400",   border: "border-slate-500/20",   label: "Unknown"  },
};

// ── sub-components ────────────────────────────────────────────────────────────

function HealthBadge({ health }) {
  const c = HEALTH_CONFIG[health] || HEALTH_CONFIG.unknown;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  );
}

function MetricCard({ label, value, sub, warning, accent = "amber", icon: Icon }) {
  const accentMap = {
    amber:   { top: "border-t-amber-400",   val: "text-amber-400",   icon: "text-amber-400/40"   },
    emerald: { top: "border-t-emerald-500", val: "text-emerald-400", icon: "text-emerald-400/40" },
    red:     { top: "border-t-red-500",     val: "text-red-400",     icon: "text-red-400/40"     },
    slate:   { top: "border-t-slate-600",   val: "text-slate-400",   icon: "text-slate-400/40"   },
    cyan:    { top: "border-t-cyan-500",    val: "text-cyan-400",    icon: "text-cyan-400/40"    },
  };
  const colors = accentMap[warning ? "red" : accent] || accentMap.amber;
  return (
    <div className={`bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 flex-1 min-w-[130px] border-t-2 ${colors.top} transition-all hover:border-slate-700/50 relative overflow-hidden`}>
      {Icon && (
        <Icon size={40} className={`absolute -bottom-2 -right-2 ${colors.icon}`} strokeWidth={1} />
      )}
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-2xl font-extrabold font-mono leading-none ${warning ? "text-red-400" : "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-1.5">{sub}</p>}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs shadow-2xl">
      <p className="text-slate-400 font-semibold mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-bold font-mono">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function DLQFlowStep({ step, label, desc }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-6 h-6 rounded-md bg-amber-400/20 border border-amber-400/30 text-amber-400 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
        {step}
      </div>
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

// Minimal sparkline for CTWA per-client
function Sparkline({ data, dataKey, color }) {
  if (!data?.length) return <span className="text-slate-600 text-xs">—</span>;
  return (
    <div className="w-24 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0}   />
            </linearGradient>
          </defs>
          <Area
            type="monotone" dataKey={dataKey}
            stroke={color} strokeWidth={1.5}
            fill={`url(#sg-${color.replace("#","")})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function WebhookDashboardPage() {
  const [view, setView]             = useState("overview");
  const [days, setDays]             = useState(7);
  const [timeline, setTimeline]     = useState([]);
  const [clients, setClients]       = useState([]);
  const [ctwaClients, setCtwaClients] = useState([]);
  const [totalCtwa, setTotalCtwa]   = useState(0);
  const [dlq, setDlq]               = useState({ total: 0, items: [] });
  const [selected, setSelected]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [ctwaLoading, setCtwaLoading] = useState(false);
  const [actionMsg, setActionMsg]   = useState(null);
  const [replayLoading, setReplayLoading] = useState(false);
  const [clearLoading, setClearLoading]   = useState(null);

  // ── fetch ────────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, dlqRes] = await Promise.all([
        adminApi.get(`/webhook-analytics/?days=${days}`),
        adminApi.get("/webhook-analytics/dlq/"),
      ]);
      setTimeline(analyticsRes.data.timeline   ?? []);
      setClients(analyticsRes.data.clients     ?? []);
      setTotalCtwa(analyticsRes.data.total_ctwa ?? 0);
      setDlq({
        total: dlqRes.data.total ?? 0,
        items: dlqRes.data.items ?? [],
      });
    } catch (err) {
      console.error("Webhook analytics fetch failed:", err);
      flash("error", "Failed to load webhook analytics.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  const fetchCtwa = useCallback(async () => {
    setCtwaLoading(true);
    try {
      const res = await adminApi.get(`/webhook-analytics/ctwa/?days=${days}`);
      setCtwaClients(res.data.clients ?? []);
    } catch (err) {
      console.error("CTWA fetch failed:", err);
      flash("error", "Failed to load CTWA data.");
    } finally {
      setCtwaLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Fetch CTWA data when user switches to that tab
  useEffect(() => {
    if (view === "ctwa") fetchCtwa();
  }, [view, fetchCtwa]);

  // ── actions ──────────────────────────────────────────────────────────────

  const flash = (type, text) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 5000);
  };

  const clearInactiveCache = async (clientId, phoneId) => {
    setClearLoading(clientId);
    try {
      await adminApi.post("/webhook-analytics/clear-inactive-cache/", { phone_id: phoneId });
      setClients(prev =>
        prev.map(c =>
          c.client_id === clientId
            ? { ...c, inactive_phone_cached: false, health: "healthy" }
            : c
        )
      );
      flash("success", `✓ Cleared inactive_phone cache for phone_id ${phoneId}`);
    } catch (err) {
      flash("error", err.response?.data?.error || "Failed to clear cache.");
    } finally {
      setClearLoading(null);
    }
  };

  const replayDLQ = async () => {
    setReplayLoading(true);
    try {
      const res = await adminApi.post("/webhook-analytics/replay-dlq/", { limit: 100 });
      const replayed = res.data.replayed ?? dlq.total;
      setDlq({ total: 0, items: [] });
      flash("success", `✓ Replayed ${replayed} failed webhook(s) from DLQ`);
    } catch (err) {
      flash("error", err.response?.data?.error || "DLQ replay failed.");
    } finally {
      setReplayLoading(false);
    }
  };

  // ── derived totals ────────────────────────────────────────────────────────

  const totals = timeline.reduce(
    (acc, r) => ({
      received:  acc.received  + (r.received         ?? 0),
      enqueued:  acc.enqueued  + (r.enqueued          ?? 0),
      missed:    acc.missed    + (r.missed            ?? 0),
      inactive:  acc.inactive  + (r.inactive_dropped  ?? 0),
      failed:    acc.failed    + (r.failed            ?? 0),
      dedup:     acc.dedup     + (r.dedup_dropped      ?? 0),
      ctwa:      acc.ctwa      + (r.ctwa_received      ?? 0),
    }),
    { received: 0, enqueued: 0, missed: 0, inactive: 0, failed: 0, dedup: 0, ctwa: 0 }
  );

  const overallLoss = totals.received
    ? parseFloat(((totals.missed / totals.received) * 100).toFixed(1))
    : 0;

  const inactiveCached  = clients.filter(c => c.inactive_phone_cached);
  const criticalClients = clients.filter(c => c.health === "critical");
  const chartData       = timeline.map(r => ({ ...r, date: shortDate(r.date) }));

  // Clients with CTWA activity (from health data)
  const ctwaActiveClients = clients.filter(c => (c.ctwa_total_7d ?? 0) > 0);

  // ── render ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
            <Radio size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Webhook Analytics</h1>
            <p className="text-sm text-slate-500 mt-0.5">Real-time pipeline health · loss tracking · CTWA monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {inactiveCached.length > 0 && (
            <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg">
              <ShieldAlert size={12} />
              {inactiveCached.length} cache poisoned
            </div>
          )}
          {dlq.total > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-lg">
              <Inbox size={12} />
              DLQ: {dlq.total} pending
            </div>
          )}
          {totals.ctwa > 0 && (
            <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold px-3 py-1.5 rounded-lg">
              <MousePointerClick size={12} />
              {fmt(totals.ctwa)} CTWA
            </div>
          )}

          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="bg-slate-900/50 border border-slate-800/50 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500/50"
          >
            {[7, 14, 30].map(d => (
              <option key={d} value={d}>Last {d} days</option>
            ))}
          </select>

          <button
            onClick={fetchAll}
            className="flex items-center gap-1.5 bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white text-sm rounded-xl px-3 py-2 transition-all"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Flash Message ── */}
      {actionMsg && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
          actionMsg.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {actionMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {actionMsg.text}
        </div>
      )}

      {/* ── Tab Nav ── */}
      <div className="flex gap-1 border-b border-slate-800/50 overflow-x-auto">
        {[
          { id: "overview", label: "Overview",          icon: Activity },
          { id: "clients",  label: "Client Health",     icon: Zap },
          { id: "ctwa",     label: "CTWA Ads",          icon: MousePointerClick },
          { id: "dlq",      label: "Dead Letter Queue", icon: Inbox },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
              view === id
                ? "text-amber-400 border-amber-400"
                : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            <Icon size={14} />
            {label}
            {id === "dlq" && dlq.total > 0 && (
              <span className="ml-1 bg-amber-400/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {dlq.total}
              </span>
            )}
            {id === "clients" && inactiveCached.length > 0 && (
              <span className="ml-1 bg-red-400/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {inactiveCached.length}
              </span>
            )}
            {id === "ctwa" && totals.ctwa > 0 && (
              <span className="ml-1 bg-cyan-400/20 text-cyan-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {fmt(totals.ctwa)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════ OVERVIEW TAB ══════════════════════ */}
      {view === "overview" && (
        <div className="space-y-6">

          {/* Stat cards — now 6 including CTWA */}
          <div className="flex gap-4 flex-wrap">
            <MetricCard
              label="Total Received"
              value={fmt(totals.received)}
              sub={`Last ${days} days`}
              accent="amber"
              icon={Activity}
            />
            <MetricCard
              label="Successfully Enqueued"
              value={fmt(totals.enqueued)}
              sub="Reached Celery"
              accent="emerald"
              icon={CheckCircle2}
            />
            <MetricCard
              label="Missed Webhooks"
              value={fmt(totals.missed)}
              sub={`${pct(overallLoss)} loss rate`}
              warning={overallLoss > 5}
              icon={TrendingDown}
            />
            <MetricCard
              label="CTWA Messages"
              value={fmt(totals.ctwa)}
              sub={`${ctwaActiveClients.length} active ad clients`}
              accent="cyan"
              icon={MousePointerClick}
            />
            <MetricCard
              label="Inactive Cache Drops"
              value={fmt(totals.inactive)}
              sub="Bug #1 victims"
              warning={totals.inactive > 0}
              icon={ShieldAlert}
            />
            <MetricCard
              label="Enqueue Failures"
              value={fmt(totals.failed)}
              sub="Broker errors → DLQ"
              warning={totals.failed > 0}
              icon={AlertTriangle}
            />
          </div>

          {/* Loss rate chart + CTWA overlay */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-white">Webhook Loss Rate + CTWA Volume</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Loss % left axis · CTWA count shown as teal area
                </p>
              </div>
              <div
                className="px-4 py-1.5 rounded-lg text-lg font-extrabold font-mono border"
                style={{
                  color: lossColor(overallLoss),
                  background: lossBg(overallLoss).bg,
                  borderColor: lossBg(overallLoss).border,
                }}
              >
                {pct(overallLoss)}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="ctwaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis
                  yAxisId="loss"
                  stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }}
                  unit="%" domain={[0, "auto"]}
                />
                <YAxis
                  yAxisId="ctwa"
                  orientation="right"
                  stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  yAxisId="ctwa"
                  type="monotone" dataKey="ctwa_received" name="CTWA"
                  stroke="#06b6d4" strokeWidth={1.5}
                  fill="url(#ctwaGrad)"
                  dot={false}
                />
                <Line
                  yAxisId="loss"
                  type="monotone" dataKey="loss_pct" name="Loss %"
                  stroke="#ef4444" strokeWidth={2.5}
                  dot={{ fill: "#ef4444", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#ef4444" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Volume + breakdown side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Received vs Enqueued</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="received" name="Received" fill="#1d4ed8" radius={[3,3,0,0]} />
                  <Bar dataKey="enqueued" name="Enqueued" fill="#22c55e" radius={[3,3,0,0]} />
                  <Bar dataKey="ctwa_received" name="CTWA" fill="#06b6d4" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Drop Breakdown by Cause</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="dedup_dropped"    name="Dedup (OK)"        fill="#475569" stackId="a" />
                  <Bar dataKey="inactive_dropped" name="Inactive Cache"    fill="#ef4444" stackId="a" />
                  <Bar dataKey="failed"           name="Enqueue Failed"    fill="#f59e0b" stackId="a" />
                  <Bar dataKey="missed"           name="Unaccounted"       fill="#7c3aed" stackId="a" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bug #1 alert */}
          {(inactiveCached.length > 0 || totals.inactive > 0) && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <ShieldAlert size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-400 mb-1">
                    Bug #1 Detected — inactive_phone cache poisoning
                  </p>
                  <p className="text-xs text-red-400/70 leading-relaxed">
                    <strong>{fmt(totals.inactive)}</strong> webhook(s) were silently dropped because the{" "}
                    <code className="bg-red-900/40 px-1.5 py-0.5 rounded text-red-300">
                      inactive_phone:{"{phone_id}"}
                    </code>{" "}
                    Redis key was set with <code className="bg-red-900/40 px-1.5 py-0.5 rounded text-red-300">timeout=None</code>.
                    Meta received 200 responses but nothing was processed.{" "}
                    Switch to the <strong>Client Health</strong> tab to clear affected caches.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════ CLIENTS TAB ══════════════════════ */}
      {view === "clients" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Per-Client Webhook Health</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sorted by loss rate · 🔴 = inactive_phone cache bug active · 🔵 = CTWA active
              </p>
            </div>
            <div className="flex gap-3 text-xs text-slate-500">
              <span>Total: <strong className="text-white">{clients.length}</strong></span>
              <span>Critical: <strong className="text-red-400">{criticalClients.length}</strong></span>
              <span>Cache issues: <strong className="text-red-400">{inactiveCached.length}</strong></span>
              <span>CTWA active: <strong className="text-cyan-400">{ctwaActiveClients.length}</strong></span>
            </div>
          </div>

          {clients.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-12 text-center">
              <Activity size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No client data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map(client => {
                const isOpen  = selected?.client_id === client.client_id;
                const hasCTWA = (client.ctwa_total_7d ?? 0) > 0;
                return (
                  <div
                    key={client.client_id}
                    className={`bg-slate-900/50 rounded-2xl border transition-all overflow-hidden ${
                      client.inactive_phone_cached
                        ? "border-red-500/30"
                        : client.health === "degraded"
                        ? "border-amber-500/20"
                        : "border-slate-800/50"
                    }`}
                  >
                    <div
                      className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-800/30 transition-colors flex-wrap"
                      onClick={() => setSelected(isOpen ? null : client)}
                    >
                      <div className="flex-1 min-w-[180px]">
                        <p className="text-sm font-semibold text-white">
                          {client.inactive_phone_cached && <span className="text-red-400 mr-1">🔴</span>}
                          {hasCTWA && <span className="text-cyan-400 mr-1">🔵</span>}
                          {client.username}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                          phone_id: {client.phone_id}
                        </p>
                      </div>

                      <HealthBadge health={client.health} />

                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">7d loss</p>
                        <p className="text-xl font-extrabold font-mono" style={{ color: lossColor(client.loss_pct_7d) }}>
                          {pct(client.loss_pct_7d)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Received</p>
                        <p className="text-base font-bold text-white font-mono">{fmt(client.totals?.received)}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Missed</p>
                        <p className={`text-base font-bold font-mono ${(client.totals?.missed ?? 0) > 0 ? "text-red-400" : "text-emerald-400"}`}>
                          {fmt(client.totals?.missed)}
                        </p>
                      </div>

                      {hasCTWA && (
                        <div className="text-right">
                          <p className="text-[10px] text-cyan-500/70 uppercase tracking-wide">CTWA</p>
                          <p className="text-base font-bold font-mono text-cyan-400">{fmt(client.ctwa_total_7d)}</p>
                        </div>
                      )}

                      {client.inactive_phone_cached && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            clearInactiveCache(client.client_id, client.phone_id);
                          }}
                          disabled={clearLoading === client.client_id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-50 transition-all"
                        >
                          {clearLoading === client.client_id
                            ? <RefreshCw size={12} className="animate-spin" />
                            : <Trash2 size={12} />}
                          Fix Cache
                        </button>
                      )}

                      <div className="text-slate-600">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {/* Expanded drill-down */}
                    {isOpen && (
                      <div className="px-5 pb-5 pt-0 border-t border-slate-800/50">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                          {[
                            ["Received", client.totals?.received, "text-white"],
                            ["Enqueued", client.totals?.enqueued, "text-emerald-400"],
                            ["Missed",   client.totals?.missed,   (client.totals?.missed ?? 0) > 0 ? "text-red-400" : "text-emerald-400"],
                            ["CTWA",     client.totals?.ctwa,     "text-cyan-400"],
                          ].map(([k, v, cls]) => (
                            <div key={k} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{k}</p>
                              <p className={`text-2xl font-extrabold font-mono ${cls}`}>{fmt(v)}</p>
                            </div>
                          ))}
                        </div>

                        {client.inactive_phone_cached && (
                          <div className="mt-3 text-xs text-red-400/70 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
                            ℹ️ Click <strong>Fix Cache</strong> to delete the{" "}
                            <code className="bg-red-900/30 px-1 rounded">inactive_phone:{client.phone_id}</code>{" "}
                            Redis key. Confirm subscription is <strong>ACTIVE</strong> in DB before clearing.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════ CTWA TAB ══════════════════════ */}
      {view === "ctwa" && (
        <div className="space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <MousePointerClick size={16} className="text-cyan-400" />
                Click-To-WhatsApp Ads Monitoring
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Tracks the <strong className="text-slate-300">first message</strong> sent by users who clicked a WhatsApp ad (CTWA).
                Meta attaches a <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300 text-[11px]">referral.ctwa_clid</code> field to these messages.
                If a client's CTWA count is 0 but ads are running, the first message is being dropped — check their health tab.
              </p>
            </div>
            <button
              onClick={fetchCtwa}
              className="flex items-center gap-1.5 bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white text-sm rounded-xl px-3 py-2 transition-all"
            >
              <RefreshCw size={14} className={ctwaLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* CTWA summary cards */}
          <div className="flex gap-4 flex-wrap">
            <MetricCard
              label="Total CTWA Messages"
              value={fmt(totals.ctwa)}
              sub={`Last ${days} days`}
              accent="cyan"
              icon={MousePointerClick}
            />
            <MetricCard
              label="Clients with CTWA"
              value={fmt(ctwaActiveClients.length)}
              sub="Running ad campaigns"
              accent="amber"
              icon={Megaphone}
            />
            <MetricCard
              label="CTWA of Total Traffic"
              value={totals.received > 0 ? pct((totals.ctwa / totals.received) * 100) : "0.0%"}
              sub="Ads-driven share"
              accent="emerald"
              icon={BarChart2}
            />
          </div>

          {/* CTWA volume chart */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Daily CTWA Volume</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="ctwaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone" dataKey="ctwa_received" name="CTWA Messages"
                  stroke="#06b6d4" strokeWidth={2.5}
                  fill="url(#ctwaFill)"
                  dot={{ fill: "#06b6d4", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#06b6d4" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Per-client CTWA breakdown */}
          {ctwaLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : ctwaClients.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-12 text-center">
              <MousePointerClick size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-semibold">No CTWA activity in the last {days} days</p>
              <p className="text-slate-500 text-sm mt-1">
                CTWA messages appear here when users click WhatsApp ads and send the first message.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Per-Client Breakdown</h3>
                <p className="text-xs text-slate-500">{ctwaClients.length} clients with ad traffic</p>
              </div>

              {/* Table header */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                <div className="col-span-3">Client</div>
                <div className="col-span-2 text-right">CTWA Total</div>
                <div className="col-span-2 text-right">All Received</div>
                <div className="col-span-2 text-right">CTWA Rate</div>
                <div className="col-span-3">Daily Trend</div>
              </div>

              {ctwaClients.map(client => (
                <div
                  key={client.client_id}
                  className="bg-slate-900/50 border border-cyan-500/10 rounded-2xl px-5 py-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center hover:border-cyan-500/20 transition-all"
                >
                  {/* Identity */}
                  <div className="sm:col-span-3">
                    <p className="text-sm font-semibold text-white">{client.username}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                      {client.phone_id}
                    </p>
                  </div>

                  {/* CTWA total */}
                  <div className="sm:col-span-2 sm:text-right">
                    <p className="text-xl font-extrabold font-mono text-cyan-400">{fmt(client.ctwa_total)}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">CTWA msgs</p>
                  </div>

                  {/* Total received */}
                  <div className="sm:col-span-2 sm:text-right">
                    <p className="text-base font-bold font-mono text-white">{fmt(client.total_received)}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">all msgs</p>
                  </div>

                  {/* CTWA rate */}
                  <div className="sm:col-span-2 sm:text-right">
                    <p className="text-base font-bold font-mono text-amber-400">{pct(client.ctwa_rate)}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">of traffic</p>
                  </div>

                  {/* Sparkline */}
                  <div className="sm:col-span-3 flex items-center gap-3">
                    <Sparkline data={client.daily} dataKey="ctwa" color="#06b6d4" />
                    <div className="text-[10px] text-slate-500 leading-relaxed hidden lg:block">
                      {client.daily?.filter(d => d.ctwa > 0).length ?? 0} active days
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* What is CTWA explainer */}
          <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <MousePointerClick size={18} className="text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-cyan-400 mb-2">How CTWA detection works</p>
                <div className="space-y-1.5 text-xs text-cyan-400/60 leading-relaxed">
                  <p>
                    When a user clicks a <strong className="text-cyan-400/80">WhatsApp Ad</strong> on Facebook or Instagram, Meta opens
                    WhatsApp and pre-populates a message. The first message they send includes a{" "}
                    <code className="bg-cyan-900/30 px-1.5 py-0.5 rounded text-cyan-300">referral</code> object with
                    a unique <code className="bg-cyan-900/30 px-1.5 py-0.5 rounded text-cyan-300">ctwa_clid</code> per click.
                  </p>
                  <p>
                    The webhook service calls <code className="bg-cyan-900/30 px-1.5 py-0.5 rounded text-cyan-300">
                    _detect_and_track_ctwa()</code> <strong className="text-cyan-400/80">before</strong> the dedup check,
                    so every CTWA attempt is counted — including Meta retries.
                  </p>
                  <p>
                    If a client's CTWA count here is <strong className="text-cyan-400/80">0</strong> but they're running ads,
                    their WABA subscription may be broken. Check <strong>Client Health</strong> tab and verify
                    with <code className="bg-cyan-900/30 px-1.5 py-0.5 rounded text-cyan-300">
                    get_waba_subscription_status(waba_id, token)</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════ DLQ TAB ══════════════════════ */}
      {view === "dlq" && (
        <div className="space-y-6">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white">Dead Letter Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5 max-w-lg leading-relaxed">
                Webhook payloads that failed to enqueue. Stored in Redis, auto-replayed every 60 seconds.
              </p>
            </div>
            <button
              onClick={replayDLQ}
              disabled={replayLoading || dlq.total === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              {replayLoading
                ? <><RefreshCw size={14} className="animate-spin" /> Replaying…</>
                : <><RotateCcw size={14} /> Replay All ({dlq.total})</>
              }
            </button>
          </div>

          <div className="flex gap-4 flex-wrap">
            <MetricCard label="DLQ Depth"    value={fmt(dlq.total)}  sub="Failed enqueues"      warning={dlq.total > 0} icon={Inbox} />
            <MetricCard label="Auto-Replay"  value="Every 60s"       sub="Celery beat task"      accent="emerald" icon={RotateCcw} />
            <MetricCard label="Max TTL"      value="24h"             sub="Older items discarded" accent="slate"   icon={Clock} />
          </div>

          {dlq.total === 0 ? (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-12 text-center">
              <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-emerald-400 font-bold text-base">Dead Letter Queue is empty</p>
              <p className="text-slate-500 text-sm mt-1">All webhook enqueues are succeeding.</p>
            </div>
          ) : (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
                <AlertTriangle size={16} />
                {dlq.total} message(s) waiting for replay
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                These messages were received but Celery enqueue failed. The{" "}
                <code className="bg-slate-800 px-1.5 rounded text-slate-300">replay_dlq_task</code> Celery beat
                task runs every 60 seconds. Click <strong className="text-amber-400">Replay All</strong> to process immediately.
              </p>

              {dlq.items?.length > 0 && (
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                  {dlq.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/30 text-xs">
                      <div>
                        <span className="font-mono text-slate-300">{item.message_id ?? `item-${i}`}</span>
                        {item.client_id && <span className="text-slate-500 ml-2">client #{item.client_id}</span>}
                      </div>
                      {item.timestamp && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <Clock size={10} />
                          {new Date(item.timestamp * 1000).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-5">How the DLQ works</h3>
            <div className="space-y-4">
              <DLQFlowStep step="1" label="Webhook arrives"          desc="Meta POSTs to /api/whatsapp/webhook/. WebhookAuditMiddleware logs raw payload before any business logic." />
              <DLQFlowStep step="2" label="Atomic dedup check"       desc="cache.add(msg_lock:{id}) — atomic Redis SET NX. If already seen, returns 200 immediately. No duplicates." />
              <DLQFlowStep step="3" label="Celery enqueue attempt"   desc="process_inbound_message.delay(). If broker healthy → task queued → HTTP 200 back to Meta." />
              <DLQFlowStep step="4" label="Enqueue fails"            desc="Broker saturated or Redis pool exhausted. Dedup lock is CLEARED so Meta's retry can succeed." />
              <DLQFlowStep step="5" label="DLQ storage"              desc="Failed payload saved to dlq:failed_webhooks Redis list with timestamp and client context." />
              <DLQFlowStep step="6" label="Returns HTTP 500"         desc="Meta receives 500 → schedules retry ~20s. Auto-replay task also handles it every 60s." />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}