// ═══════════════════════════════════════════════════════════════════════════════
// contacts/components/GroupList.jsx
// Group list component with selection
// ═══════════════════════════════════════════════════════════════════════════════

import React, { memo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// GROUP LIST ITEM (Memoized)
// ─────────────────────────────────────────────────────────────────────────────

const GroupListItem = memo(
  ({ group, isSelected, onSelect, onView }) => {
    const handleCheckboxClick = (e) => {
      e.stopPropagation();
      onSelect(group.id);
    };

    // Generate initial from group name
    const getInitial = () => {
      if (group.initial_name) return group.initial_name;
      return group.group_name?.[0]?.toUpperCase() || "G";
    };

    return (
      <div
        className={`flex space-x-3 hover:bg-gray-50 cursor-pointer items-center px-4 py-3 border-b border-slate-200 transition-colors ${
          isSelected ? "bg-blue-50" : ""
        }`}
        onClick={() => onView?.(group)}
      >
        {/* Checkbox */}
        <div className="flex items-center justify-center">
          <label
            htmlFor={`group_${group.id}`}
            className="cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              id={`group_${group.id}`}
              checked={isSelected}
              onChange={handleCheckboxClick}
              className="w-4 h-4 rounded-full accent-blue-600"
            />
          </label>
        </div>

        {/* Avatar */}
        <div className="w-12 h-12 flex-shrink-0">
          <div className="rounded-full bg-purple-600/10 text-purple-600 flex justify-center items-center h-12 w-12 font-medium text-lg">
            {getInitial()}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{group.group_name}</h3>
          {group.contact_count !== undefined && (
            <p className="text-xs text-gray-500">
              {group.contact_count} contact{group.contact_count !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.group.id === next.group.id &&
    prev.isSelected === next.isSelected &&
    prev.group.group_name === next.group.group_name
);

GroupListItem.displayName = "GroupListItem";

// ─────────────────────────────────────────────────────────────────────────────
// GROUP LIST
// ─────────────────────────────────────────────────────────────────────────────

const GroupList = ({
  groups,
  isLoading,
  selectedIds,
  onSelect,
  onView,
  emptyMessage = "No groups found",
}) => {
  // Loading state
  if (isLoading && groups.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading groups...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && groups.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center py-12">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow overflow-y-auto" style={{ maxHeight: "65vh" }}>
      {groups.map((group) => (
        <GroupListItem
          key={group.id}
          group={group}
          isSelected={selectedIds.includes(group.id)}
          onSelect={onSelect}
          onView={onView}
        />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// GROUP LIST SKELETON
// ─────────────────────────────────────────────────────────────────────────────

export const GroupListSkeleton = ({ count = 5 }) => (
  <div className="flex-grow overflow-hidden">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex space-x-3 items-center px-4 py-3 border-b border-slate-100 animate-pulse"
      >
        <div className="w-4 h-4 bg-gray-200 rounded" />
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

export default GroupList;