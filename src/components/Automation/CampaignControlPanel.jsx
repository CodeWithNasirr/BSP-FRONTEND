import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  X, Play, Pause, Save, Clock, ListChecks, UserCog, ScrollText, RefreshCw,
} from "lucide-react";
import automationApi from "./api";

const stateBadge = (s) => {
  const map = {
    RUNNING: "bg-green-500/15 text-green-500",
    PAUSED: "bg-amber-500/15 text-amber-500",
    DRAFT: "bg-gray-500/15 text-gray-400",
    COMPLETED: "bg-blue-500/15 text-blue-500",
    CANCELLED: "bg-red-500/15 text-red-500",
    FAILED: "bg-red-500/15 text-red-500",
  };
  return map[s] || "bg-gray-500/15 text-gray-400";
};

/**
 * Slide-over control panel for a single campaign's automation.
 * Pause/resume, change template, adjust daily volume, view next scheduled
 * batches, manually override a contact, and read the decision log.
 */
export default function CampaignControlPanel({ campaignId, campaignName, onClose, onChanged }) {
  const [status, setStatus] = useState(null);
  const [config, setConfig] = useState(null);
  const [batch, setBatch] = useState(null);
  const [audit, setAudit] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dailyVolume, setDailyVolume] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [overrideContactId, setOverrideContactId] = useState("");
  const [overrideMode, setOverrideMode] = useState("FORCE_ELIGIBLE");
  const [overrideReason, setOverrideReason] = useState("");

  const load = useCallback(async () => {
    try {
      const [s, c, b, a, t] = await Promise.all([
        automationApi.status(campaignId),
        automationApi.getConfig(campaignId),
        automationApi.batch(campaignId),
        automationApi.audit(campaignId, 60),
        automationApi.templates().catch(() => ({ data: { Data: [] } })),
      ]);
      setStatus(s.data?.data || null);
      const cfg = c.data?.data || null;
      setConfig(cfg);
      setDailyVolume(cfg ? String(cfg.daily_max_messages) : "");
      setTemplateId(cfg?.template ? String(cfg.template) : "");
      setBatch(b.data?.data || null);
      setAudit(a.data?.data || []);
      setTemplates(t.data?.Data || t.data?.data || []);
    } catch (e) {
      toast.error("Failed to load campaign automation");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    load();
  }, [load]);

  const runState = status?.run?.state;

  const doControl = async (action) => {
    setSaving(true);
    try {
      await automationApi.control(campaignId, action);
      toast.success(`Campaign ${action}d`);
      await load();
      onChanged && onChanged();
    } catch (e) {
      toast.error(e?.response?.data?.error || `Could not ${action}`);
    } finally {
      setSaving(false);
    }
  };

  const saveVolume = async () => {
    const v = parseInt(dailyVolume, 10);
    if (!v || v < 1) return toast.error("Enter a valid daily volume");
    setSaving(true);
    try {
      await automationApi.updateConfig(campaignId, { daily_max_messages: v });
      toast.success("Daily volume updated");
      await load();
      onChanged && onChanged();
    } catch (e) {
      toast.error("Could not update volume");
    } finally {
      setSaving(false);
    }
  };

  const saveTemplate = async () => {
    setSaving(true);
    try {
      await automationApi.updateConfig(campaignId, { template: templateId || null });
      toast.success("Template updated");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not change template");
    } finally {
      setSaving(false);
    }
  };

  const applyOverride = async () => {
    const cid = parseInt(overrideContactId, 10);
    if (!cid) return toast.error("Enter a contact ID");
    setSaving(true);
    try {
      await automationApi.overrideContact(cid, overrideMode, overrideReason);
      toast.success("Contact override applied");
      setOverrideContactId("");
      setOverrideReason("");
    } catch (e) {
      toast.error(e?.response?.data?.error || "Override failed");
    } finally {
      setSaving(false);
    }
  };

  const scheduled = (batch?.recipients || []).filter((r) => r.status === "SCHEDULED");

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-xl h-full overflow-y-auto bg-white dark:bg-[#0b1120] border-l border-gray-200 dark:border-gray-800 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white dark:bg-[#0b1120] border-b border-gray-200 dark:border-gray-800">
          <div>
            <p className="text-xs text-gray-400">Campaign automation</p>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-xs">
              {campaignName || "Campaign"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} title="Refresh"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
              <RefreshCw size={16} />
            </button>
            <button onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading…</div>
        ) : (
          <div className="p-5 space-y-6">
            {/* State + controls */}
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${stateBadge(runState)}`}>
                {runState || "—"}
                {status?.run?.pause_reason ? ` · ${status.run.pause_reason}` : ""}
              </span>
              <div className="flex gap-2">
                {runState === "RUNNING" ? (
                  <button disabled={saving} onClick={() => doControl("pause")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-500/15 text-amber-500 hover:bg-amber-500/25">
                    <Pause size={15} /> Pause
                  </button>
                ) : (
                  <button disabled={saving} onClick={() => doControl(runState === "PAUSED" ? "resume" : "start")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-500/15 text-green-500 hover:bg-green-500/25">
                    <Play size={15} /> {runState === "PAUSED" ? "Resume" : "Start"}
                  </button>
                )}
              </div>
            </div>

            {/* Today's stats */}
            <div className="grid grid-cols-3 gap-3">
              <Mini label="Sent today" value={status?.today_stats?.sent_today ?? 0} />
              <Mini label="Success" value={`${Math.round((status?.today_stats?.success_rate || 0) * 100)}%`} />
              <Mini label="Today's cap" value={status?.limit_progress?.todays_cap ?? "—"} />
            </div>

            {/* Daily volume */}
            <Section icon={<Save size={15} />} title="Daily volume target">
              <div className="flex gap-2">
                <input type="number" min="1" value={dailyVolume}
                  onChange={(e) => setDailyVolume(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white" />
                <button disabled={saving} onClick={saveVolume}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700">
                  Save
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Warm-up day {status?.limit_progress?.warmup_day ?? 0} · system cap today{" "}
                {status?.limit_progress?.todays_cap ?? "—"} of {config?.daily_max_messages ?? "—"}
              </p>
            </Section>

            {/* Template */}
            <Section icon={<ListChecks size={15} />} title="Template">
              <div className="flex gap-2">
                <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white">
                  <option value="">(Use campaign default)</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.template_name}{t.status ? ` · ${t.status}` : ""}
                    </option>
                  ))}
                </select>
                <button disabled={saving} onClick={saveTemplate}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700">
                  Save
                </button>
              </div>
            </Section>

            {/* Next scheduled batches */}
            <Section icon={<Clock size={15} />} title={`Next scheduled (${scheduled.length})`}>
              {scheduled.length === 0 ? (
                <p className="text-xs text-gray-400">No messages scheduled right now.</p>
              ) : (
                <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                  {scheduled.slice(0, 50).map((r) => (
                    <div key={r.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="text-gray-700 dark:text-gray-300 truncate">
                        {r.full_name || r.phone_number}
                      </span>
                      <span className="text-xs text-gray-400">
                        {r.scheduled_for ? new Date(r.scheduled_for).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Manual contact override */}
            <Section icon={<UserCog size={15} />} title="Manual contact override">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input type="number" placeholder="Contact ID" value={overrideContactId}
                    onChange={(e) => setOverrideContactId(e.target.value)}
                    className="w-32 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white" />
                  <select value={overrideMode} onChange={(e) => setOverrideMode(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white">
                    <option value="FORCE_ELIGIBLE">Force eligible</option>
                    <option value="FORCE_BLOCK">Force block</option>
                    <option value="NONE">Clear override</option>
                  </select>
                </div>
                <input placeholder="Reason (optional)" value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white" />
                <button disabled={saving} onClick={applyOverride}
                  className="px-4 py-2 rounded-lg bg-gray-800 dark:bg-gray-700 text-white text-sm font-medium hover:opacity-90">
                  Apply override
                </button>
                <p className="text-xs text-gray-400">
                  Opt-out and suppression always win — an override never messages a non-opted-in contact.
                </p>
              </div>
            </Section>

            {/* Decision log */}
            <Section icon={<ScrollText size={15} />} title="Decision log">
              {audit.length === 0 ? (
                <p className="text-xs text-gray-400">No decisions logged yet.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-1.5">
                  {audit.map((a) => (
                    <div key={a.id} className="flex items-start gap-2 text-xs">
                      <span className="mt-0.5 font-mono text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                        {a.action}
                      </span>
                      <div className="flex-1">
                        <span className="text-gray-700 dark:text-gray-300">{a.reason || a.action}</span>
                        <span className="text-gray-400"> · {new Date(a.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 text-center">
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
        <span className="text-green-500">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}
