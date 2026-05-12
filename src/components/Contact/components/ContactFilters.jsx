// ─────────────────────────────────────────────────────────────────────────────
// ContactFilters.jsx — Premium UI for contact filter components
// src/components/Contact/components/ContactFilters.jsx
//
// All logic preserved — only visual styles upgraded.
// ─────────────────────────────────────────────────────────────────────────────

import React, { memo } from "react";

// ── SEARCH BAR ────────────────────────────────────────────────────────────────
export const SearchBar = memo(({ value, onChange, onToggleFilters, showFilters }) => (
  <div className="px-4 pb-2 mt-3">
    <div className={`flex items-center bg-gray-50 dark:bg-gray-800/60 rounded-2xl border transition-all ${showFilters ? "border-blue-300 bg-white dark:bg-gray-800" : "border-transparent focus-within:border-blue-300 focus-within:bg-white dark:focus-within:bg-gray-800"}`}>
      <span className="pl-3 text-gray-400 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, phone…"
        className="w-full py-2.5 px-2.5 text-sm bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
      />
      <button
        onClick={onToggleFilters}
        className={`mr-2 p-1.5 rounded-xl transition-colors shrink-0 ${showFilters ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
        title="Toggle Filters"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
        </svg>
      </button>
    </div>
  </div>
));
SearchBar.displayName = "SearchBar";

// ── FILTER PANEL ──────────────────────────────────────────────────────────────
export const FilterPanel = memo(({ segments, groups, selectedSegment, selectedGroup, onSegmentChange, onGroupChange, onClear, hasActiveFilters }) => (
  <div className="mx-4 mb-2 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3">
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Segment</label>
      <select
        value={selectedSegment}
        onChange={(e) => onSegmentChange(e.target.value)}
        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
      >
        <option value="">All Segments</option>
        {segments.map((seg) => <option key={seg.segment_id} value={seg.segment_id}>{seg.name}</option>)}
      </select>
    </div>
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Group</label>
      <select
        value={selectedGroup}
        onChange={(e) => onGroupChange(e.target.value)}
        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
      >
        <option value="">All Groups</option>
        {groups.map((group) => <option key={group.id} value={group.id}>{group.group_name}</option>)}
      </select>
    </div>
    {hasActiveFilters && (
      <button onClick={onClear} className="w-full py-1.5 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors">
        Clear All Filters
      </button>
    )}
  </div>
));
FilterPanel.displayName = "FilterPanel";

// ── ACTIVE FILTERS BADGE ──────────────────────────────────────────────────────
export const ActiveFiltersBadge = memo(({ searchQuery, selectedSegment, selectedGroup, segments, groups, onClear }) => {
  const getSegmentName = (id) => segments.find((s) => s.segment_id === id)?.name || id;
  const getGroupName = (id) => groups.find((g) => g.id.toString() === id.toString())?.group_name || id;
  if (!searchQuery && !selectedSegment && !selectedGroup) return null;
  return (
    <div className="mx-4 mb-2 p-2 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900 flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">Filters:</span>
      {searchQuery && <span className="px-2 py-0.5 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 text-[11px] rounded-full border border-blue-200 dark:border-blue-800">"{searchQuery}"</span>}
      {selectedSegment && <span className="px-2 py-0.5 bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-400 text-[11px] rounded-full border border-purple-200 dark:border-purple-800">{getSegmentName(selectedSegment)}</span>}
      {selectedGroup && <span className="px-2 py-0.5 bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 text-[11px] rounded-full border border-green-200 dark:border-green-800">{getGroupName(selectedGroup)}</span>}
      <button onClick={onClear} className="ml-auto text-[11px] text-red-500 hover:text-red-600 font-medium">Clear</button>
    </div>
  );
});
ActiveFiltersBadge.displayName = "ActiveFiltersBadge";

// ── BULK ACTIONS BAR ──────────────────────────────────────────────────────────
export const BulkActionsBar = memo(({ selectedCount, totalCount, isAllSelected, onSelectAll, onEdit, onDelete, showDropdown, onToggleDropdown }) => (
  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800">
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={isAllSelected}
        onChange={onSelectAll}
        className="w-4 h-4 rounded accent-blue-600"
      />
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {selectedCount > 0 ? <><span className="font-semibold text-gray-900 dark:text-white">{selectedCount}</span> selected</> : `${totalCount} contacts`}
      </span>
    </label>
    {selectedCount > 0 && (
      <div className="relative">
        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors" onClick={onToggleDropdown}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 16a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
          </svg>
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-20 py-1 overflow-hidden">
            {selectedCount === 1 && (
              <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-950/30 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors" onClick={onEdit}>
                Edit
              </button>
            )}
            <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 transition-colors" onClick={onDelete}>
              Delete ({selectedCount})
            </button>
          </div>
        )}
      </div>
    )}
  </div>
));
BulkActionsBar.displayName = "BulkActionsBar";

// ── TAB NAVIGATION ────────────────────────────────────────────────────────────
export const TabNavigation = memo(({ activeTab, onTabChange }) => (
  <div className="flex border-b border-gray-100 dark:border-gray-800 shrink-0">
    {[{ key: "contact", label: "All Contacts" }, { key: "group", label: "Groups" }].map((tab) => (
      <button
        key={tab.key}
        onClick={() => onTabChange(tab.key)}
        className={`flex-1 py-2.5 text-xs font-semibold transition-all ${activeTab === tab.key
          ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
      >
        {tab.label}
      </button>
    ))}
  </div>
));
TabNavigation.displayName = "TabNavigation";

export default { SearchBar, FilterPanel, ActiveFiltersBadge, BulkActionsBar, TabNavigation };