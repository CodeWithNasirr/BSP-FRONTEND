// ═══════════════════════════════════════════════════════════════════════════════
// contacts/components/SmartComponents.jsx
// Reusable UI components for Smart Contact Management
// Matches existing TailwindCSS + memo patterns from ContactFilters.jsx
// ═══════════════════════════════════════════════════════════════════════════════

import React, { memo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE — colored dot + label
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  NEW: {
    label: "New",
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  EXPORTED: {
    label: "Exported",
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  SAVED: {
    label: "Saved",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
};

export const StatusBadge = memo(({ status, size = "sm" }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NEW;

  if (size === "dot") {
    return (
      <span
        className={`inline-block w-2 h-2 rounded-full ${config.dot}`}
        title={config.label}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

// ─────────────────────────────────────────────────────────────────────────────
// STATS CARDS — Dashboard counters
// ─────────────────────────────────────────────────────────────────────────────

const CARD_CONFIG = [
  {
    key: "total",
    label: "Total Contacts",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
  },
  {
    key: "new",
    label: "New",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    key: "exported",
    label: "Exported",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    key: "saved",
    label: "Saved",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    key: "added_today",
    label: "Added Today",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
];

export const StatsCards = memo(({ stats, isLoading, onCardClick }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 px-4 py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-3 animate-pulse"
          >
            <div className="h-3 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-10" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 px-4 py-3">
      {CARD_CONFIG.map((card) => (
        <button
          key={card.key}
          onClick={() => onCardClick?.(card.key)}
          className={`bg-white border ${card.border} rounded-xl p-3 text-left hover:shadow-md transition-shadow group`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-gray-500 font-medium">
              {card.label}
            </span>
            <span className={`${card.color} opacity-60 group-hover:opacity-100 transition-opacity`}>
              {card.icon}
            </span>
          </div>
          <div className={`text-xl font-bold ${card.color}`}>
            {stats[card.key] ?? 0}
          </div>
        </button>
      ))}
    </div>
  );
});

StatsCards.displayName = "StatsCards";

// ─────────────────────────────────────────────────────────────────────────────
// STATUS FILTER TABS — horizontal tab bar for status filtering
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "NEW", label: "New", dot: "bg-blue-500" },
  { key: "EXPORTED", label: "Exported", dot: "bg-amber-500" },
  { key: "SAVED", label: "Saved", dot: "bg-emerald-500" },
];

export const StatusFilterTabs = memo(({ activeStatus, onChange, counts }) => (
  <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 overflow-x-auto">
    {STATUS_TABS.map((tab) => {
      const isActive =
        tab.key === activeStatus || (tab.key === "" && !activeStatus);
      const count =
        tab.key === ""
          ? counts?.total
          : counts?.[tab.key.toLowerCase()];

      return (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            isActive
              ? "bg-slate-800 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {tab.dot && (
            <span
              className={`w-2 h-2 rounded-full ${
                isActive ? "bg-white" : tab.dot
              }`}
            />
          )}
          {tab.label}
          {count !== undefined && (
            <span
              className={`ml-0.5 text-[10px] ${
                isActive ? "text-white/70" : "text-gray-400"
              }`}
            >
              {count}
            </span>
          )}
        </button>
      );
    })}
  </div>
));

StatusFilterTabs.displayName = "StatusFilterTabs";

// ─────────────────────────────────────────────────────────────────────────────
// SMART BULK ACTIONS BAR — enhanced with export + status actions
// ─────────────────────────────────────────────────────────────────────────────

export const SmartBulkActionsBar = memo(
  ({
    selectedCount,
    totalCount,
    isAllSelected,
    onSelectAll,
    onExportSelected,
    onMarkSaved,
    onMarkExported,
    onAddTags,
    isProcessing,
  }) => {
    const [showDropdown, setShowDropdown] = React.useState(false);
    const [showTagInput, setShowTagInput] = React.useState(false);
    const [tagInput, setTagInput] = React.useState("");

    const handleAddTags = () => {
      const tags = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tags.length > 0) {
        onAddTags(tags);
        setTagInput("");
        setShowTagInput(false);
      }
    };

    return (
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Select All */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={onSelectAll}
              className="w-4 h-4 rounded accent-blue-600"
            />
            <span className="text-sm text-gray-700">
              {selectedCount > 0 ? (
                <>
                  <span className="font-medium">{selectedCount}</span> selected
                </>
              ) : (
                `Select all (${totalCount})`
              )}
            </span>
          </label>

          {/* Actions */}
          {selectedCount > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown((p) => !p)}
                disabled={isProcessing}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Actions"
                )}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-blue-700 flex items-center gap-2"
                    onClick={() => {
                      onExportSelected();
                      setShowDropdown(false);
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Selected VCF
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 text-emerald-700 flex items-center gap-2"
                    onClick={() => {
                      onMarkSaved();
                      setShowDropdown(false);
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mark as Saved
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 text-amber-700 flex items-center gap-2"
                    onClick={() => {
                      onMarkExported();
                      setShowDropdown(false);
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    Mark as Exported
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                    onClick={() => {
                      setShowTagInput(true);
                      setShowDropdown(false);
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Add Tags
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tag Input Bar (shows when "Add Tags" is clicked) */}
        {showTagInput && selectedCount > 0 && (
          <div className="px-4 pb-2 flex items-center gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTags()}
              placeholder="Tag1, Tag2, Tag3"
              className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              autoFocus
            />
            <button
              onClick={handleAddTags}
              disabled={!tagInput.trim()}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-gray-300 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowTagInput(false);
                setTagInput("");
              }}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }
);

SmartBulkActionsBar.displayName = "SmartBulkActionsBar";

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE — Smart contacts version
// ─────────────────────────────────────────────────────────────────────────────

export const SmartEmptyState = memo(({ hasFilters, statusFilter, onClear }) => (
  <div className="flex-grow flex items-center justify-center py-12">
    <div className="text-center px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p className="text-gray-600">
        {hasFilters || statusFilter
          ? "No contacts match your filters"
          : "No contacts yet"}
      </p>
      {(hasFilters || statusFilter) && (
        <button
          onClick={onClear}
          className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Clear filters
        </button>
      )}
    </div>
  </div>
));

SmartEmptyState.displayName = "SmartEmptyState";

export default {
  StatusBadge,
  StatsCards,
  StatusFilterTabs,
  SmartBulkActionsBar,
  SmartEmptyState,
};