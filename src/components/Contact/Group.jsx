// ═══════════════════════════════════════════════════════════════════════════════
// contacts/Groups.jsx
// Main Groups component — Full theme support + Mobile Drawer Pattern
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";

// Hooks
import { useGroups, useGroupSelection } from "./hooks/useGroups";

// Components
import GroupList, { GroupListSkeleton } from "./components/GroupList";
import GroupForm, { GroupWelcomeScreen } from "./components/GroupForm";

const Groups = ({ activeTab, setActiveTab, token }) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // UI STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [viewMode, setViewMode] = useState("list");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════════════════════

  const { groups, isLoading, createGroup, deleteGroups } = useGroups(token);

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

  const handleAddGroup = useCallback(() => {
    setViewMode("add");
    setIsMobileFormOpen(true);
    clearSelection();
  }, [clearSelection]);

  const handleCancelForm = useCallback(() => {
    setViewMode("list");
    setIsMobileFormOpen(false);
  }, []);

  const handleSubmitGroup = useCallback(
    async (groupName) => {
      setIsSubmitting(true);
      try {
        const result = await createGroup(groupName);
        if (result.success) {
          setViewMode("list");
          setIsMobileFormOpen(false);
        }
        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [createGroup]
  );

  const handleDeleteGroups = useCallback(async () => {
    if (selectedIds.length === 0) return;
    const result = await deleteGroups(selectedIds);
    if (result.success) {
      clearSelection();
      setShowDropdown(false);
    }
  }, [selectedIds, deleteGroups, clearSelection]);

  const handleTabChange = useCallback(
    (tab) => {
      setActiveTab(tab);
      clearSelection();
      setIsMobileFormOpen(false);
      setViewMode("list");
    },
    [setActiveTab, clearSelection]
  );

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleDropdownToggle = useCallback(() => {
    setShowDropdown((prev) => !prev);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="h-screen flex flex-col w-full min-w-0 bg-gray-50 dark:bg-[#0b1120] transition-colors duration-300 overflow-hidden">

      <div className="flex flex-col md:flex-row h-full w-full relative">

        {/* LEFT PANEL: Group List */}
        <div className={`
          flex flex-col h-full bg-white dark:bg-[#0b1120] 
          border-r border-gray-200 dark:border-white/5 
          transition-all duration-300 ease-in-out
          w-full md:w-[30%]
          ${isMobileFormOpen ? 'hidden md:flex' : 'flex'}
        `}>

          {/* Header */}
          <div className="px-4 pt-4 pb-2 shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900 dark:text-white text-xl">Groups</h2>
                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{groups.length}</span>
              </div>
              <button
                title="Add Group"
                onClick={handleAddGroup}
                className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 p-2 rounded-xl transition-all duration-200 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                  <g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
                    <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12Zm10-8a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z" />
                    <path d="M13 7a1 1 0 1 0-2 0v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7Z" />
                  </g>
                </svg>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-4 pb-2 shrink-0">
            <div className="border border-gray-200 dark:border-white/10 rounded-xl flex items-center bg-white dark:bg-[#111827] transition-all duration-200 focus-within:border-blue-400 dark:focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 dark:focus-within:ring-blue-400/20">
              <span className="pl-3 py-2.5 text-gray-400 dark:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full outline-none rounded-xl py-2.5 pl-2 mr-2 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                placeholder="Search groups..."
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex justify-between px-4 py-2.5 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-sm shrink-0">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {selectedCount > 0 ? (
                  <>
                    <span className="font-bold text-gray-900 dark:text-white">{selectedCount}</span> selected
                  </>
                ) : (
                  `Select all`
                )}
              </span>
            </label>

            {selectedCount > 0 && (
              <div className="relative">
                <button
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all duration-200"
                  onClick={handleDropdownToggle}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="text-gray-600 dark:text-gray-400">
                    <path fill="currentColor" d="M12 16a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl z-20 py-1.5 overflow-hidden backdrop-blur-xl">
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors font-medium"
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
          <div className="flex justify-between text-sm border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-sm shrink-0">
            <button
              onClick={() => handleTabChange("contact")}
              className={`pt-3 w-1/2 text-center pb-3 font-bold transition-all duration-200 ${
                activeTab === "contact"
                  ? "bg-blue-50/50 dark:bg-blue-500/5 border-b-2 border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-300"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              All Contacts
            </button>
            <button
              onClick={() => handleTabChange("group")}
              className={`pt-3 w-1/2 text-center pb-3 font-bold transition-all duration-200 ${
                activeTab === "group"
                  ? "bg-blue-50/50 dark:bg-blue-500/5 border-b-2 border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-300"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              Groups
            </button>
          </div>

          {/* Group List */}
          <div className="flex-1 overflow-hidden">
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
          </div>

          {/* Search Results Count */}
          {searchQuery && filteredGroups.length > 0 && (
            <div className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/5 bg-white/50 dark:bg-white/5 font-medium shrink-0">
              Showing {filteredGroups.length} of {groups.length} groups
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Desktop side panel / Mobile full-screen overlay */}
        <div className={`
          flex-col h-full bg-gray-50 dark:bg-[#0b1120]
          transition-all duration-300 ease-in-out
          w-full md:w-[70%]
          ${isMobileFormOpen ? 'flex fixed inset-0 z-50 md:static md:z-auto' : 'hidden md:flex'}
        `}>

          {/* Mobile Header */}
          {isMobileFormOpen && (
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-white/5 shrink-0">
              <button 
                onClick={handleCancelForm}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold text-sm active:scale-95 transition-transform"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
                Back
              </button>
              <h2 className="font-bold text-gray-900 dark:text-white text-base">
                New Group
              </h2>
              <div className="w-14" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === "list" && !isMobileFormOpen && <GroupWelcomeScreen onAddGroup={handleAddGroup} />}

            {viewMode === "add" && isMobileFormOpen && (
              <GroupForm
                onSubmit={handleSubmitGroup}
                onCancel={handleCancelForm}
                isSubmitting={isSubmitting}
                isMobile={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Groups;