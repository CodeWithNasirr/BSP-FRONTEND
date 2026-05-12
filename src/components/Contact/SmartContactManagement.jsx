// ═══════════════════════════════════════════════════════════════════════════════
// contacts/SmartContactManagement.jsx
// Main page for Smart Contact Management — Full theme support + Mobile Drawer Pattern
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";

// Hooks
import {
  useContactStats,
  useSmartContacts,
  useExportHistory,
  useContactExport,
  useBulkActions,
} from "./hooks/useSmartContacts";
import { useContactSelection } from "./hooks/useContactSelection";

// Components
import {
  StatusBadge,
  StatsCards,
  StatusFilterTabs,
  SmartBulkActionsBar,
  SmartEmptyState,
} from "./components/SmartComponents";
import { ExportModal, ExportHistoryPanel } from "./components/ExportModal";

// ─────────────────────────────────────────────────────────────────────────────
// SMART CONTACT LIST ITEM (with status badge) — Full theme support
// ─────────────────────────────────────────────────────────────────────────────

const SmartContactItem = memo(
  ({ contact, isSelected, onSelect, onView }) => {
    const handleCheckbox = (e) => {
      e.stopPropagation();
      onSelect(contact.id);
    };

    return (
      <div
        className={`
          group flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all duration-200
          border-b border-gray-100 dark:border-white/5
          hover:bg-gray-50/80 dark:hover:bg-white/5
          ${isSelected ? "bg-blue-50/80 dark:bg-blue-500/10 border-l-2 border-l-blue-500 dark:border-l-blue-400" : "border-l-2 border-l-transparent"}
        `}
        onClick={() => onView(contact)}
      >
        {/* Checkbox */}
        <label
          className="cursor-pointer flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckbox}
            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
          />
        </label>

        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center font-semibold text-sm shadow-sm ring-2 ring-white dark:ring-white/10">
          {contact.full_name?.[0]?.toUpperCase() || "?"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {contact.full_name}
            </h4>
            <StatusBadge status={contact.export_status} size="dot" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {contact.phone_number}
          </p>
        </div>

        {/* Status badge (right side) */}
        <div className="flex-shrink-0 hidden sm:block">
          <StatusBadge status={contact.export_status} />
        </div>

        {/* Chevron for mobile */}
        <svg 
          className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 sm:hidden group-hover:text-gray-400 transition-colors" 
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
        </svg>
      </div>
    );
  },
  (prev, next) =>
    prev.contact.id === next.contact.id &&
    prev.isSelected === next.isSelected &&
    prev.contact.export_status === next.contact.export_status
);

SmartContactItem.displayName = "SmartContactItem";

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT DETAIL PANEL (right side) — Full theme support + Mobile optimized
// ─────────────────────────────────────────────────────────────────────────────

const ContactDetailPanel = memo(({ contact, onMarkSaved, onExportSingle, isProcessing, onClose }) => {
  if (!contact) return null;

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Mobile Close Button */}
      <div className="md:hidden flex justify-end mb-4">
        <button
          onClick={onClose}
          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-white dark:ring-white/5">
          {contact.full_name?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
            {contact.full_name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{contact.phone_number}</p>
          <div className="mt-1">
            <StatusBadge status={contact.export_status} />
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">
            Source
          </p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {contact.source || "—"}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">
            Email
          </p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
            {contact.email || "—"}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">
            First Message
          </p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {formatDate(contact.first_message_at)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">
            Last Activity
          </p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {formatDate(contact.last_interaction)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">
            Purchases
          </p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {contact.total_purchases || 0}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">
            Total Spent
          </p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            ₹{contact.total_spent || "0.00"}
          </p>
        </div>
      </div>

      {/* Tags */}
      {contact.tags?.length > 0 && (
        <div className="mb-6">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-2">
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {contact.tags.map((tag, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-full font-medium border border-gray-200 dark:border-white/5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200 dark:border-white/10">
        {contact.export_status !== "SAVED" && (
          <button
            onClick={() => onMarkSaved([contact.id])}
            disabled={isProcessing}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl hover:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Mark as Saved
          </button>
        )}
        <button
          onClick={() => onExportSingle(contact.id)}
          disabled={isProcessing}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-500 dark:hover:bg-indigo-400 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-indigo-500/25 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export VCF
        </button>
      </div>
    </div>
  );
});

ContactDetailPanel.displayName = "ContactDetailPanel";

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT — Full theme support + Mobile Drawer Pattern
// ═══════════════════════════════════════════════════════════════════════════════

const SmartContactManagement = () => {
  const token = localStorage.getItem("authToken");

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [rightPanel, setRightPanel] = useState("welcome"); // welcome | detail | history
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  // Debounced search
  const debouncedSetSearch = useCallback(
    debounce((val) => setDebouncedSearch(val), 400),
    []
  );
  useEffect(() => () => debouncedSetSearch.cancel(), [debouncedSetSearch]);

  const handleSearchChange = useCallback(
    (e) => {
      setSearchInput(e.target.value);
      debouncedSetSearch(e.target.value);
    },
    [debouncedSetSearch]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════════════════════
  const { stats, isLoading: statsLoading, refresh: refreshStats } = useContactStats(token);
  const {
    contacts,
    totalCount,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    refresh: refreshContacts,
  } = useSmartContacts(token, { search: debouncedSearch, status: statusFilter });

  const { exports: exportHistory, isLoading: historyLoading, refresh: refreshHistory } = useExportHistory(token);
  const { isExporting, exportContacts, downloadPastExport } = useContactExport(token);
  const { isProcessing, updateStatus, updateTags } = useBulkActions(token);

  const {
    selectedIds,
    selectedCount,
    isAllSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  } = useContactSelection(contacts);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleViewContact = useCallback((contact) => {
    setSelectedContact(contact);
    setRightPanel("detail");
    setIsMobilePanelOpen(true);
    clearSelection();
  }, [clearSelection]);

  const handleStatusFilterChange = useCallback((status) => {
    setStatusFilter(status);
    setSelectedContact(null);
    setRightPanel("welcome");
    setIsMobilePanelOpen(false);
    clearSelection();
  }, [clearSelection]);

  const handleCardClick = useCallback((key) => {
    const statusMap = { new: "NEW", exported: "EXPORTED", saved: "SAVED" };
    if (statusMap[key]) {
      setStatusFilter(statusMap[key]);
    } else {
      setStatusFilter("");
    }
    setIsMobilePanelOpen(false);
    clearSelection();
  }, [clearSelection]);

  const handleClosePanel = useCallback(() => {
    setIsMobilePanelOpen(false);
    setSelectedContact(null);
    setRightPanel("welcome");
  }, []);

  const handleOpenHistory = useCallback(() => {
    setRightPanel("history");
    setSelectedContact(null);
    setIsMobilePanelOpen(true);
  }, []);

  const handleExport = useCallback(
    async (options) => {
      if (options.export_type === "SELECTED") {
        options.contact_ids = selectedIds;
      }
      const result = await exportContacts(options);
      if (result) {
        refreshStats();
        refreshContacts();
        refreshHistory();
        clearSelection();
      }
      return result;
    },
    [selectedIds, exportContacts, refreshStats, refreshContacts, refreshHistory, clearSelection]
  );

  const handleMarkSaved = useCallback(
    async (ids) => {
      const targets = ids || selectedIds;
      const result = await updateStatus(targets, "SAVED");
      if (result) {
        refreshStats();
        refreshContacts();
        clearSelection();
        if (selectedContact && targets.includes(selectedContact.id)) {
          setSelectedContact((prev) => prev ? { ...prev, export_status: "SAVED" } : null);
        }
      }
    },
    [selectedIds, selectedContact, updateStatus, refreshStats, refreshContacts, clearSelection]
  );

  const handleMarkExported = useCallback(async () => {
    const result = await updateStatus(selectedIds, "EXPORTED");
    if (result) {
      refreshStats();
      refreshContacts();
      clearSelection();
    }
  }, [selectedIds, updateStatus, refreshStats, refreshContacts, clearSelection]);

  const handleAddTags = useCallback(
    async (tags) => {
      const result = await updateTags(selectedIds, "add", tags);
      if (result) {
        refreshContacts();
        clearSelection();
      }
    },
    [selectedIds, updateTags, refreshContacts, clearSelection]
  );

  const handleExportSingle = useCallback(
    async (contactId) => {
      const result = await exportContacts({
        export_type: "SELECTED",
        contact_ids: [contactId],
      });
      if (result) {
        refreshStats();
        refreshContacts();
        refreshHistory();
      }
    },
    [exportContacts, refreshStats, refreshContacts, refreshHistory]
  );

  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    setDebouncedSearch("");
    setStatusFilter("");
    setIsMobilePanelOpen(false);
    clearSelection();
  }, [clearSelection, debouncedSetSearch]);

  // Infinite scroll refs
  const listRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    const container = listRef.current;
    if (!trigger || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadMore();
        }
      },
      { root: container, rootMargin: "200px", threshold: 0 }
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="h-screen flex flex-col w-full min-w-0 bg-gray-50 dark:bg-[#0b1120] transition-colors duration-300 overflow-hidden">

      {/* Stats Cards (top bar) */}
      <div className="shrink-0">
        <StatsCards stats={stats} isLoading={statsLoading} onCardClick={handleCardClick} />
      </div>

      <div className="flex flex-1 overflow-hidden relative">

        {/* ═══════════════════════════════════════════════════════════════════
            LEFT PANEL — Contact List
            Mobile: full width, hidden when panel open
            Desktop: 30-35% width
        ═══════════════════════════════════════════════════════════════════ */}
        <div className={`
          flex flex-col h-full bg-white dark:bg-[#0b1120]
          border-r border-gray-200 dark:border-white/5
          transition-all duration-300 ease-in-out
          w-full md:w-[35%] lg:w-[30%]
          ${isMobilePanelOpen ? 'hidden md:flex' : 'flex'}
        `}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Contacts</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{totalCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleOpenHistory}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"
                title="Export History"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-500 dark:hover:bg-indigo-400 transition-all duration-200 shadow-sm active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 pb-2 shrink-0">
            <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#111827] transition-all duration-200 focus-within:border-blue-400 dark:focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 dark:focus-within:ring-blue-400/20">
              <span className="pl-3 text-gray-400 dark:text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15 15l6 6m-11-4a7 7 0 110-14 7 7 0 010 14z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search by name or phone"
                className="w-full py-2.5 px-2 text-sm outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setDebouncedSearch("");
                  }}
                  className="pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Status Filter Tabs */}
          <StatusFilterTabs
            activeStatus={statusFilter}
            onChange={handleStatusFilterChange}
            counts={{
              total: stats.total,
              new: stats.new,
              exported: stats.exported,
              saved: stats.saved,
            }}
          />

          {/* Bulk Actions */}
          <SmartBulkActionsBar
            selectedCount={selectedCount}
            totalCount={contacts.length}
            isAllSelected={isAllSelected}
            onSelectAll={toggleSelectAll}
            onExportSelected={() => setShowExportModal(true)}
            onMarkSaved={() => handleMarkSaved()}
            onMarkExported={handleMarkExported}
            onAddTags={handleAddTags}
            isProcessing={isProcessing}
          />

          {/* Contact List */}
          <div className="flex-1 overflow-hidden">
            {isLoading && contacts.length === 0 ? (
              <div className="h-full overflow-hidden bg-white dark:bg-[#0b1120]">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-white/5 animate-pulse">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-white/10 rounded" />
                    <div className="w-10 h-10 bg-gray-200 dark:bg-white/10 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-gray-200 dark:bg-white/10 rounded-lg w-2/3" />
                      <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-lg w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : contacts.length === 0 ? (
              <SmartEmptyState
                hasFilters={!!debouncedSearch}
                statusFilter={statusFilter}
                onClear={handleClearFilters}
              />
            ) : (
              <div
                ref={listRef}
                className="h-full overflow-y-auto scrollbar-thin bg-white dark:bg-[#0b1120]"
              >
                {contacts.map((contact) => (
                  <SmartContactItem
                    key={contact.id}
                    contact={contact}
                    isSelected={selectedIds.includes(contact.id)}
                    onSelect={toggleSelect}
                    onView={handleViewContact}
                  />
                ))}

                {/* Infinite scroll trigger */}
                <div ref={triggerRef} className="h-4" />

                {isLoadingMore && (
                  <div className="flex items-center justify-center py-5 gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Loading more...</span>
                  </div>
                )}

                {!hasMore && contacts.length > 10 && (
                  <div className="text-center py-3 text-[11px] text-gray-400 dark:text-gray-600 font-medium tracking-wide">
                    — End of contacts —
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            RIGHT PANEL — Detail / History / Welcome
            Mobile: fixed overlay slide-in
            Desktop: flex-1 side panel
        ═══════════════════════════════════════════════════════════════════ */}
        <div className={`
          flex-col h-full bg-gray-50 dark:bg-[#0b1120]
          transition-all duration-300 ease-in-out
          w-full md:flex md:flex-1
          ${isMobilePanelOpen ? 'flex fixed inset-0 z-50 md:static md:z-auto' : 'hidden md:flex'}
        `}>

          {/* Mobile Header */}
          {isMobilePanelOpen && (
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-white/5 shrink-0">
              <button 
                onClick={handleClosePanel}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold text-sm active:scale-95 transition-transform"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
                Back
              </button>
              <h2 className="font-bold text-gray-900 dark:text-white text-base">
                {rightPanel === "detail" ? "Contact Details" : rightPanel === "history" ? "Export History" : "Smart Contacts"}
              </h2>
              <div className="w-14" />
            </div>
          )}

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between px-6 py-4 bg-white dark:bg-[#111827]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 shrink-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {rightPanel === "detail" ? "Contact Details" : rightPanel === "history" ? "Export History" : "Smart Contacts"}
            </h2>
            {rightPanel !== "welcome" && (
              <button
                onClick={handleClosePanel}
                className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              >
                Close
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {rightPanel === "detail" && selectedContact && (
              <ContactDetailPanel
                contact={selectedContact}
                onMarkSaved={handleMarkSaved}
                onExportSingle={handleExportSingle}
                isProcessing={isProcessing || isExporting}
                onClose={handleClosePanel}
              />
            )}

            {rightPanel === "history" && (
              <div className="p-4 sm:p-6">
                <ExportHistoryPanel
                  exports={exportHistory}
                  isLoading={historyLoading}
                  onDownload={downloadPastExport}
                  onClose={handleClosePanel}
                />
              </div>
            )}

            {rightPanel === "welcome" && (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center px-6 max-w-sm">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-500/20 dark:to-indigo-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-white dark:ring-white/5">
                    <svg className="w-10 h-10 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Smart Contact Management
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Select a contact to view details, or use the export button to
                    download contacts as VCF for your phone.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="w-full px-4 py-3 text-sm font-bold bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-500 dark:hover:bg-indigo-400 transition-all duration-200 shadow-lg shadow-indigo-500/25 active:scale-95"
                    >
                      Export Contacts
                    </button>
                    <button
                      onClick={handleOpenHistory}
                      className="w-full px-4 py-3 text-sm font-bold bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200 active:scale-95"
                    >
                      View Export History
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          EXPORT MODAL (overlay)
      ═══════════════════════════════════════════════════════════════════ */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        isExporting={isExporting}
        selectedCount={selectedCount}
      />
    </div>
  );
};

export default SmartContactManagement;