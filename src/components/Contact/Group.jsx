// ═══════════════════════════════════════════════════════════════════════════════
// contacts/Groups.jsx
// Main Groups component (Refactored)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import debounce from "lodash/debounce";

// Hooks
import { useGroups, useGroupSelection } from "./hooks/useGroups";

// Components
import GroupList, { GroupListSkeleton } from "./components/GroupList";
import GroupForm, { GroupWelcomeScreen } from "./components/GroupForm";

/**
 * Groups Management Component
 *
 * Features:
 * - List groups with selection
 * - Create new groups
 * - Delete groups (single & bulk)
 * - Search groups
 * - Cached state
 */
const Groups = ({ activeTab, setActiveTab, token }) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // UI STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [viewMode, setViewMode] = useState("list"); // "list" | "add"
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════════════════════

  // Groups data
  const { groups, isLoading, createGroup, deleteGroups } = useGroups(token);

  // Selection
  const {
    selectedIds,
    selectedCount,
    isAllSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  } = useGroupSelection(groups);

  // ═══════════════════════════════════════════════════════════════════════════
  // FILTERED GROUPS
  // ═══════════════════════════════════════════════════════════════════════════

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;

    const query = searchQuery.toLowerCase();
    return groups.filter((group) =>
      group.group_name?.toLowerCase().includes(query)
    );
  }, [groups, searchQuery]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  // Start adding a new group
  const handleAddGroup = useCallback(() => {
    setViewMode("add");
    clearSelection();
  }, [clearSelection]);

  // Cancel form
  const handleCancelForm = useCallback(() => {
    setViewMode("list");
  }, []);

  // Submit group form
  const handleSubmitGroup = useCallback(
    async (groupName) => {
      setIsSubmitting(true);
      try {
        const result = await createGroup(groupName);
        if (result.success) {
          setViewMode("list");
        }
        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [createGroup]
  );

  // Delete selected groups
  const handleDeleteGroups = useCallback(async () => {
    if (selectedIds.length === 0) return;

    const result = await deleteGroups(selectedIds);
    if (result.success) {
      clearSelection();
      setShowDropdown(false);
    }
  }, [selectedIds, deleteGroups, clearSelection]);

  // Tab change
  const handleTabChange = useCallback(
    (tab) => {
      setActiveTab(tab);
      clearSelection();
    },
    [setActiveTab, clearSelection]
  );

  // Search handler with debounce
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Close dropdown when clicking outside
  const handleDropdownToggle = useCallback(() => {
    setShowDropdown((prev) => !prev);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="md:h-screen flex flex-col w-full min-w-0">
      <div className="md:bg-inherit bg-white md:flex md:flex-grow capitalize">
        {/* ═══════════════════════════════════════════════════════════════════
            LEFT PANEL: Group List
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="md:w-[30%] flex-col h-full bg-white border-r border-slate-200 md:flex">
          {/* Header */}
          <div className="px-4 pt-4">
            <div className="flex justify-between mt-2 items-center">
              <div className="flex space-x-2 text-xl items-center">
                <h2 className="font-semibold">Groups</h2>
                <span className="text-slate-500">({groups.length})</span>
              </div>
              <button
                title="Add Group"
                onClick={handleAddGroup}
                className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                >
                  <g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
                    <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12Zm10-8a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z" />
                    <path d="M13 7a1 1 0 1 0-2 0v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7Z" />
                  </g>
                </svg>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-4 pb-2">
            <div className="border border-gray-200 rounded-md mt-6 flex items-center bg-white">
              <span className="pl-3 py-2 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
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
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full outline-none rounded-xl py-2 pl-2 mr-2 text-sm"
                placeholder="Search groups..."
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="pr-3 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex justify-between px-4 border-b border-slate-200 pb-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 border border-gray-400 rounded-md accent-blue-600"
              />
              <span className="text-sm text-gray-700">
                {selectedCount > 0 ? (
                  <>
                    <span className="font-medium">{selectedCount}</span> selected
                  </>
                ) : (
                  `Select all`
                )}
              </span>
            </label>

            {/* Actions Dropdown */}
            {selectedCount > 0 && (
              <div className="relative">
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={handleDropdownToggle}
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
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-md"
                      onClick={handleDeleteGroups}
                    >
                      Delete ({selectedCount})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-between text-sm border-b border-slate-200">
            <button
              onClick={() => handleTabChange("contact")}
              className={`pt-3 w-1/2 text-center pb-3 font-medium transition-colors ${
                activeTab === "contact"
                  ? "bg-slate-50 border-b-2 border-slate-700 text-slate-900"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              All Contacts
            </button>
            <button
              onClick={() => handleTabChange("group")}
              className={`pt-3 w-1/2 text-center pb-3 font-medium transition-colors ${
                activeTab === "group"
                  ? "bg-slate-50 border-b-2 border-slate-700 text-slate-900"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Groups
            </button>
          </div>

          {/* Group List */}
          {isLoading && groups.length === 0 ? (
            <GroupListSkeleton count={6} />
          ) : (
            <GroupList
              groups={filteredGroups}
              isLoading={isLoading}
              selectedIds={selectedIds}
              onSelect={toggleSelect}
              emptyMessage={
                searchQuery
                  ? "No groups match your search"
                  : "No groups yet"
              }
            />
          )}

          {/* Search Results Count */}
          {searchQuery && filteredGroups.length > 0 && (
            <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
              Showing {filteredGroups.length} of {groups.length} groups
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            RIGHT PANEL: Form or Welcome Screen
        ═══════════════════════════════════════════════════════════════════ */}

        {/* Welcome Screen */}
        {viewMode === "list" && <GroupWelcomeScreen onAddGroup={handleAddGroup} />}

        {/* Add Group Form */}
        {viewMode === "add" && (
          <GroupForm
            onSubmit={handleSubmitGroup}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default Groups;