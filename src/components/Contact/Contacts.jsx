// ═══════════════════════════════════════════════════════════════════════════════
// contacts/Contacts.jsx
// Main Contacts component — Full theme support + Mobile Drawer Pattern
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect } from "react";

// Hooks
import { useContacts } from "./hooks/useContacts";
import { useGroups, useSegments } from "./hooks/useGroups";
import { useContactFilters } from "./hooks/useContactFilters";
import { useContactSelection } from "./hooks/useContactSelection";

// Components
import ContactList from "./components/ContactList";
import ContactForm from "./components/ContactForm";
import {
  SearchBar,
  FilterPanel,
  ActiveFiltersBadge,
  BulkActionsBar,
  TabNavigation,
} from "./components/ContactFilters";
import { WelcomeScreen, ContactListSkeleton } from "./components/EmptyStates";

const Contacts = ({ activeTab, setActiveTab, token }) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // UI STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [viewMode, setViewMode] = useState("list");
  const [editingContact, setEditingContact] = useState(null);
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════════════════════

  const {
    searchInput,
    handleSearchChange,
    filters,
    hasActiveFilters,
    showFilters,
    toggleFilters,
    selectedSegment,
    setSegment,
    selectedGroup,
    setGroup,
    clearAllFilters,
  } = useContactFilters();

  const {
    contacts,
    hasMore,
    totalCount,
    isLoading,
    isLoadingMore,
    loadMore,
    createContact,
    updateContact,
    deleteContacts,
    addContactToGroup,
    removeContactFromGroup,
    resetAndReload,
  } = useContacts(token, filters);

  const { groups } = useGroups(token);
  const { segments } = useSegments(token);

  const {
    selectedIds,
    selectedCount,
    isAllSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    firstSelected,
  } = useContactSelection(contacts);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleViewContact = useCallback((contact) => {
    setEditingContact(contact);
    setViewMode("edit");
    setIsMobileFormOpen(true);
    clearSelection();
  }, [clearSelection]);

  const handleAddContact = useCallback(() => {
    setEditingContact(null);
    setViewMode("add");
    setIsMobileFormOpen(true);
    clearSelection();
  }, [clearSelection]);

  const handleCancelForm = useCallback(() => {
    setEditingContact(null);
    setViewMode("list");
    setIsMobileFormOpen(false);
  }, []);

  const handleSubmitContact = useCallback(
    async (formData) => {
      setIsSubmitting(true);
      try {
        if (viewMode === "add") {
          const result = await createContact(formData);
          if (result.success) {
            setViewMode("list");
            setIsMobileFormOpen(false);
          }
        } else if (viewMode === "edit" && editingContact) {
          const result = await updateContact(editingContact.id, formData);
          if (result.success) {
            setViewMode("list");
            setIsMobileFormOpen(false);
            setEditingContact(null);
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [viewMode, editingContact, createContact, updateContact]
  );

  const handleDeleteContact = useCallback(
    async (contactIds) => {
      const ids = Array.isArray(contactIds) ? contactIds : [contactIds];
      const result = await deleteContacts(ids);
      if (result.success) {
        setViewMode("list");
        setIsMobileFormOpen(false);
        setEditingContact(null);
        clearSelection();
        setShowBulkDropdown(false);
      }
    },
    [deleteContacts, clearSelection]
  );

  const handleBulkEdit = useCallback(() => {
    if (firstSelected) {
      setEditingContact(firstSelected);
      setViewMode("edit");
      setIsMobileFormOpen(true);
    }
    setShowBulkDropdown(false);
  }, [firstSelected]);

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length > 0) {
      handleDeleteContact(selectedIds);
    }
  }, [selectedIds, handleDeleteContact]);

  const handleAddToGroup = useCallback(
    async (contactId, groupId, groupName) => {
      await addContactToGroup(contactId, groupId, groupName);
      if (editingContact?.id === contactId) {
        setEditingContact((prev) => ({
          ...prev,
          Group: [...(prev.Group || []), { id: groupId, group_name: groupName }],
        }));
      }
    },
    [addContactToGroup, editingContact]
  );

  const handleRemoveFromGroup = useCallback(
    async (contactId, groupId) => {
      await removeContactFromGroup(contactId, groupId);
      if (editingContact?.id === contactId) {
        setEditingContact((prev) => ({
          ...prev,
          Group: (prev.Group || []).filter((g) => g.id !== groupId),
        }));
      }
    },
    [removeContactFromGroup, editingContact]
  );

  const handleTabChange = useCallback(
    (tab) => {
      setActiveTab(tab);
      clearSelection();
      setIsMobileFormOpen(false);
      setViewMode("list");
    },
    [setActiveTab, clearSelection]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED
  // ═══════════════════════════════════════════════════════════════════════════

  const showWelcomeScreen = viewMode === "list" && !editingContact && !isMobileFormOpen;
  const showAddForm = viewMode === "add" || (viewMode === "add" && isMobileFormOpen);
  const showEditForm = viewMode === "edit" && editingContact && isMobileFormOpen;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="h-screen flex flex-col w-full min-w-0 bg-gray-50 dark:bg-[#0b1120] transition-colors duration-300 overflow-hidden">

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE: Full-screen slide-in form overlay
          Desktop: Side-by-side layout
      ═══════════════════════════════════════════════════════════════════ */}

      <div className="flex flex-col md:flex-row h-full w-full relative">

        {/* LEFT PANEL: Contact List — Always visible on desktop, hidden behind form on mobile */}
        <div className={`
          flex flex-col h-full bg-white dark:bg-[#0b1120] 
          border-r border-gray-200 dark:border-white/5 
          transition-all duration-300 ease-in-out
          w-full md:w-[30%] 
          ${isMobileFormOpen ? 'hidden md:flex' : 'flex'}
        `}>

          {/* Header */}
          <div className="px-4 pt-4 pb-2 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 dark:text-white text-xl">Contacts</h2>
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{totalCount}</span>
            </div>

            <button
              title="Add Contact"
              onClick={handleAddContact}
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

          {/* Search Bar */}
          <SearchBar
            value={searchInput}
            onChange={handleSearchChange}
            onToggleFilters={toggleFilters}
            showFilters={showFilters}
          />

          {/* Filter Panel */}
          {showFilters && (
            <FilterPanel
              segments={segments}
              groups={groups}
              selectedSegment={selectedSegment}
              selectedGroup={selectedGroup}
              onSegmentChange={setSegment}
              onGroupChange={setGroup}
              onClear={clearAllFilters}
              hasActiveFilters={hasActiveFilters}
            />
          )}

          {/* Active Filters Badge */}
          <ActiveFiltersBadge
            searchQuery={filters.search}
            selectedSegment={selectedSegment}
            selectedGroup={selectedGroup}
            segments={segments}
            groups={groups}
            onClear={clearAllFilters}
          />

          {/* Bulk Actions */}
          <BulkActionsBar
            selectedCount={selectedCount}
            totalCount={contacts.length}
            isAllSelected={isAllSelected}
            onSelectAll={toggleSelectAll}
            onEdit={handleBulkEdit}
            onDelete={handleBulkDelete}
            showDropdown={showBulkDropdown}
            onToggleDropdown={() => setShowBulkDropdown((p) => !p)}
          />

          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

          {/* Contact List */}
          <div className="flex-1 overflow-hidden">
            {isLoading && contacts.length === 0 ? (
              <ContactListSkeleton count={8} />
            ) : (
              <ContactList
                contacts={contacts}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                onLoadMore={loadMore}
                selectedIds={selectedIds}
                onSelect={toggleSelect}
                onView={handleViewContact}
                emptyMessage={
                  hasActiveFilters
                    ? "No contacts match your filters"
                    : "No contacts yet"
                }
              />
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Desktop side panel / Mobile full-screen overlay */}
        <div className={`
          flex-col h-full bg-gray-50 dark:bg-[#0b1120]
          transition-all duration-300 ease-in-out
          w-full md:w-[70%]
          ${isMobileFormOpen ? 'flex fixed inset-0 z-50 md:static md:z-auto' : 'hidden md:flex'}
        `}>

          {/* Mobile Header — Only visible on small screens when form is open */}
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
                {viewMode === "add" ? "New Contact" : "Edit Contact"}
              </h2>
              <div className="w-14" />
            </div>
          )}

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto">
            {showWelcomeScreen && <WelcomeScreen onAddContact={handleAddContact} />}

            {showAddForm && (
              <ContactForm
                mode="create"
                groups={groups}
                onSubmit={handleSubmitContact}
                onCancel={handleCancelForm}
                isSubmitting={isSubmitting}
                isMobile={true}
              />
            )}

            {showEditForm && (
              <ContactForm
                mode="edit"
                initialData={editingContact}
                groups={groups}
                onSubmit={handleSubmitContact}
                onCancel={handleCancelForm}
                onDelete={handleDeleteContact}
                onAddToGroup={handleAddToGroup}
                onRemoveFromGroup={handleRemoveFromGroup}
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

export default Contacts;