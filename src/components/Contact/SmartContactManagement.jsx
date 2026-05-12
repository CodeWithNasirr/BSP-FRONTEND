// ═══════════════════════════════════════════════════════════════════════════════
// contacts/SmartContactManagement.jsx
// Main page for Smart Contact Management
//
// Follows the exact same layout pattern as ContactManagement.jsx:
//   Left panel (30%) = list + filters
//   Right panel (70%) = detail / actions
//
// Reuses existing hooks pattern, TailwindCSS, and component structure.
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
// SMART CONTACT LIST ITEM (with status badge)
// ─────────────────────────────────────────────────────────────────────────────

const SmartContactItem = memo(
  ({ contact, isSelected, onSelect, onView }) => {
    const handleCheckbox = (e) => {
      e.stopPropagation();
      onSelect(contact.id);
    };

    return (
      <div
        className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-gray-50 transition-colors ${
          isSelected ? "bg-blue-50" : ""
        }`}
        onClick={() => onView(contact)}
      >
        {/* Checkbox */}
        <label
          className="cursor-pointer flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckbox}
            className="w-4 h-4 rounded accent-blue-600"
          />
        </label>

        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-medium text-sm">
          {contact.full_name?.[0]?.toUpperCase() || "?"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {contact.full_name}
            </h4>
            <StatusBadge status={contact.export_status} size="dot" />
          </div>
          <p className="text-xs text-gray-500 truncate">
            {contact.phone_number}
          </p>
        </div>

        {/* Status badge (right side) */}
        <div className="flex-shrink-0 hidden sm:block">
          <StatusBadge status={contact.export_status} />
        </div>
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
// CONTACT DETAIL PANEL (right side)
// ─────────────────────────────────────────────────────────────────────────────

const ContactDetailPanel = memo(({ contact, onMarkSaved, onExportSingle, isProcessing }) => {
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-semibold text-xl">
          {contact.full_name?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {contact.full_name}
          </h2>
          <p className="text-sm text-gray-500">{contact.phone_number}</p>
          <div className="mt-1">
            <StatusBadge status={contact.export_status} />
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
            Source
          </p>
          <p className="text-sm font-medium text-gray-800">
            {contact.source || "—"}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
            Email
          </p>
          <p className="text-sm font-medium text-gray-800 truncate">
            {contact.email || "—"}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
            First Message
          </p>
          <p className="text-sm font-medium text-gray-800">
            {formatDate(contact.first_message_at)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
            Last Activity
          </p>
          <p className="text-sm font-medium text-gray-800">
            {formatDate(contact.last_interaction)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
            Purchases
          </p>
          <p className="text-sm font-medium text-gray-800">
            {contact.total_purchases || 0}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
            Total Spent
          </p>
          <p className="text-sm font-medium text-gray-800">
            ₹{contact.total_spent || "0.00"}
          </p>
        </div>
      </div>

      {/* Tags */}
      {contact.tags?.length > 0 && (
        <div className="mb-6">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {contact.tags.map((tag, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        {contact.export_status !== "SAVED" && (
          <button
            onClick={() => onMarkSaved([contact.id])}
            disabled={isProcessing}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-50 transition-colors"
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
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors"
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
// MAIN PAGE COMPONENT
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
    clearSelection();
  }, [clearSelection]);

  const handleStatusFilterChange = useCallback((status) => {
    setStatusFilter(status);
    setSelectedContact(null);
    setRightPanel("welcome");
    clearSelection();
  }, [clearSelection]);

  const handleCardClick = useCallback((key) => {
    // Clicking a stat card filters by that status
    const statusMap = { new: "NEW", exported: "EXPORTED", saved: "SAVED" };
    if (statusMap[key]) {
      setStatusFilter(statusMap[key]);
    } else {
      setStatusFilter("");
    }
    clearSelection();
  }, [clearSelection]);

  const handleExport = useCallback(
    async (options) => {
      // If exporting selected, inject the IDs
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
    <div className="h-screen flex flex-col w-full min-w-0 bg-white">
      {/* Stats Cards (top bar) */}
      <StatsCards stats={stats} isLoading={statsLoading} onCardClick={handleCardClick} />

      <div className="flex flex-1 overflow-hidden">
        {/* ═══════════════════════════════════════════════════════════════════
            LEFT PANEL (30%) — Contact List
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="w-full md:w-[35%] lg:w-[30%] flex flex-col border-r border-slate-200 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Contacts</h2>
              <span className="text-sm text-gray-500">({totalCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setRightPanel("history");
                  setSelectedContact(null);
                }}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                title="Export History"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 pb-2">
            <div className="flex items-center border border-gray-200 rounded-lg bg-white">
              <span className="pl-3 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 15l6 6m-11-4a7 7 0 110-14 7 7 0 010 14z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search by name or phone"
                className="w-full py-2 px-2 text-sm outline-none rounded-lg"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setDebouncedSearch("");
                  }}
                  className="pr-3 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
          {isLoading && contacts.length === 0 ? (
            <div className="flex-grow overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 animate-pulse">
                  <div className="w-4 h-4 bg-gray-200 rounded" />
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
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
              className="flex-grow overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 380px)" }}
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
                <div className="flex items-center justify-center py-4 gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-gray-500">Loading more...</span>
                </div>
              )}

              {!hasMore && contacts.length > 10 && (
                <div className="text-center py-3 text-[11px] text-gray-400">
                  — End of contacts —
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            RIGHT PANEL (70%) — Detail / History / Welcome
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="hidden md:flex flex-col flex-1 bg-zinc-50">
          {rightPanel === "detail" && selectedContact && (
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
                <h2 className="text-lg font-semibold">Contact Details</h2>
                <button
                  onClick={() => {
                    setSelectedContact(null);
                    setRightPanel("welcome");
                  }}
                  className="px-3 py-1.5 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
              <ContactDetailPanel
                contact={selectedContact}
                onMarkSaved={handleMarkSaved}
                onExportSingle={handleExportSingle}
                isProcessing={isProcessing || isExporting}
              />
            </div>
          )}

          {rightPanel === "history" && (
            <div className="flex-1 overflow-y-auto p-6">
              <ExportHistoryPanel
                exports={exportHistory}
                isLoading={historyLoading}
                onDownload={downloadPastExport}
                onClose={() => setRightPanel("welcome")}
              />
            </div>
          )}

          {rightPanel === "welcome" && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-6 max-w-sm">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Smart Contact Management
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Select a contact to view details, or use the export button to
                  download contacts as VCF for your phone.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="w-full px-4 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                  >
                    Export Contacts
                  </button>
                  <button
                    onClick={() => setRightPanel("history")}
                    className="w-full px-4 py-2.5 text-sm font-medium bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Export History
                  </button>
                </div>
              </div>
            </div>
          )}
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