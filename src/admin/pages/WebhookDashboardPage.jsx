// src/admin/pages/WebhookDashboardPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { adminApi } from "../utils/api";
import {
  Radio, AlertTriangle, CheckCircle2, RefreshCw,
  Inbox, ShieldAlert, Zap, TrendingDown, Activity,
  ChevronDown, ChevronUp, Trash2, RotateCcw, Clock,
} from "lucide-react";
import { LoadingSpinner } from "../components/UIComponents";

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt  = (n) => (n ?? 0).toLocaleString();
const pct  = (n) => ((n ?? 0).toFixed(1)) + "%";
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

function MetricCard({ label, value, sub, warning, accent = "amber" }) {
  const accentMap = {
    amber:   { top: "border-t-amber-400",   val: "text-amber-400"   },
    emerald: { top: "border-t-emerald-500", val: "text-emerald-400" },
    red:     { top: "border-t-red-500",     val: "text-red-400"     },
    slate:   { top: "border-t-slate-600",   val: "text-slate-400"   },
  };
  const colors = accentMap[warning ? "red" : accent] || accentMap.amber;
  return (
    <div className={`bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 flex-1 min-w-[130px] border-t-2 ${colors.top} transition-all hover:border-slate-700/50`}>
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

// ── Main Component ────────────────────────────────────────────────────────────

export default function WebhookDashboardPage() {
  const [view, setView]             = useState("overview");
  const [days, setDays]             = useState(7);
  const [timeline, setTimeline]     = useState([]);
  const [clients, setClients]       = useState([]);
  const [dlq, setDlq]               = useState({ total: 0, items: [] });
  const [selected, setSelected]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [actionMsg, setActionMsg]   = useState(null);  // { type: 'success'|'error', text }
  const [replayLoading, setReplayLoading] = useState(false);
  const [clearLoading, setClearLoading]   = useState(null); // client_id being cleared

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

  useEffect(() => { fetchAll(); }, [fetchAll]);

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
    }),
    { received: 0, enqueued: 0, missed: 0, inactive: 0, failed: 0, dedup: 0 }
  );

  const overallLoss = totals.received
    ? parseFloat(((totals.missed / totals.received) * 100).toFixed(1))
    : 0;

  const inactiveCached  = clients.filter(c => c.inactive_phone_cached);
  const criticalClients = clients.filter(c => c.health === "critical");
  const chartData       = timeline.map(r => ({ ...r, date: shortDate(r.date) }));

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
            <p className="text-sm text-slate-500 mt-0.5">Real-time pipeline health &amp; loss tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Alert badges */}
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

          {/* Days selector */}
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="bg-slate-900/50 border border-slate-800/50 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500/50"
          >
            {[7, 14, 30].map(d => (
              <option key={d} value={d}>Last {d} days</option>
            ))}
          </select>

          {/* Refresh */}
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
      <div className="flex gap-1 border-b border-slate-800/50">
        {[
          { id: "overview", label: "Overview",         icon: Activity },
          { id: "clients",  label: "Client Health",    icon: Zap },
          { id: "dlq",      label: "Dead Letter Queue", icon: Inbox },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
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
          </button>
        ))}
      </div>

      {/* ══════════════════════ OVERVIEW TAB ══════════════════════ */}
      {view === "overview" && (
        <div className="space-y-6">

          {/* Stat cards */}
          <div className="flex gap-4 flex-wrap">
            <MetricCard
              label="Total Received"
              value={fmt(totals.received)}
              sub={`Last ${days} days`}
              accent="amber"
            />
            <MetricCard
              label="Successfully Enqueued"
              value={fmt(totals.enqueued)}
              sub="Reached Celery"
              accent="emerald"
            />
            <MetricCard
              label="Missed Webhooks"
              value={fmt(totals.missed)}
              sub={`${pct(overallLoss)} loss rate`}
              warning={overallLoss > 5}
            />
            <MetricCard
              label="Inactive Cache Drops"
              value={fmt(totals.inactive)}
              sub="Bug #1 victims"
              warning={totals.inactive > 0}
            />
            <MetricCard
              label="Enqueue Failures"
              value={fmt(totals.failed)}
              sub="Broker errors → DLQ"
              warning={totals.failed > 0}
            />
          </div>

          {/* Loss rate chart */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-white">Webhook Loss Rate</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  % of received webhooks not successfully enqueued
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
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} unit="%" />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone" dataKey="loss_pct" name="Loss %"
                  stroke="#ef4444" strokeWidth={2.5}
                  dot={{ fill: "#ef4444", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#ef4444" }}
                />
              </LineChart>
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
                  <Bar dataKey="dedup_dropped" name="Dedup (OK)"          fill="#475569" stackId="a" />
                  <Bar dataKey="inactive_dropped" name="Inactive Cache"   fill="#ef4444" stackId="a" />
                  <Bar dataKey="failed"           name="Enqueue Failed"   fill="#f59e0b" stackId="a" />
                  <Bar dataKey="missed"           name="Unaccounted"      fill="#7c3aed" stackId="a" radius={[3,3,0,0]} />
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
                Sorted by loss rate · 🔴 = inactive_phone cache bug active
              </p>
            </div>
            <div className="flex gap-3 text-xs text-slate-500">
              <span>
                Total: <strong className="text-white">{clients.length}</strong>
              </span>
              <span>
                Critical:{" "}
                <strong className="text-red-400">{criticalClients.length}</strong>
              </span>
              <span>
                Cache issues:{" "}
                <strong className="text-red-400">{inactiveCached.length}</strong>
              </span>
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
                const isOpen = selected?.client_id === client.client_id;
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
                    {/* Row */}
                    <div
                      className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-800/30 transition-colors flex-wrap"
                      onClick={() => setSelected(isOpen ? null : client)}
                    >
                      {/* Identity */}
                      <div className="flex-1 min-w-[180px]">
                        <p className="text-sm font-semibold text-white">
                          {client.inactive_phone_cached && (
                            <span className="text-red-400 mr-1">🔴</span>
                          )}
                          {client.username}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                          phone_id: {client.phone_id}
                        </p>
                      </div>

                      <HealthBadge health={client.health} />

                      {/* 7d loss */}
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">7d loss</p>
                        <p
                          className="text-xl font-extrabold font-mono"
                          style={{ color: lossColor(client.loss_pct_7d) }}
                        >
                          {pct(client.loss_pct_7d)}
                        </p>
                      </div>

                      {/* Received */}
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Received</p>
                        <p className="text-base font-bold text-white font-mono">
                          {fmt(client.totals?.received)}
                        </p>
                      </div>

                      {/* Missed */}
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Missed</p>
                        <p className={`text-base font-bold font-mono ${
                          (client.totals?.missed ?? 0) > 0 ? "text-red-400" : "text-emerald-400"
                        }`}>
                          {fmt(client.totals?.missed)}
                        </p>
                      </div>

                      {/* Fix button */}
                      {client.inactive_phone_cached && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            clearInactiveCache(client.client_id, client.phone_id);
                          }}
                          disabled={clearLoading === client.client_id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-50 transition-all"
                        >
                          {clearLoading === client.client_id ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                          Fix Cache
                        </button>
                      )}

                      {/* Chevron */}
                      <div className="text-slate-600">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {/* Expanded drill-down */}
                    {isOpen && (
                      <div className="px-5 pb-5 pt-0 border-t border-slate-800/50">
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          {[
                            ["Total Received", client.totals?.received, "text-white"],
                            ["Enqueued",       client.totals?.enqueued, "text-emerald-400"],
                            ["Missed",         client.totals?.missed,   (client.totals?.missed ?? 0) > 0 ? "text-red-400" : "text-emerald-400"],
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
                            Redis key. Confirm the client's subscription is <strong>ACTIVE</strong> in the DB before clearing.
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

      {/* ══════════════════════ DLQ TAB ══════════════════════ */}
      {view === "dlq" && (
        <div className="space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white">Dead Letter Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5 max-w-lg leading-relaxed">
                Webhook payloads that failed to enqueue (Celery broker was down or saturated).
                Stored in Redis and auto-replayed every 60 seconds. Manual replay available here.
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

          {/* Stats */}
          <div className="flex gap-4 flex-wrap">
            <MetricCard
              label="DLQ Depth"
              value={fmt(dlq.total)}
              sub="Failed enqueues"
              warning={dlq.total > 0}
            />
            <MetricCard
              label="Auto-Replay"
              value="Every 60s"
              sub="Celery beat task"
              accent="emerald"
            />
            <MetricCard
              label="Max TTL"
              value="24h"
              sub="Older items discarded"
              accent="slate"
            />
          </div>

          {/* Empty state vs pending state */}
          {dlq.total === 0 ? (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-12 text-center">
              <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-emerald-400 font-bold text-base">Dead Letter Queue is empty</p>
              <p className="text-slate-500 text-sm mt-1">
                All webhook enqueues are succeeding. No messages lost to broker errors.
              </p>
            </div>
          ) : (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
                <AlertTriangle size={16} />
                {dlq.total} message(s) waiting for replay
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                These messages were received by your server but Celery enqueue failed.
                The <code className="bg-slate-800 px-1.5 rounded text-slate-300">replay_dlq_task</code> Celery
                beat task runs every 60 seconds. Click <strong className="text-amber-400">Replay All</strong> to process immediately.
              </p>

              {/* DLQ item list if available */}
              {dlq.items?.length > 0 && (
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                  {dlq.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/30 text-xs">
                      <div>
                        <span className="font-mono text-slate-300">{item.message_id ?? `item-${i}`}</span>
                        {item.client_id && (
                          <span className="text-slate-500 ml-2">client #{item.client_id}</span>
                        )}
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

          {/* How it works */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-5">How the DLQ works</h3>
            <div className="space-y-4">
              <DLQFlowStep step="1" label="Webhook arrives"
                desc="Meta POSTs to /api/whatsapp/webhook/. WebhookAuditMiddleware logs to raw_webhook_log before any business logic." />
              <DLQFlowStep step="2" label="Atomic dedup check"
                desc="cache.add(msg_lock:{id}) — atomic Redis SET NX. If already seen, returns 200 immediately. No duplicates." />
              <DLQFlowStep step="3" label="Celery enqueue attempt"
                desc="process_inbound_message.delay(). If broker healthy → task queued → returns HTTP 200 to Meta." />
              <DLQFlowStep step="4" label="Enqueue fails"
                desc="Broker saturated or Redis pool exhausted. Dedup lock is CLEARED so Meta's retry can succeed." />
              <DLQFlowStep step="5" label="DLQ storage"
                desc="Failed payload saved to dlq:failed_webhooks Redis list with timestamp and client context." />
              <DLQFlowStep step="6" label="Returns HTTP 500"
                desc="Meta receives 500 → schedules retry within ~20s. Auto-replay task also handles it every 60s." />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}