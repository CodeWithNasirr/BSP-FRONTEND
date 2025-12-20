// ═══════════════════════════════════════════════════════════════════════════════
// contacts/components/ContactFilters.jsx
// Search and filter UI components
// ═══════════════════════════════════════════════════════════════════════════════

import React, { memo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH BAR
// ─────────────────────────────────────────────────────────────────────────────

export const SearchBar = memo(({ value, onChange, onToggleFilters, showFilters }) => (
  <div className="px-4 pb-2 mt-4 flex items-center border border-gray-200 rounded-md bg-white">
    {/* Search Icon */}
    <span className="pl-2 text-gray-400">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="m15 15l6 6m-11-4a7 7 0 1 1 0-14a7 7 0 0 1 0 14Z"
        />
      </svg>
    </span>

    {/* Input */}
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search by name, phone, or email"
      className="w-full py-2 px-2 text-sm outline-none rounded-md"
    />

    {/* Filter Toggle */}
    <button
      onClick={onToggleFilters}
      className={`p-2 rounded-full transition-colors ${
        showFilters
          ? "bg-blue-100 text-blue-600"
          : "text-gray-600 hover:bg-gray-100"
      }`}
      title="Toggle Filters"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
      </svg>
    </button>
  </div>
));

SearchBar.displayName = "SearchBar";

// ─────────────────────────────────────────────────────────────────────────────
// FILTER PANEL
// ─────────────────────────────────────────────────────────────────────────────

export const FilterPanel = memo(({
  segments,
  groups,
  selectedSegment,
  selectedGroup,
  onSegmentChange,
  onGroupChange,
  onClear,
  hasActiveFilters,
}) => (
  <div className="px-4 pb-4 space-y-4 border-b border-gray-200 bg-gray-50">
    {/* Segment Filter */}
    <div>
      <label className="block text-sm text-gray-700 mb-1 font-medium">
        Filter by Segment
      </label>
      <select
        value={selectedSegment}
        onChange={(e) => onSegmentChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        <option value="">All Segments</option>
        {segments.map((seg) => (
          <option key={seg.segment_id} value={seg.segment_id}>
            {seg.name}
          </option>
        ))}
      </select>
    </div>

    {/* Group Filter */}
    <div>
      <label className="block text-sm text-gray-700 mb-1 font-medium">
        Filter by Group
      </label>
      <select
        value={selectedGroup}
        onChange={(e) => onGroupChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        <option value="">All Groups</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.group_name}
          </option>
        ))}
      </select>
    </div>

    {/* Clear Button */}
    {hasActiveFilters && (
      <button
        onClick={onClear}
        className="w-full py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
      >
        Clear All Filters
      </button>
    )}
  </div>
));

FilterPanel.displayName = "FilterPanel";

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE FILTERS BADGE
// ─────────────────────────────────────────────────────────────────────────────

export const ActiveFiltersBadge = memo(({
  searchQuery,
  selectedSegment,
  selectedGroup,
  segments,
  groups,
  onClear,
}) => {
  const getSegmentName = (id) => {
    const segment = segments.find((s) => s.segment_id === id);
    return segment?.name || id;
  };

  const getGroupName = (id) => {
    const group = groups.find((g) => g.id.toString() === id.toString());
    return group?.group_name || id;
  };

  const hasFilters = searchQuery || selectedSegment || selectedGroup;
  if (!hasFilters) return null;

  return (
    <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2 flex-wrap">
      <span className="text-xs text-blue-600 font-medium">Active filters:</span>

      {searchQuery && (
        <span className="inline-flex items-center px-2 py-0.5 bg-white text-blue-700 text-xs rounded-full border border-blue-200">
          Search: "{searchQuery}"
        </span>
      )}

      {selectedSegment && (
        <span className="inline-flex items-center px-2 py-0.5 bg-white text-purple-700 text-xs rounded-full border border-purple-200">
          Segment: {getSegmentName(selectedSegment)}
        </span>
      )}

      {selectedGroup && (
        <span className="inline-flex items-center px-2 py-0.5 bg-white text-green-700 text-xs rounded-full border border-green-200">
          Group: {getGroupName(selectedGroup)}
        </span>
      )}

      <button
        onClick={onClear}
        className="ml-auto text-xs text-red-600 hover:text-red-700"
      >
        Clear all
      </button>
    </div>
  );
});

ActiveFiltersBadge.displayName = "ActiveFiltersBadge";

// ─────────────────────────────────────────────────────────────────────────────
// BULK ACTIONS BAR
// ─────────────────────────────────────────────────────────────────────────────

export const BulkActionsBar = memo(({
  selectedCount,
  totalCount,
  isAllSelected,
  onSelectAll,
  onEdit,
  onDelete,
  showDropdown,
  onToggleDropdown,
}) => (
  <div className="flex justify-between px-4 py-2 border-b border-gray-200 bg-white">
    {/* Select All */}
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={isAllSelected}
        onChange={onSelectAll}
        className="w-4 h-4 border border-gray-400 rounded accent-blue-600"
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

    {/* Actions Dropdown */}
    {selectedCount > 0 && (
      <div className="relative">
        <button
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={onToggleDropdown}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M12 16a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"
            />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-36 bg-white border rounded-md shadow-lg z-20">
            {selectedCount === 1 && (
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600 hover:text-white transition-colors rounded-t-md"
                onClick={onEdit}
              >
                Edit
              </button>
            )}
            <button
              className="w-full text-left px-4 py-2 text-sm hover:bg-red-600 hover:text-white transition-colors rounded-b-md"
              onClick={onDelete}
            >
              Delete ({selectedCount})
            </button>
          </div>
        )}
      </div>
    )}
  </div>
));

BulkActionsBar.displayName = "BulkActionsBar";

// ─────────────────────────────────────────────────────────────────────────────
// TAB NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

export const TabNavigation = memo(({ activeTab, onTabChange }) => (
  <div className="flex text-sm border-b border-gray-200">
    <button
      onClick={() => onTabChange("contact")}
      className={`w-1/2 py-3 text-center font-medium transition-colors ${
        activeTab === "contact"
          ? "bg-slate-50 border-b-2 border-slate-700 text-slate-900"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }`}
    >
      All Contacts
    </button>
    <button
      onClick={() => onTabChange("group")}
      className={`w-1/2 py-3 text-center font-medium transition-colors ${
        activeTab === "group"
          ? "bg-slate-50 border-b-2 border-slate-700 text-slate-900"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }`}
    >
      Groups
    </button>
  </div>
));

TabNavigation.displayName = "TabNavigation";

export default {
  SearchBar,
  FilterPanel,
  ActiveFiltersBadge,
  BulkActionsBar,
  TabNavigation,
};