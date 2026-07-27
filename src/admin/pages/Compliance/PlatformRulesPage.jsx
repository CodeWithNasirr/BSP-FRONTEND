// src/admin/pages/Compliance/PlatformRulesPage.jsx
// §Configurable platform rules — the ONLY thing the Guard's Block enforces.
// These are our own compliance policies, not Meta's internal systems.
import React, { useEffect, useState, useCallback } from "react";
import { complianceApi } from "../../utils/complianceApi";
import { LoadingSpinner, ConfirmModal } from "../../components/UIComponents";
import { SectionCard, VerdictBadge, titleCase } from "./complianceHelpers";
import { ListChecks, Plus, Pencil, Trash2, Power, Info, X } from "lucide-react";
import { toast } from "react-toastify";

const CONDITIONS = [
  ["not_verified", "Business not verified"],
  ["trust_below", "Trust score below threshold"],
  ["risk_above", "Risk score above threshold"],
  ["restricted", "Account restricted / blocked"],
  ["quality_red", "WABA quality RED"],
  ["high_spam", "High spam-report rate"],
  ["high_retry", "High API retry rate"],
  ["not_ready", "Failed readiness check"],
];
const ACTIONS = [
  ["any", "Any action"],
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
const THRESHOLD_CONDITIONS = new Set(["trust_below", "risk_above", "high_spam", "high_retry"]);

const emptyRule = {
  name: "", action: "any", condition: "trust_below", threshold: 50,
  verdict: "warn", reason: "", is_active: true, priority: 100,
};

export default function PlatformRulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // rule object or null
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    complianceApi
      .get("/compliance/platform-rules/?ordering=priority")
      .then((r) => setRules(r.data.results || r.data || []))
      .catch(() => toast.error("Failed to load rules."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (rule) => {
    complianceApi
      .patch(`/compliance/platform-rules/${rule.id}/`, { is_active: !rule.is_active })
      .then(() => { toast.success(rule.is_active ? "Rule disabled." : "Rule enabled."); load(); })
      .catch(() => toast.error("Update failed."));
  };

  const remove = () => {
    const id = confirmDelete.id;
    complianceApi
      .delete(`/compliance/platform-rules/${id}/`)
      .then(() => { toast.success("Rule deleted."); setConfirmDelete(null); load(); })
      .catch(() => toast.error("Delete failed."));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-xl bg-blue-500/[0.05] border border-blue-500/15 p-3">
        <Info size={15} className="text-blue-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-400 leading-relaxed">
          Platform rules define <span className="text-slate-200 font-medium">our own</span> compliance guardrails.
          A <VerdictBadge verdict="block" /> here enforces a platform policy to guide customers toward compliant
          behaviour — it does not evade, bypass, or manipulate Meta's systems.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setEditing({ ...emptyRule })}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> New Rule
        </button>
      </div>

      {loading ? <LoadingSpinner /> : rules.length === 0 ? (
        <SectionCard>
          <p className="text-center text-sm text-slate-500 py-8">
            No platform rules yet. Create one, or seed defaults via
            <code className="mx-1 px-1.5 py-0.5 rounded bg-white/[0.05] text-amber-400 text-[11px]">manage.py seed_compliance_rules</code>.
          </p>
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rules.map((rule) => (
            <div key={rule.id} className={`bg-[#0d1120] border rounded-2xl p-4 transition-colors ${
              rule.is_active ? "border-white/[0.05]" : "border-white/[0.03] opacity-60"
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white truncate">{rule.name}</h3>
                    <VerdictBadge verdict={rule.verdict} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    On <span className="text-slate-300">{titleCase(rule.action)}</span> ·
                    when <span className="text-slate-300">{titleCase(rule.condition)}</span>
                    {THRESHOLD_CONDITIONS.has(rule.condition) && rule.threshold != null && (
                      <span className="text-amber-400"> ({rule.threshold})</span>
                    )}
                  </p>
                </div>
                <span className="text-[10px] text-slate-600 font-mono shrink-0">P{rule.priority}</span>
              </div>
              {rule.reason && <p className="text-[12px] text-slate-400 mt-2 leading-snug">{rule.reason}</p>}
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/[0.04]">
                <button onClick={() => toggle(rule)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    rule.is_active ? "text-emerald-400 hover:bg-emerald-500/10" : "text-slate-500 hover:bg-white/[0.04]"
                  }`}>
                  <Power size={12} /> {rule.is_active ? "Active" : "Disabled"}
                </button>
                <div className="flex-1" />
                <button onClick={() => setEditing(rule)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-white/[0.04] transition-colors">
                  <Pencil size={13} />
                </button>
                <button onClick={() => setConfirmDelete(rule)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/[0.04] transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <RuleModal rule={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={remove}
        title="Delete rule?"
        message={`"${confirmDelete?.name}" will be permanently removed. The Guard will stop enforcing it.`}
        confirmLabel="Delete"
        confirmColor="red"
      />
    </div>
  );
}

// ── Create / edit modal ───────────────────────────────────────────────
function RuleModal({ rule, onClose, onSaved }) {
  const [form, setForm] = useState({ ...emptyRule, ...rule });
  const [saving, setSaving] = useState(false);
  const isEdit = !!rule.id;
  const needsThreshold = THRESHOLD_CONDITIONS.has(form.condition);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name.trim()) return toast.warn("Name is required.");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      action: form.action,
      condition: form.condition,
      threshold: needsThreshold ? Number(form.threshold) || 0 : null,
      verdict: form.verdict,
      reason: form.reason.trim(),
      is_active: form.is_active,
      priority: Number(form.priority) || 100,
    };
    const req = isEdit
      ? complianceApi.patch(`/compliance/platform-rules/${rule.id}/`, payload)
      : complianceApi.post("/compliance/platform-rules/", payload);
    req
      .then(() => { toast.success(isEdit ? "Rule updated." : "Rule created."); onSaved(); })
      .catch(() => toast.error("Save failed."))
      .finally(() => setSaving(false));
  };

  const field = "w-full bg-[#0a0e17] border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/30";
  const lbl = "text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111827] border border-white/[0.06] rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ListChecks size={17} className="text-amber-400" />
            <h3 className="text-base font-bold text-white">{isEdit ? "Edit Rule" : "New Platform Rule"}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white"><X size={17} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={lbl}>Rule name</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className={field} placeholder="e.g. Block broadcasts for restricted accounts" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Applies to action</label>
              <select value={form.action} onChange={(e) => set("action", e.target.value)} className={field}>
                {ACTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Verdict</label>
              <select value={form.verdict} onChange={(e) => set("verdict", e.target.value)} className={field}>
                <option value="warn">Warn</option>
                <option value="block">Block</option>
                <option value="allow">Allow</option>
              </select>
            </div>
          </div>
          <div className={`grid gap-3 ${needsThreshold ? "grid-cols-2" : "grid-cols-1"}`}>
            <div>
              <label className={lbl}>Condition</label>
              <select value={form.condition} onChange={(e) => set("condition", e.target.value)} className={field}>
                {CONDITIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            {needsThreshold && (
              <div>
                <label className={lbl}>Threshold</label>
                <input type="number" value={form.threshold} onChange={(e) => set("threshold", e.target.value)} className={field} />
              </div>
            )}
          </div>
          <div>
            <label className={lbl}>Reason shown to operators</label>
            <textarea value={form.reason} onChange={(e) => set("reason", e.target.value)} rows={2}
              className={field + " resize-none"} placeholder="Explain why this rule triggers and what to do." />
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className={lbl}>Priority (lower = first)</label>
              <input type="number" value={form.priority} onChange={(e) => set("priority", e.target.value)} className={field} />
            </div>
            <label className="flex items-center gap-2 py-2.5 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500" />
              <span className="text-sm text-slate-300">Active</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={save} disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-colors disabled:opacity-50">
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create rule"}
          </button>
        </div>
      </div>
    </div>
  );
}
