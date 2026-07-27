// src/admin/pages/AnnouncementsPage.jsx
// SuperAdmin: create & manage platform-wide announcement banners.
// Every live announcement shows on all clients' dashboards.
import React, { useEffect, useState, useCallback } from "react";
import { adminApi } from "../utils/api";
import { LoadingSpinner, ConfirmModal } from "../components/UIComponents";
import { toast } from "react-toastify";
import {
  Megaphone, Plus, Pencil, Trash2, Power, X, Info, AlertTriangle,
  CheckCircle2, AlertOctagon,
} from "lucide-react";

const VARIANTS = [
  { value: "info",     label: "Info",     icon: Info,        cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "success",  label: "Success",  icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "warning",  label: "Warning",  icon: AlertTriangle, cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { value: "critical", label: "Critical", icon: AlertOctagon, cls: "bg-red-500/10 text-red-400 border-red-500/20" },
];
const variantMeta = (v) => VARIANTS.find((x) => x.value === v) || VARIANTS[0];

const emptyForm = {
  title: "", message: "", variant: "info",
  is_active: true, dismissible: true, starts_at: "", ends_at: "",
};

// ISO (or null) → value for <input type="datetime-local">
const toLocalInput = (iso) => (iso ? iso.slice(0, 16) : "");
// datetime-local value → ISO or null
const toPayload = (v) => (v ? new Date(v).toISOString() : null);

export default function AnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // form object or null
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.get("/announcements/")
      .then((r) => setItems(r.data.results || r.data || []))
      .catch(() => toast.error("Failed to load announcements."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (a) => {
    adminApi.patch(`/announcements/${a.id}/`, { is_active: !a.is_active })
      .then(() => { toast.success(a.is_active ? "Announcement paused." : "Announcement published."); load(); })
      .catch(() => toast.error("Update failed."));
  };

  const remove = () => {
    adminApi.delete(`/announcements/${confirmDelete.id}/`)
      .then(() => { toast.success("Announcement deleted."); setConfirmDelete(null); load(); })
      .catch(() => toast.error("Delete failed."));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <Megaphone size={19} className="text-slate-950" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">Announcements</h1>
            <p className="text-[11px] sm:text-xs text-slate-500">Banners shown on every client's dashboard</p>
          </div>
        </div>
        <button
          onClick={() => setEditing({ ...emptyForm })}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> New
        </button>
      </div>

      {loading ? <LoadingSpinner /> : items.length === 0 ? (
        <div className="bg-[#0d1120] border border-white/[0.04] rounded-2xl p-12 text-center">
          <Megaphone size={26} className="text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No announcements yet. Create one to broadcast it to all clients.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {items.map((a) => {
            const m = variantMeta(a.variant);
            const Icon = m.icon;
            return (
              <div key={a.id} className={`bg-[#0d1120] border rounded-2xl p-4 ${a.is_active ? "border-white/[0.05]" : "border-white/[0.03] opacity-60"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${m.cls}`}>
                      <Icon size={11} /> {m.label}
                    </span>
                    {a.is_live
                      ? <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live</span>
                      : <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{a.is_active ? "Scheduled" : "Paused"}</span>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggle(a)} title={a.is_active ? "Pause" : "Publish"}
                      className={`p-1.5 rounded-lg transition-colors ${a.is_active ? "text-emerald-400 hover:bg-emerald-500/10" : "text-slate-500 hover:bg-white/[0.04]"}`}>
                      <Power size={13} />
                    </button>
                    <button onClick={() => setEditing({ ...emptyForm, ...a, starts_at: toLocalInput(a.starts_at), ends_at: toLocalInput(a.ends_at) })}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-white/[0.04] transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setConfirmDelete(a)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/[0.04] transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {a.title && <h3 className="text-sm font-bold text-white mt-2.5">{a.title}</h3>}
                <p className="text-[13px] text-slate-300 mt-1 leading-snug whitespace-pre-wrap">{a.message}</p>
                <p className="text-[10px] text-slate-600 mt-2.5">
                  {a.dismissible ? "Dismissible" : "Persistent"}
                  {a.starts_at && ` · from ${new Date(a.starts_at).toLocaleString()}`}
                  {a.ends_at && ` · until ${new Date(a.ends_at).toLocaleString()}`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {editing && <AnnouncementModal form={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={remove}
        title="Delete announcement?"
        message="This banner will be permanently removed and will no longer show to clients."
        confirmLabel="Delete"
        confirmColor="red"
      />
    </div>
  );
}

function AnnouncementModal({ form, onClose, onSaved }) {
  const [f, setF] = useState({ ...emptyForm, ...form });
  const [saving, setSaving] = useState(false);
  const isEdit = !!form.id;
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const save = () => {
    if (!f.message.trim()) return toast.warn("Message is required.");
    setSaving(true);
    const payload = {
      title: f.title.trim(),
      message: f.message.trim(),
      variant: f.variant,
      is_active: f.is_active,
      dismissible: f.dismissible,
      starts_at: toPayload(f.starts_at),
      ends_at: toPayload(f.ends_at),
    };
    const req = isEdit
      ? adminApi.patch(`/announcements/${form.id}/`, payload)
      : adminApi.post("/announcements/", payload);
    req
      .then(() => { toast.success(isEdit ? "Announcement updated." : "Announcement created."); onSaved(); })
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
            <Megaphone size={17} className="text-amber-400" />
            <h3 className="text-base font-bold text-white">{isEdit ? "Edit Announcement" : "New Announcement"}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white"><X size={17} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={lbl}>Title (optional)</label>
            <input value={f.title} onChange={(e) => set("title", e.target.value)} className={field} placeholder="e.g. Scheduled maintenance" />
          </div>
          <div>
            <label className={lbl}>Message</label>
            <textarea value={f.message} onChange={(e) => set("message", e.target.value)} rows={3} className={field + " resize-none"} placeholder="What do you want all clients to see?" />
          </div>
          <div>
            <label className={lbl}>Style</label>
            <div className="grid grid-cols-4 gap-2">
              {VARIANTS.map((v) => {
                const Icon = v.icon;
                const active = f.variant === v.value;
                return (
                  <button key={v.value} type="button" onClick={() => set("variant", v.value)}
                    className={`flex flex-col items-center gap-1 py-2 rounded-xl border text-[11px] font-medium transition-colors ${active ? v.cls : "border-white/[0.06] text-slate-500 hover:text-slate-300"}`}>
                    <Icon size={15} /> {v.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Starts at (optional)</label>
              <input type="datetime-local" value={f.starts_at} onChange={(e) => set("starts_at", e.target.value)} className={field} />
            </div>
            <div>
              <label className={lbl}>Ends at (optional)</label>
              <input type="datetime-local" value={f.ends_at} onChange={(e) => set("ends_at", e.target.value)} className={field} />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={f.is_active} onChange={(e) => set("is_active", e.target.checked)} className="w-4 h-4 rounded accent-amber-500" />
              <span className="text-sm text-slate-300">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={f.dismissible} onChange={(e) => set("dismissible", e.target.checked)} className="w-4 h-4 rounded accent-amber-500" />
              <span className="text-sm text-slate-300">Dismissible</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={save} disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-colors disabled:opacity-50">
            {saving ? "Saving…" : isEdit ? "Save changes" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
