import React, { useState } from "react";
import { toast } from "react-toastify";
import { X, TrendingUp, Info } from "lucide-react";
import { progressionApi } from "./api";

/**
 * Create a Progression Plan (drawer). Honest quality-conversation framing:
 * the plan spreads a target number of genuine quality conversations
 * (delivered / read / replied) across N days, only enrolling high-quality,
 * opted-in, eligible contacts, and never exceeding the current limit.
 * "target_limit" is only the operator's growth goal used to size the plan.
 */
export default function CreateProgressionPlan({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [currentLimit, setCurrentLimit] = useState(2000);
  const [targetLimit, setTargetLimit] = useState(10000);
  const [needed, setNeeded] = useState(1000);
  const [days, setDays] = useState(7);
  const [minTier, setMinTier] = useState("HIGH");
  const [requireReply, setRequireReply] = useState(true);
  const [saving, setSaving] = useState(false);

  const valid =
    Number(currentLimit) >= 1 &&
    Number(targetLimit) > Number(currentLimit) &&
    Number(needed) >= 1 &&
    Number(days) >= 1;

  const submit = async () => {
    if (!valid) {
      if (Number(targetLimit) <= Number(currentLimit))
        return toast.error("Target limit must be greater than current limit");
      return toast.error("Please complete all fields");
    }
    setSaving(true);
    try {
      const body = {
        name: name.trim() || undefined,
        current_limit: parseInt(currentLimit, 10),
        target_limit: parseInt(targetLimit, 10),
        quality_conversations_needed: parseInt(needed, 10),
        planning_days: parseInt(days, 10),
        min_quality_tier: minTier,
        require_reply: requireReply,
      };
      const res = await progressionApi.create(body);
      toast.success("Progression plan created and started");
      onCreated && onCreated(res.data?.data);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not create plan");
    } finally {
      setSaving(false);
    }
  };

  const perDay = days > 0 ? Math.ceil(Number(needed) / Number(days)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full overflow-y-auto bg-white dark:bg-[#0b1120] border-l border-gray-200 dark:border-gray-800 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white dark:bg-[#0b1120] border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-green-500" size={20} />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">New Progression Plan</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="rounded-lg border border-blue-300/30 bg-blue-50 dark:bg-blue-500/10 p-3 flex items-start gap-2">
            <Info size={15} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600 dark:text-gray-300">
              The plan holds a controlled number of <b>genuine quality conversations</b>
              (delivered / read / replied) over several days, using only high-quality,
              opted-in, eligible contacts. It never exceeds your current limit and never
              contacts Meta. <i>Target limit</i> is only your growth goal, used to size the plan.
            </p>
          </div>

          <Field label="Plan name (optional)">
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Growth 2k → 10k" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Current limit">
              <input type="number" min="1" value={currentLimit}
                onChange={(e) => setCurrentLimit(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Target limit (goal)">
              <input type="number" min="1" value={targetLimit}
                onChange={(e) => setTargetLimit(e.target.value)} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Quality conversations needed">
              <input type="number" min="1" value={needed}
                onChange={(e) => setNeeded(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Planning days">
              <input type="number" min="1" max="60" value={days}
                onChange={(e) => setDays(e.target.value)} className={inputCls} />
            </Field>
          </div>

          <p className="text-xs text-gray-400 -mt-2">
            ≈ <b>{perDay}</b> quality conversations/day on average (the system front-loads and
            adapts daily if you're ahead or behind).
          </p>

          <Field label="Minimum contact quality">
            <select value={minTier} onChange={(e) => setMinTier(e.target.value)} className={inputCls}>
              <option value="HIGH">High only (strictest)</option>
              <option value="MEDIUM">High or Medium</option>
            </select>
          </Field>

          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={requireReply}
              onChange={(e) => setRequireReply(e.target.checked)} className="mt-1 accent-green-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              <b>Require a reply</b> to count a quality conversation (strongest signal). Uncheck to
              also count a <i>read</i>.
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button onClick={onClose}
              className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
              Cancel
            </button>
            <button disabled={saving || !valid} onClick={submit}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
              <TrendingUp size={15} /> {saving ? "Creating…" : "Create & start"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/40";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
