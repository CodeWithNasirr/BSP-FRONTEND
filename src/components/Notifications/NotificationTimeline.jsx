/**
 * NotificationTimeline.jsx
 * ════════════════════════
 *
 * System notification history displayed as a vertical timeline.
 * Each dot = one system action (expiry reminder sent, payment alert, etc.)
 *
 * Features:
 *   - Infinite scroll with intersection observer
 *   - Filter chips (type + status)
 *   - Search bar
 *   - Date range filter
 *   - Stats summary cards
 *   - Expandable message detail
 *   - Staggered Framer Motion animations
 *   - Responsive mobile-first layout
 *
 * API consumed:
 *   GET /api/notifications/timeline/?type=&status=&search=&page=
 *   GET /api/notifications/stats/
 *
 * Route:
 *   <Route path="/notifications" element={<NotificationTimeline />} />
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import API_BASE_URL from "../../config";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const TYPE_FILTERS = [
     { key: "", label: "All" },
     { key: "EXPIRY_SINGLE", label: "Single Expiry" },
     { key: "EXPIRY_SUMMARY", label: "Summary" },
     { key: "CLIENT_RENEWAL_3D", label: "Renewal 3-Day" },
     { key: "CLIENT_RENEWAL_2D", label: "Renewal 2-Day" },
     { key: "CLIENT_RENEWAL_TODAY", label: "Renewal Today" },
     { key: "RENEWAL_REMINDER", label: "Renewal" },
     { key: "PAYMENT_REMINDER", label: "Payment" },
    { key: "SYSTEM_ALERT", label: "System" },
];

const STATUS_FILTERS = [
  { key: "", label: "All Status" },
  { key: "sent", label: "Sent" },
  { key: "delivered", label: "Delivered" },
  { key: "read", label: "Read" },
  { key: "failed", label: "Failed" },
  { key: "pending", label: "Pending" },
];

const STATUS_CONFIG = {
  sent:      { color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", label: "Sent" },
  delivered: { color: "bg-blue-500",    text: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",    label: "Delivered" },
  read:      { color: "bg-violet-500",  text: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200",  label: "Read" },
  failed:    { color: "bg-red-500",     text: "text-red-700",     bg: "bg-red-50",     border: "border-red-200",     label: "Failed" },
  pending:   { color: "bg-amber-500",   text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   label: "Pending" },
};

const TYPE_ICONS = {
     EXPIRY_SINGLE:       "⏰",
     EXPIRY_SUMMARY:      "📋",
     CLIENT_RENEWAL_3D:   "🟡",
     CLIENT_RENEWAL_2D:   "🟠",
     CLIENT_RENEWAL_TODAY: "🔴",
     RENEWAL_REMINDER:    "🔄",
     PAYMENT_REMINDER:    "💳",
     SYSTEM_ALERT:        "⚡",
   };

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const NotificationTimeline = () => {
  const token = localStorage.getItem("authToken");

  // ── Data state ─────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ── Filter state ───────────────────────────────────────────────────
  const [activeType, setActiveType] = useState("");
  const [activeStatus, setActiveStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ── UI state ───────────────────────────────────────────────────────
  const [expandedId, setExpandedId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // ── Refs ────────────────────────────────────────────────────────────
  const sentinelRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // ── Auth headers ───────────────────────────────────────────────────
  const headers = { Authorization: `Token ${token}` };

  // ═══════════════════════════════════════════════════════════════════
  // FETCH: Stats
  // ═══════════════════════════════════════════════════════════════════

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/notifications/stats/`, { headers });
      if (isMountedRef.current) setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch notification stats:", err);
    }
  }, [token]);

  // ═══════════════════════════════════════════════════════════════════
  // FETCH: Timeline (paginated)
  // ═══════════════════════════════════════════════════════════════════

  const fetchNotifications = useCallback(
    async (pageNum = 1, append = false) => {
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const params = new URLSearchParams();
        params.set("page", pageNum);
        params.set("page_size", "15");
        if (activeType) params.set("type", activeType);
        if (activeStatus) params.set("status", activeStatus);
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        if (dateFrom) params.set("date_from", dateFrom);
        if (dateTo) params.set("date_to", dateTo);

        const res = await axios.get(
          `${API_BASE_URL}/api/notifications/timeline/?${params.toString()}`,
          { headers }
        );
        if (!isMountedRef.current) return;

        const { results, count, next } = res.data;

        setTotalCount(count);
        setHasMore(!!next);

        if (append) {
          setNotifications((prev) => [...prev, ...results]);
        } else {
          setNotifications(results);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [token, activeType, activeStatus, searchQuery, dateFrom, dateTo]
  );

  // ── Initial load + refetch on filter change ────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    setPage(1);
    fetchNotifications(1, false);
    fetchStats();
    return () => { isMountedRef.current = false; };
  }, [activeType, activeStatus, dateFrom, dateTo]);

  // ── Debounced search ───────────────────────────────────────────────
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchNotifications(1, false);
    }, 400);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  // ── Infinite scroll via IntersectionObserver ───────────────────────
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchNotifications(nextPage, true);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, page]);

  // ═══════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════

  const groupByDate = (items) => {
    const groups = {};
    for (const item of items) {
      const dateKey = new Date(item.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    }
    return groups;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const grouped = groupByDate(notifications);
  const dateKeys = Object.keys(grouped);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                System Notifications
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {totalCount} notification{totalCount !== 1 ? "s" : ""} · Automated system messages
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {(activeType || activeStatus || dateFrom || dateTo) && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* ── Stats Cards ────────────────────────────────────────── */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
          >
            <StatsCard
              label="Total Sent"
              value={stats.by_status?.sent || 0}
              accent="emerald"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatsCard
              label="Today"
              value={stats.today || 0}
              accent="blue"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatsCard
              label="Delivered"
              value={stats.by_status?.delivered || 0}
              accent="violet"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              }
            />
            <StatsCard
              label="Failed"
              value={stats.by_status?.failed || 0}
              accent="red"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              }
            />
          </motion.div>
        )}

        {/* ── Filters Panel ──────────────────────────────────────── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                {/* Search */}
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by client name, template, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                  />
                </div>

                {/* Type chips */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Type</p>
                  <div className="flex flex-wrap gap-2">
                    {TYPE_FILTERS.map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setActiveType(f.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          activeType === f.key
                            ? "bg-gray-900 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status chips */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setActiveStatus(f.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          activeStatus === f.key
                            ? "bg-gray-900 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {f.key && (
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${STATUS_CONFIG[f.key]?.color || ""}`} />
                        )}
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date range */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="mt-1 w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="mt-1 w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    />
                  </div>
                  {(dateFrom || dateTo) && (
                    <button
                      onClick={() => { setDateFrom(""); setDateTo(""); }}
                      className="self-end px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Clear dates
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Timeline ───────────────────────────────────────────── */}
        {isLoading ? (
          <TimelineSkeleton />
        ) : notifications.length === 0 ? (
          <EmptyState hasFilters={!!(activeType || activeStatus || searchQuery || dateFrom || dateTo)} />
        ) : (
          <div className="relative">
            {dateKeys.map((dateLabel, dateIdx) => (
              <div key={dateLabel} className="mb-8">
                {/* Date header */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: dateIdx * 0.05, duration: 0.3 }}
                  className="sticky top-0 z-10 mb-4"
                >
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {dateLabel}
                  </span>
                </motion.div>

                {/* Timeline entries for this date */}
                <div className="relative ml-4 sm:ml-6">
                  {/* Vertical line */}
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-gray-300 via-gray-200 to-transparent" />

                  {grouped[dateLabel].map((notif, idx) => (
                    <TimelineEntry
                      key={notif.id}
                      notif={notif}
                      index={idx}
                      isExpanded={expandedId === notif.id}
                      onToggle={() => setExpandedId(expandedId === notif.id ? null : notif.id)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4" />

            {isLoadingMore && (
              <div className="flex justify-center py-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading more...
                </div>
              </div>
            )}

            {!hasMore && notifications.length > 0 && (
              <div className="text-center py-8 text-sm text-gray-400">
                End of timeline · {totalCount} total notifications
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE ENTRY
// ═══════════════════════════════════════════════════════════════════════════

const TimelineEntry = ({ notif, index, isExpanded, onToggle }) => {
  const statusCfg = STATUS_CONFIG[notif.status] || STATUS_CONFIG.pending;
  const typeIcon = TYPE_ICONS[notif.notification_type] || "📨";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative pl-10 pb-6 group"
    >
      {/* Timeline dot */}
      <div className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${statusCfg.color} ring-2 ring-white`} />

      {/* Card */}
      <div
        onClick={onToggle}
        className={`bg-white rounded-xl border transition-all duration-200 cursor-pointer
          ${isExpanded ? "border-gray-300 shadow-md" : "border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"}`}
      >
        {/* Header row */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              {/* Type icon */}
              <span className="text-lg leading-none mt-0.5 flex-shrink-0">{typeIcon}</span>
              <div className="min-w-0">
                {/* Template name */}
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {notif.template_name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </p>
                {/* Recipient + client */}
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  To: {notif.recipient_name || notif.recipient_phone}
                  {notif.client_name && (
                    <span className="text-gray-400"> · {notif.client_name}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Status badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.color}`} />
                {statusCfg.label}
              </span>

              {/* Time */}
              <span className="text-xs text-gray-400 tabular-nums hidden sm:block">
                {notif.time_ago}
              </span>

              {/* Expand chevron */}
              <motion.svg
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-4 h-4 text-gray-400"
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </div>
          </div>
        </div>

        {/* Expanded detail */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-gray-100">
                {/* Message content */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Message Content</p>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {notif.message_content}
                  </pre>
                </div>

                {/* Metadata grid */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <MetaField label="Type" value={notif.notification_type.replace(/_/g, " ")} />
                  <MetaField label="Phone" value={notif.recipient_phone} />
                  <MetaField label="Time" value={new Date(notif.created_at).toLocaleString()} />
                  {notif.meta_message_id && (
                    <MetaField label="Message ID" value={notif.meta_message_id} mono />
                  )}
                  {notif.related_client_ids?.length > 0 && (
                    <MetaField label="Clients Involved" value={`${notif.related_client_ids.length} client(s)`} />
                  )}
                  {notif.error_detail && (
                    <div className="col-span-full">
                      <MetaField label="Error" value={notif.error_detail} error />
                    </div>
                  )}
                </div>

                {/* Template variables */}
                {notif.template_variables?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Template Variables</p>
                    <div className="flex flex-wrap gap-1.5">
                      {notif.template_variables.map((v, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                          <span className="text-gray-400 font-mono">{`{{${i + 1}}}`}</span>
                          <span className="truncate max-w-[200px]">{String(v)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const MetaField = ({ label, value, mono = false, error = false }) => (
  <div>
    <p className="text-gray-400 font-medium uppercase tracking-wider mb-0.5" style={{ fontSize: "10px" }}>{label}</p>
    <p className={`text-gray-700 truncate ${mono ? "font-mono text-[11px]" : "text-xs"} ${error ? "text-red-600" : ""}`}>
      {value}
    </p>
  </div>
);

const StatsCard = ({ label, value, accent, icon }) => {
  const accents = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
    blue:    { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-100" },
    violet:  { bg: "bg-violet-50",  text: "text-violet-600",  border: "border-violet-100" },
    red:     { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-100" },
  };
  const a = accents[accent] || accents.emerald;

  return (
    <div className={`${a.bg} border ${a.border} rounded-xl p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className={`text-2xl font-bold ${a.text} mt-1 tabular-nums`}>{value}</p>
        </div>
        <div className={`${a.text} opacity-60`}>{icon}</div>
      </div>
    </div>
  );
};

const TimelineSkeleton = () => (
  <div className="animate-pulse space-y-6 mt-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-4 ml-6">
        <div className="w-3 h-3 rounded-full bg-gray-200 mt-2 flex-shrink-0" />
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ hasFilters }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1">
      {hasFilters ? "No matching notifications" : "No notifications yet"}
    </h3>
    <p className="text-sm text-gray-500 max-w-sm">
      {hasFilters
        ? "Try adjusting your filters or search query."
        : "System notifications will appear here when subscription reminders are sent."}
    </p>
  </motion.div>
);

export default NotificationTimeline;