import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Activity, Gauge, Users, ShieldCheck, TrendingUp, Bell, RefreshCw,
  Play, Pause, Settings2, AlertTriangle, CheckCircle2, PauseCircle, Plus, BookOpen,
} from "lucide-react";
import automationApi from "./api";
import CampaignControlPanel from "./CampaignControlPanel";
import LimitGrowthGuide from "./LimitGrowthGuide";

const healthColor = (v) => ({
  HEALTHY: "text-green-500", WARNING: "text-amber-500",
  CRITICAL: "text-red-500", INSUFFICIENT_DATA: "text-gray-400",
}[v] || "text-gray-400");

const stateBadge = (s) => ({
  RUNNING: "bg-green-500/15 text-green-500",
  PAUSED: "bg-amber-500/15 text-amber-500",
}[s] || "bg-gray-500/15 text-gray-400");

const pct = (n) => `${Math.round((n || 0) * 100)}%`;

/**
 * Messaging Health Dashboard + operator controls (Phase 6).
 * One screen to run the automation: volume vs target, success/failure rates,
 * limit-capacity progress, active campaigns, eligibility, auto-pauses, alerts.
 */
export default function AutomationDashboard() {
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState(null); // {id, name}
  const [guideOpen, setGuideOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const timer = useRef(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const [ov, al] = await Promise.all([
        automationApi.overview(),
        automationApi.alerts().catch(() => ({ data: { data: [], unread: 0 } })),
      ]);
      setData(ov.data?.data || null);
      setAlerts(al.data?.data || []);
      setUnread(al.data?.unread ?? 0);
    } catch (e) {
      toast.error("Failed to load automation dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    timer.current = setInterval(load, 30000);
    return () => clearInterval(timer.current);
  }, [load]);

  const quickControl = async (cid, action) => {
    setBusyId(cid);
    try {
      await automationApi.control(cid, action);
      toast.success(`Campaign ${action}d`);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.error || `Could not ${action}`);
    } finally {
      setBusyId(null);
    }
  };

  const dismissAll = async () => {
    try {
      await automationApi.markAllAlertsRead();
      setUnread(0);
      setAlerts((a) => a.map((x) => ({ ...x, is_read: true })));
    } catch { /* noop */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b1120]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading automation…</p>
        </div>
      </div>
    );
  }

  const t = data?.totals || {};
  const campaigns = data?.campaigns || [];
  const elig = data?.eligibility || {};
  const totalCap = campaigns.reduce((s, c) => s + (c.todays_cap || 0), 0);
  const eligible = elig.ELIGIBLE || 0;
  const suppressed = elig.SUPPRESSED || 0;
  const contactsTotal = data?.contacts_total || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="text-green-500" size={24} /> Messaging Health
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Live automation status · {t.running || 0} running · {t.paused || 0} paused
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setGuideOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-900 border border-green-500/40 text-green-600 dark:text-green-400 hover:bg-green-500/10">
            <BookOpen size={15} /> Limit Growth Guide
          </button>
          <button onClick={() => navigate("/automation/progression")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <TrendingUp size={15} /> Growth plans
          </button>
          <button onClick={load}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={() => navigate("/automation/create")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700">
            <Plus size={16} /> New automated campaign
          </button>
        </div>
      </div>

      {/* Alerts banner */}
      {unread > 0 && (
        <div className="mb-6 rounded-xl border border-amber-300/40 bg-amber-50 dark:bg-amber-500/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
              <Bell size={16} /> {unread} alert{unread > 1 ? "s" : ""} need attention
            </div>
            <button onClick={dismissAll}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline">
              Mark all read
            </button>
          </div>
          <div className="space-y-1.5">
            {alerts.filter((a) => !a.is_read).slice(0, 4).map((a) => (
              <AlertRow key={a.id} alert={a} onRead={async () => {
                await automationApi.markAlertRead(a.id);
                setUnread((u) => Math.max(0, u - 1));
                setAlerts((list) => list.map((x) => x.id === a.id ? { ...x, is_read: true } : x));
              }} />
            ))}
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Gauge size={18} />} label="Volume today vs target"
          value={`${t.sent_today || 0} / ${totalCap}`} accent="green"
          bar={totalCap ? (t.sent_today || 0) / totalCap : 0} />
        <StatCard icon={<CheckCircle2 size={18} />} label="Success rate (today)"
          value={pct(t.success_rate)} accent="blue" bar={t.success_rate} />
        <StatCard icon={<AlertTriangle size={18} />} label="Failure rate (today)"
          value={pct(t.failure_rate)} accent="red" bar={t.failure_rate} />
        <StatCard icon={<Users size={18} />} label="Eligible contacts"
          value={`${eligible} / ${contactsTotal}`} accent="emerald"
          bar={contactsTotal ? eligible / contactsTotal : 0} />
      </div>

      {/* Progression (limit capacity) */}
      {(data?.progression || []).length > 0 && (
        <div className="mb-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <TrendingUp size={16} className="text-green-500" /> Messaging capacity progress
            </h2>
            <button onClick={() => navigate("/automation/progression")}
              className="text-xs font-medium text-green-600 dark:text-green-400 hover:underline">
              Manage plans →
            </button>
          </div>
          <div className="space-y-4">
            {data.progression.map((p) => (
              <button key={p.id} onClick={() => navigate(`/automation/progression/${p.id}`)}
                className="w-full text-left group">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                    {p.current_limit.toLocaleString()} → {p.target_limit.toLocaleString()}
                    <span className="ml-2 text-xs text-gray-400">({p.state})</span>
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {p.completed} / {p.needed} quality conversations
                  </span>
                </div>
                <Progress value={p.pct / 100} accent="green" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active campaigns */}
      <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Active campaigns</h2>
        </div>
        {campaigns.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No running or paused campaigns. Start automation from a campaign's control panel.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-5 py-2 font-medium">Campaign</th>
                  <th className="px-3 py-2 font-medium">State</th>
                  <th className="px-3 py-2 font-medium">Sent / Cap</th>
                  <th className="px-3 py-2 font-medium">Success</th>
                  <th className="px-3 py-2 font-medium">Health</th>
                  <th className="px-3 py-2 font-medium text-right">Controls</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.campaign_id}
                    className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-5 py-3 max-w-[220px]">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {c.name || c.campaign_id}
                      </div>
                      {c.status_line && (
                        <div className="text-[11px] text-gray-400 truncate mt-0.5">{c.status_line}</div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stateBadge(c.state)}`}>
                        {c.state}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-300">
                      {c.sent_today} / {c.todays_cap}
                    </td>
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{pct(c.success_rate)}</td>
                    <td className={`px-3 py-3 font-medium ${healthColor(c.health)}`}>{c.health || "—"}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.state === "RUNNING" ? (
                          <button disabled={busyId === c.campaign_id}
                            onClick={() => quickControl(c.campaign_id, "pause")}
                            title="Pause"
                            className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500 hover:bg-amber-500/25">
                            <Pause size={15} />
                          </button>
                        ) : (
                          <button disabled={busyId === c.campaign_id}
                            onClick={() => quickControl(c.campaign_id, "resume")}
                            title="Resume"
                            className="p-1.5 rounded-lg bg-green-500/15 text-green-500 hover:bg-green-500/25">
                            <Play size={15} />
                          </button>
                        )}
                        <button onClick={() => setPanel({ id: c.campaign_id, name: c.name })}
                          title="Control panel"
                          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                          <Settings2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom row: safety + auto-pauses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <ShieldCheck size={16} className="text-green-500" /> Contact safety
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <SafetyStat label="Eligible" value={eligible} tone="green" />
            <SafetyStat label="Cooldown" value={elig.COOLDOWN || 0} tone="amber" />
            <SafetyStat label="Suppressed / opted-out" value={suppressed} tone="red" />
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {elig.total_scored || 0} contacts scored · {contactsTotal} total. Non-opted-in
            contacts are never messaged.
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <PauseCircle size={16} className="text-amber-500" /> Recent automatic pauses
          </h2>
          {(data?.recent_auto_pauses || []).length === 0 ? (
            <p className="text-xs text-gray-400">No automatic pauses. All campaigns healthy.</p>
          ) : (
            <div className="space-y-2">
              {data.recent_auto_pauses.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">{p.name || "Campaign"}</span>
                    <span className="text-gray-500 dark:text-gray-400"> — {p.reason}</span>
                    <div className="text-xs text-gray-400">{new Date(p.at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {panel && (
        <CampaignControlPanel
          campaignId={panel.id}
          campaignName={panel.name}
          onClose={() => setPanel(null)}
          onChanged={load}
        />
      )}

      {guideOpen && <LimitGrowthGuide onClose={() => setGuideOpen(false)} />}
    </div>
  );
}

function StatCard({ icon, label, value, accent = "green", bar = 0 }) {
  const accents = {
    green: "text-green-500", blue: "text-blue-500", red: "text-red-500", emerald: "text-emerald-500",
  };
  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{label}</span>
        <span className={accents[accent]}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <div className="mt-2"><Progress value={bar} accent={accent} /></div>
    </div>
  );
}

function Progress({ value = 0, accent = "green" }) {
  const bg = {
    green: "bg-green-500", blue: "bg-blue-500", red: "bg-red-500", emerald: "bg-emerald-500",
  }[accent] || "bg-green-500";
  const w = Math.max(0, Math.min(100, Math.round((value || 0) * 100)));
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
      <div className={`h-full ${bg} rounded-full transition-all`} style={{ width: `${w}%` }} />
    </div>
  );
}

function SafetyStat({ label, value, tone }) {
  const tones = { green: "text-green-500", amber: "text-amber-500", red: "text-red-500" };
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
      <p className={`text-xl font-bold ${tones[tone]}`}>{value}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function AlertRow({ alert, onRead }) {
  const tone = {
    CRITICAL: "text-red-500", WARNING: "text-amber-500", INFO: "text-blue-500",
  }[alert.level] || "text-gray-400";
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-xs font-semibold ${tone}`}>●</span>
        <span className="text-gray-700 dark:text-gray-200 truncate">{alert.title}</span>
      </div>
      <button onClick={onRead} className="text-xs text-gray-400 hover:text-gray-600 shrink-0">
        dismiss
      </button>
    </div>
  );
}
