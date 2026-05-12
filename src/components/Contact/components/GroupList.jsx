// ═══════════════════════════════════════════════════════════════════════════════
// contacts/components/GroupList.jsx
// Group list component with selection — Full theme support
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

    const getInitial = () => {
      if (group.initial_name) return group.initial_name;
      return group.group_name?.[0]?.toUpperCase() || "G";
    };

    return (
      <div
        className={`
          group flex space-x-3 cursor-pointer items-center px-4 py-3.5 border-b border-gray-100 dark:border-white/5 transition-all duration-200
          hover:bg-gray-50/80 dark:hover:bg-white/5
          ${isSelected ? "bg-blue-50/80 dark:bg-blue-500/10 border-l-2 border-l-blue-500 dark:border-l-blue-400" : "border-l-2 border-l-transparent"}
        `}
        onClick={() => onView?.(group)}
      >
        {/* Checkbox */}
        <div className="flex items-center justify-center">
          <label
            htmlFor={`group_${group.id}`}
            className="cursor-pointer opacity-60 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              id={`group_${group.id}`}
              checked={isSelected}
              onChange={handleCheckboxClick}
              className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
            />
          </label>
        </div>

        {/* Avatar */}
        <div className="w-12 h-12 flex-shrink-0">
          <div className="rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-600/10 text-purple-600 dark:text-purple-400 flex justify-center items-center h-12 w-12 font-bold text-lg shadow-sm ring-2 ring-white dark:ring-white/10">
            {getInitial()}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">{group.group_name}</h3>
          {group.contact_count !== undefined && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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
  if (isLoading && groups.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center py-12 bg-white dark:bg-[#0b1120]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 dark:border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 font-medium">Loading groups...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && groups.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center py-12 bg-white dark:bg-[#0b1120]">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow overflow-y-auto scrollbar-thin bg-white dark:bg-[#0b1120]" style={{ maxHeight: "65vh" }}>
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
  <div className="flex-grow overflow-hidden bg-white dark:bg-[#0b1120]">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex space-x-3 items-center px-4 py-3.5 border-b border-gray-100 dark:border-white/5 animate-pulse"
      >
        <div className="w-4 h-4 bg-gray-200 dark:bg-white/10 rounded" />
        <div className="w-12 h-12 bg-gray-200 dark:bg-white/10 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-lg w-1/2" />
          <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-lg w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

export default GroupList;