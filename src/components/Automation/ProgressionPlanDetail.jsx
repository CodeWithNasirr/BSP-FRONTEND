import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  TrendingUp, ArrowLeft, RefreshCw, Play, Pause, XCircle, Save,
  Activity, CalendarDays, Clock, ShieldCheck, Info,
} from "lucide-react";
import { progressionApi } from "./api";

const stateBadge = (s) => ({
  ACTIVE: "bg-green-500/15 text-green-500",
  PAUSED: "bg-amber-500/15 text-amber-500",
  COMPLETED: "bg-blue-500/15 text-blue-500",
  EXPIRED: "bg-red-500/15 text-red-500",
  CANCELLED: "bg-gray-500/15 text-gray-400",
  DRAFT: "bg-gray-500/15 text-gray-400",
}[s] || "bg-gray-500/15 text-gray-400");

const verdictColor = (v) => ({
  HEALTHY: "text-green-500", WARNING: "text-amber-500",
  CRITICAL: "text-red-500", INSUFFICIENT_DATA: "text-gray-400",
}[v] || "text-gray-400");

const fmtDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString([], { month: "short", day: "numeric" }) : "—";
const fmtHour = (iso) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
const pct = (n) => `${Math.round((n || 0) * 100)}%`;

export default function ProgressionPlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [edits, setEdits] = useState({}); // { date: newAdjustedTarget }

  const load = useCallback(async () => {
    try {
      const res = await progressionApi.detail(id);
      setData(res.data?.data || null);
      setEdits({});
    } catch (e) {
      toast.error("Failed to load plan");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const control = async (action) => {
    setBusy(true);
    try {
      await progressionApi.control(id, action);
      toast.success(`Plan ${action}ed`);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.error || `Could not ${action}`);
    } finally {
      setBusy(false);
    }
  };

  const recalculate = async () => {
    setBusy(true);
    try {
      await progressionApi.recalculate(id);
      toast.success("Recalculated");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not recalculate");
    } finally {
      setBusy(false);
    }
  };

  const saveTargets = async () => {
    const targets = Object.entries(edits)
      .filter(([, v]) => v !== "" && v != null)
      .map(([date, v]) => ({ date, adjusted_target: parseInt(v, 10) }))
      .filter((t) => !Number.isNaN(t.adjusted_target));
    if (targets.length === 0) return toast.info("No target changes to save");
    setBusy(true);
    try {
      await progressionApi.updateTargets(id, targets);
      toast.success("Daily targets updated");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not update targets");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b1120]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b1120] text-gray-400">
        Plan not found.
      </div>
    );
  }

  const { plan, progress, daily_targets = [], today_hourly = [], health } = data;
  const state = plan.state;
  const hasEdits = Object.keys(edits).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-3">
          <div className="min-w-0">
            <button onClick={() => navigate("/automation/progression")}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-1">
              <ArrowLeft size={13} /> Growth Plans
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
              <TrendingUp className="text-green-500" size={22} />
              {plan.name || `${plan.current_limit.toLocaleString()} → ${plan.target_limit.toLocaleString()}`}
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stateBadge(state)}`}>
                {state}{plan.pause_reason ? ` · ${plan.pause_reason}` : ""}
              </span>
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {plan.start_date} → {plan.end_date} · {plan.planning_days} days · min quality{" "}
              {plan.min_quality_tier}{plan.require_reply ? " · reply required" : " · read counts"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={recalculate} disabled={busy} title="Recompute now"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
              <RefreshCw size={16} />
            </button>
            {state === "ACTIVE" && (
              <button disabled={busy} onClick={() => control("pause")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-amber-500/15 text-amber-500 hover:bg-amber-500/25">
                <Pause size={15} /> Pause
              </button>
            )}
            {(state === "PAUSED" || state === "EXPIRED") && (
              <button disabled={busy} onClick={() => control("resume")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-green-500/15 text-green-500 hover:bg-green-500/25">
                <Play size={15} /> Resume
              </button>
            )}
            {["ACTIVE", "PAUSED", "EXPIRED"].includes(state) && (
              <button disabled={busy} onClick={() => { if (window.confirm("Cancel this plan?")) control("cancel"); }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-500/15 text-red-500 hover:bg-red-500/25">
                <XCircle size={15} /> Cancel
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 mb-5">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-xs text-gray-400">Quality conversations completed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {progress.completed} <span className="text-lg text-gray-400">/ {progress.needed}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-500">{Math.round(progress.pct)}%</p>
              <p className="text-xs text-gray-400">{progress.remaining} to go</p>
            </div>
          </div>
          <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${Math.max(0, Math.min(100, progress.pct))}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Mini label="Enrolled" value={plan.enrolled_conversations} />
            <Mini label="Daily average target" value={plan.planning_days ? Math.ceil(progress.needed / plan.planning_days) : "—"} />
            <Mini label="Est. quality rate" value={pct(plan.expected_quality_rate)} />
          </div>
        </div>

        {/* Health */}
        {health && (
          <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-green-500" />
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Account health</h2>
              <span className={`ml-auto text-sm font-semibold ${verdictColor(health.verdict)}`}>
                {health.verdict}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Mini label="Delivery" value={pct(health.metrics?.delivery_rate)} />
              <Mini label="Failure" value={pct(health.metrics?.failure_rate)} />
              <Mini label="Opt-out" value={pct(health.metrics?.optout_rate)} />
              <Mini label="Read" value={pct(health.metrics?.read_rate)} />
            </div>
            {plan.auto_pause_enabled && (
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                <Info size={12} /> The plan auto-pauses on high failure/opt-out or low delivery.
              </p>
            )}
          </div>
        )}

        {/* Day-by-day targets (editable for upcoming days) */}
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden mb-5">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <CalendarDays size={16} className="text-green-500" /> Day-by-day targets
            </h2>
            {hasEdits && (
              <button disabled={busy} onClick={saveTargets}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700">
                <Save size={13} /> Save targets
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-5 py-2 font-medium">Day</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Target</th>
                  <th className="px-3 py-2 font-medium">Enrolled</th>
                  <th className="px-3 py-2 font-medium">Completed</th>
                  <th className="px-3 py-2 font-medium">State</th>
                </tr>
              </thead>
              <tbody>
                {daily_targets.map((d) => {
                  const editable = d.state === "PENDING";
                  return (
                    <tr key={d.id} className="border-b border-gray-50 dark:border-gray-800/50">
                      <td className="px-5 py-2.5 text-gray-500">#{d.day_index + 1}</td>
                      <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{fmtDate(d.date)}</td>
                      <td className="px-3 py-2.5">
                        {editable ? (
                          <input type="number" min="0"
                            value={edits[d.date] ?? d.adjusted_target}
                            onChange={(e) => setEdits((prev) => ({ ...prev, [d.date]: e.target.value }))}
                            className="w-20 px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white" />
                        ) : (
                          <span className="text-gray-700 dark:text-gray-300">{d.adjusted_target}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">{d.enrolled_count}</td>
                      <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300 font-medium">{d.completed_count}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          d.state === "ACTIVE" ? "bg-green-500/15 text-green-500"
                          : d.state === "COMPLETED" ? "bg-blue-500/15 text-blue-500"
                          : "bg-gray-500/15 text-gray-400"}`}>
                          {d.state}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 px-5 py-2.5">
            Only upcoming (PENDING) days can be edited. The system re-balances remaining days
            automatically if you're ahead or behind.
          </p>
        </div>

        {/* Today's hourly slots */}
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-3">
            <Clock size={16} className="text-green-500" /> Today's hourly plan
          </h2>
          {today_hourly.length === 0 ? (
            <p className="text-xs text-gray-400">
              No hourly slots for today yet — they're prepared when the day's batch is built.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {today_hourly.map((h) => (
                <div key={h.id} className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-2.5 text-center">
                  <p className="text-xs text-gray-400">{fmtHour(h.hour_start_at)}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {h.completed_count}/{h.target}
                  </p>
                  <p className="text-[10px] text-gray-400">{h.enrolled_count} enrolled</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 text-center">
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
