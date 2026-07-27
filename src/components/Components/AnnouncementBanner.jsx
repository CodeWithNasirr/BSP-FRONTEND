// src/components/Components/AnnouncementBanner.jsx
// Shows platform-wide announcement banners (set by SuperAdmin) on the client
// dashboard. Dismissible banners are remembered per-announcement in
// localStorage, and re-appear if the SuperAdmin edits them (keyed by updated_at).
import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import { Info, CheckCircle2, AlertTriangle, AlertOctagon, X } from "lucide-react";

const VARIANT_STYLES = {
  info: {
    icon: Info,
    box: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50",
    icon_c: "text-blue-600 dark:text-blue-400",
    title_c: "text-blue-900 dark:text-blue-200",
    text_c: "text-blue-800 dark:text-blue-300/90",
  },
  success: {
    icon: CheckCircle2,
    box: "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900/50",
    icon_c: "text-green-600 dark:text-green-400",
    title_c: "text-green-900 dark:text-green-200",
    text_c: "text-green-800 dark:text-green-300/90",
  },
  warning: {
    icon: AlertTriangle,
    box: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50",
    icon_c: "text-amber-600 dark:text-amber-400",
    title_c: "text-amber-900 dark:text-amber-200",
    text_c: "text-amber-800 dark:text-amber-300/90",
  },
  critical: {
    icon: AlertOctagon,
    box: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50",
    icon_c: "text-red-600 dark:text-red-400",
    title_c: "text-red-900 dark:text-red-200",
    text_c: "text-red-800 dark:text-red-300/90",
  },
};

const DISMISS_KEY = "dismissedAnnouncements"; // { [id]: updated_at }

const readDismissed = () => {
  try { return JSON.parse(localStorage.getItem(DISMISS_KEY)) || {}; }
  catch { return {}; }
};

const AnnouncementBanner = () => {
  const token = localStorage.getItem("authToken");
  const [items, setItems] = useState([]);
  const [dismissed, setDismissed] = useState(readDismissed);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_BASE_URL}/api/announcements/active/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setItems(res.data.announcements || []))
      .catch(() => { /* banners are non-critical — fail silently */ });
  }, [token]);

  const dismiss = (a) => {
    const next = { ...dismissed, [a.id]: a.updated_at };
    setDismissed(next);
    localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
  };

  // Hide banners already dismissed at their current version.
  const visible = items.filter((a) => !(a.dismissible && dismissed[a.id] === a.updated_at));
  if (visible.length === 0) return null;

  return (
    <div className="px-4 lg:px-6 pt-4 space-y-2.5">
      {visible.map((a) => {
        const s = VARIANT_STYLES[a.variant] || VARIANT_STYLES.info;
        const Icon = s.icon;
        return (
          <div key={a.id} className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${s.box}`}>
            <Icon size={18} className={`shrink-0 mt-0.5 ${s.icon_c}`} />
            <div className="min-w-0 flex-1">
              {a.title && <p className={`text-sm font-semibold ${s.title_c}`}>{a.title}</p>}
              <p className={`text-sm leading-snug whitespace-pre-wrap ${s.text_c} ${a.title ? "mt-0.5" : ""}`}>
                {a.message}
              </p>
            </div>
            {a.dismissible && (
              <button
                onClick={() => dismiss(a)}
                aria-label="Dismiss"
                className={`shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${s.icon_c}`}
              >
                <X size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementBanner;
