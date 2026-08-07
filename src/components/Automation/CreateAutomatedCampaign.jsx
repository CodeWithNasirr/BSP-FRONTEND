import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Users, FileText, Gauge, Rocket, ChevronRight, ChevronLeft, Check, Layers,
  Upload, Image as ImageIcon, TrendingUp,
} from "lucide-react";
import automationApi from "./api";
import VariableSubstitutionSection from "../Campaigns/VariableSubstitutionSection";

const STEPS = ["Audience", "Template", "Volume", "Review"];

// Extract unique {{1}}, {{2}}… placeholders from a template body.
const extractVariables = (body) => [...new Set((body || "").match(/{{\d+}}/g) || [])];

/**
 * Guided "Create Automated Campaign" flow for non-technical users.
 * Pick a pool → pick a template → set a daily target (optionally ramp up) → start.
 * The system then picks the best contacts each day (quality-first, then random),
 * never exceeding the target, always respecting opt-in / eligibility.
 */
export default function CreateAutomatedCampaign() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // form
  const [name, setName] = useState("");
  const [poolType, setPoolType] = useState(params.get("segment_id") ? "segment" : "all");
  const [segmentId, setSegmentId] = useState(params.get("segment_id") || "");
  const [groupName, setGroupName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [phone, setPhone] = useState("");

  // Variable mapping ({{1}} → static value or dynamic contact field)
  const [varData, setVarData] = useState({ variable_values: {}, variable_methods: {} });
  const [dailyTarget, setDailyTarget] = useState(100);
  const [progressive, setProgressive] = useState(false);
  const [progressiveDays, setProgressiveDays] = useState(7);

  // data
  const [segments, setSegments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [poolSize, setPoolSize] = useState(null);

  useEffect(() => {
    automationApi.segments().then((r) => setSegments(r.data?.data || [])).catch(() => {});
    automationApi.groups().then((r) => setGroups(r.data?.data || r.data || [])).catch(() => {});
    automationApi.templates().then((r) => setTemplates(r.data?.Data || r.data?.data || [])).catch(() => {});
  }, []);

  // Live pool size preview
  useEffect(() => {
    const p = { pool_type: poolType };
    if (poolType === "segment") { if (!segmentId) { setPoolSize(null); return; } p.segment_id = segmentId; }
    if (poolType === "group") { if (!groupName) { setPoolSize(null); return; } p.group_name = groupName; }
    if (poolType === "single") { setPoolSize(null); return; }
    setPoolSize("…");
    automationApi.poolPreview(p)
      .then((r) => setPoolSize(r.data?.pool_size ?? 0))
      .catch(() => setPoolSize(null));
  }, [poolType, segmentId, groupName]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => String(t.id) === String(templateId)),
    [templates, templateId]
  );

  const headerType = (selectedTemplate?.header_type || "").toUpperCase();
  const needsMedia = ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerType);

  // Placeholders in the selected template's body, e.g. ["{{1}}", "{{2}}"].
  const variables = useMemo(
    () => extractVariables(selectedTemplate?.body_text),
    [selectedTemplate]
  );

  // Reset media + variable mapping whenever the template changes.
  useEffect(() => {
    setMediaUrl("");
    setMediaType("");
    setVarData({ variable_values: {}, variable_methods: {} });
  }, [templateId]);

  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await automationApi.uploadMedia(file);
      setMediaUrl(res.data?.media_url || "");
      setMediaType(res.data?.media_type || "");
      toast.success("Media uploaded");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const canNext = () => {
    if (step === 0) {
      if (!name.trim()) return false;
      if (poolType === "segment") return !!segmentId;
      if (poolType === "group") return !!groupName;
      if (poolType === "single") return !!phone;
      return true;
    }
    if (step === 1) return !!templateId && (!needsMedia || !!mediaUrl);
    if (step === 2) return dailyTarget >= 1;
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const body = {
        name: name.trim(),
        template_id: parseInt(templateId, 10),
        pool_type: poolType,
        segment_id: segmentId || undefined,
        group_name: groupName || undefined,
        phone: phone || undefined,
        daily_target: parseInt(dailyTarget, 10),
        media_url: mediaUrl || undefined,
        media_type: mediaType || undefined,
        variable_values: varData.variable_values || {},
        variable_methods: varData.variable_methods || {},
        progressive_enabled: progressive,
        progressive_days: progressiveDays,
      };
      const res = await automationApi.createCampaign(body);
      toast.success("Automated campaign started");
      navigate("/automation");
      return res;
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not create campaign");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Rocket className="text-green-500" size={22} /> New Automated Campaign
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            The system sends a safe number each day and picks the best contacts for you.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-6">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${i < step ? "bg-green-500 text-white" : i === step ? "bg-green-500/15 text-green-500 ring-2 ring-green-500" : "bg-gray-200 dark:bg-gray-800 text-gray-400"}`}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-xs ${i === step ? "text-gray-900 dark:text-white font-semibold" : "text-gray-400"}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800 mx-2" />}
            </React.Fragment>
          ))}
        </div>

        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
          {/* Step 0 — Audience */}
          {step === 0 && (
            <div className="space-y-4">
              <Field label="Campaign name">
                <input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. September re-engagement"
                  className={inputCls} />
              </Field>
              <Field label="Who should receive it? (your pool)">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: "all", label: "All contacts", icon: <Users size={15} /> },
                    { v: "segment", label: "A segment", icon: <Layers size={15} /> },
                    { v: "group", label: "A group", icon: <Users size={15} /> },
                    { v: "single", label: "Single number", icon: <Users size={15} /> },
                  ].map((o) => (
                    <button key={o.v} onClick={() => setPoolType(o.v)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm
                        ${poolType === o.v ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400" : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300"}`}>
                      {o.icon} {o.label}
                    </button>
                  ))}
                </div>
              </Field>

              {poolType === "segment" && (
                <Field label="Segment">
                  <select value={segmentId} onChange={(e) => setSegmentId(e.target.value)} className={inputCls}>
                    <option value="">Select a segment…</option>
                    {segments.map((s) => (
                      <option key={s.segment_id} value={s.segment_id}>{s.name}</option>
                    ))}
                  </select>
                </Field>
              )}
              {poolType === "group" && (
                <Field label="Group">
                  <select value={groupName} onChange={(e) => setGroupName(e.target.value)} className={inputCls}>
                    <option value="">Select a group…</option>
                    {groups.map((g, i) => (
                      <option key={i} value={g.group_name || g.name}>{g.group_name || g.name}</option>
                    ))}
                  </select>
                </Field>
              )}

              {poolType === "single" && (
                <Field label="Phone Number">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+919876543210"
                    className={inputCls}
                  />
                </Field>
              )}

              {poolSize !== null && poolType !== "single" && (
                <div className="text-sm rounded-lg bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-2">
                  <b>{poolSize}</b> eligible contacts in this pool. The system will pick the best
                  ones each day up to your daily target.
                </div>
              )}
            </div>
          )}

          {/* Step 1 — Template */}
          {step === 1 && (
            <div className="space-y-4">
              <Field label="WhatsApp template">
                <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className={inputCls}>
                  <option value="">Select a template…</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.template_name}{t.status ? ` · ${t.status}` : ""}
                    </option>
                  ))}
                </select>
              </Field>
              {selectedTemplate && (
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 text-sm text-gray-600 dark:text-gray-300">
                  <FileText size={14} className="inline mr-1 text-green-500" />
                  {selectedTemplate.body_text || selectedTemplate.template_name}
                </div>
              )}

              {/* Variable mapping — appears as soon as a template with {{n}} is picked */}
              {selectedTemplate && variables.length > 0 && (
                <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Map the {variables.length} variable{variables.length > 1 ? "s" : ""} in this template
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    Choose a contact field (dynamic) or type a fixed value (static) for each placeholder.
                  </p>
                  <VariableSubstitutionSection
                    variables={variables}
                    formData={varData}
                    setFormData={setVarData}
                    template={selectedTemplate}
                  />
                </div>
              )}

              {/* Media upload for image/video/document header templates */}
              {needsMedia && (
                <Field label={`${headerType.charAt(0) + headerType.slice(1).toLowerCase()} for this template`}>
                  {mediaUrl ? (
                    <div className="flex items-center gap-3">
                      {mediaType === "image" ? (
                        <img src={mediaUrl} alt="header"
                          className="h-16 w-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <ImageIcon size={20} className="text-green-500" />
                        </div>
                      )}
                      <div className="text-sm">
                        <p className="text-green-600 dark:text-green-400 font-medium">Media ready</p>
                        <button onClick={() => { setMediaUrl(""); setMediaType(""); }}
                          className="text-xs text-gray-400 hover:text-gray-600">Replace</button>
                      </div>
                    </div>
                  ) : (
                    <label className={`flex items-center justify-center gap-2 px-3 py-4 rounded-lg border border-dashed cursor-pointer text-sm
                      ${uploading ? "opacity-60" : "hover:border-green-500"} border-gray-300 dark:border-gray-700 text-gray-500`}>
                      <Upload size={16} />
                      {uploading ? "Uploading…" : `Upload ${headerType.toLowerCase()}`}
                      <input type="file" className="hidden" disabled={uploading}
                        accept={headerType === "IMAGE" ? "image/*" : headerType === "VIDEO" ? "video/*" : ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"}
                        onChange={handleMediaUpload} />
                    </label>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    This template has a {headerType.toLowerCase()} header — the file is required and
                    will be sent with every message.
                  </p>
                </Field>
              )}

              <p className="text-xs text-gray-400">
                Only approved templates can be delivered by WhatsApp. You can change the template
                later without stopping the campaign.
              </p>
            </div>
          )}

          {/* Step 2 — Volume */}
          {step === 2 && (
            <div className="space-y-4">
              <Field label="Daily message target">
                <div className="flex items-center gap-2">
                  <Gauge size={16} className="text-green-500" />
                  <input type="number" min="1" value={dailyTarget}
                    onChange={(e) => setDailyTarget(e.target.value)} className={`${inputCls} max-w-[140px]`} />
                  <span className="text-sm text-gray-400">messages per day</span>
                </div>
              </Field>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The system will send <b>at most {dailyTarget || 0}</b> messages per day and choose
                the highest-quality eligible contacts first (ties broken randomly). It never
                exceeds this number.
              </p>

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={progressive} onChange={(e) => setProgressive(e.target.checked)}
                  className="mt-1 accent-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <b>Warm up gradually</b> — start smaller and ramp up to the target over several
                  days (recommended for new numbers or large pools).
                </span>
              </label>
              {progressive && (
                <Field label="Ramp-up period">
                  <div className="flex items-center gap-2">
                    <input type="number" min="2" max="60" value={progressiveDays}
                      onChange={(e) => setProgressiveDays(e.target.value)} className={`${inputCls} max-w-[110px]`} />
                    <span className="text-sm text-gray-400">days to reach {dailyTarget}/day</span>
                  </div>
                </Field>
              )}

              {/* Optional: link to the multi-day quality-conversation planner */}
              <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-3 flex items-start gap-2">
                <TrendingUp size={15} className="text-green-500 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Trying to grow your messaging limit over several days?{" "}
                  <button type="button" onClick={() => navigate("/automation/progression")}
                    className="text-green-600 dark:text-green-400 font-medium hover:underline">
                    Create a Growth (Progression) Plan
                  </button>{" "}
                  — it targets a set number of quality conversations across days while staying
                  within your current limit.
                </p>
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="space-y-3">
              <Review label="Campaign" value={name} />
              <Review label="Pool" value={
                poolType === "segment" ? `Segment · ${segments.find((s) => s.segment_id === segmentId)?.name || ""}`
                  : poolType === "group" ? `Group · ${groupName}`
                  : poolType === "all" ? "All contacts" : "Single number"
              } extra={poolSize !== null && poolType !== "single" ? `${poolSize} contacts` : null} />
              <Review label="Template" value={selectedTemplate?.template_name || "—"} />
              {needsMedia && <Review label="Header media" value={mediaUrl ? "Attached" : "Missing"} />}
              <Review label="Daily target" value={`${dailyTarget} / day`} />
              <Review label="Warm-up" value={progressive ? `Ramp over ${progressiveDays} days` : "Off (fixed)"} />
              <div className="text-xs text-gray-400 pt-2">
                Starting will immediately prepare today's batch. You can pause, change the
                template, or adjust the daily target any time from the dashboard.
              </div>
            </div>
          )}

          {/* Nav */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button onClick={() => (step === 0 ? navigate("/automation") : setStep(step - 1))}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
              <ChevronLeft size={16} /> {step === 0 ? "Cancel" : "Back"}
            </button>
            {step < STEPS.length - 1 ? (
              <button disabled={!canNext()} onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button disabled={submitting} onClick={submit}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                <Rocket size={16} /> {submitting ? "Starting…" : "Start automation"}
              </button>
            )}
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

function Review({ label, value, extra }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-900 dark:text-white font-medium text-right">
        {value} {extra && <span className="text-xs text-gray-400">({extra})</span>}
      </span>
    </div>
  );
}
