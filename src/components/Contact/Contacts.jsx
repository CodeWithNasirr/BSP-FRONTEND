// ═══════════════════════════════════════════════════════════════════════════════
// contacts/Contacts.jsx
// Main Contacts component (Refactored)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo } from "react";

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

/**
 * Main Contacts Management Component
 * 
 * Features:
 * - Infinite scroll (WhatsApp-style)
 * - Debounced search
 * - Segment & Group filters
 * - Bulk selection & actions
 * - Add/Edit/Delete contacts
 * - Cached state (survives navigation)
 */
const Contacts = ({ activeTab, setActiveTab, token }) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // UI STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [viewMode, setViewMode] = useState("list"); // "list" | "add" | "edit"
  const [editingContact, setEditingContact] = useState(null);
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════════════════════

  // Filters (search, segment, group)
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

  // Contacts data
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

  // Groups & Segments
  const { groups } = useGroups(token);
  const { segments } = useSegments(token);

  // Selection
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

  // View a contact (switch to edit mode)
  const handleViewContact = useCallback((contact) => {
    setEditingContact(contact);
    setViewMode("edit");
    clearSelection();
  }, [clearSelection]);

  // Start adding a new contact
  const handleAddContact = useCallback(() => {
    setEditingContact(null);
    setViewMode("add");
    clearSelection();
  }, [clearSelection]);

  // Cancel form
  const handleCancelForm = useCallback(() => {
    setEditingContact(null);
    setViewMode("list");
  }, []);

  // Submit contact form
  const handleSubmitContact = useCallback(
    async (formData) => {
      setIsSubmitting(true);
      try {
        if (viewMode === "add") {
          const result = await createContact(formData);
          if (result.success) {
            setViewMode("list");
          }
        } else if (viewMode === "edit" && editingContact) {
          const result = await updateContact(editingContact.id, formData);
          if (result.success) {
            setViewMode("list");
            setEditingContact(null);
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [viewMode, editingContact, createContact, updateContact]
  );

  // Delete contact(s)
  const handleDeleteContact = useCallback(
    async (contactIds) => {
      const ids = Array.isArray(contactIds) ? contactIds : [contactIds];
      const result = await deleteContacts(ids);
      if (result.success) {
        setViewMode("list");
        setEditingContact(null);
        clearSelection();
        setShowBulkDropdown(false);
      }
    },
    [deleteContacts, clearSelection]
  );

  // Bulk edit (edit first selected)
  const handleBulkEdit = useCallback(() => {
    if (firstSelected) {
      setEditingContact(firstSelected);
      setViewMode("edit");
    }
    setShowBulkDropdown(false);
  }, [firstSelected]);

  // Bulk delete
  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length > 0) {
      handleDeleteContact(selectedIds);
    }
  }, [selectedIds, handleDeleteContact]);

  // Add to group
  const handleAddToGroup = useCallback(
    async (contactId, groupId, groupName) => {
      await addContactToGroup(contactId, groupId, groupName);
      // Update editing contact if needed
      if (editingContact?.id === contactId) {
        setEditingContact((prev) => ({
          ...prev,
          Group: [...(prev.Group || []), { id: groupId, group_name: groupName }],
        }));
      }
    },
    [addContactToGroup, editingContact]
  );

  // Remove from group
  const handleRemoveFromGroup = useCallback(
    async (contactId, groupId) => {
      await removeContactFromGroup(contactId, groupId);
      // Update editing contact if needed
      if (editingContact?.id === contactId) {
        setEditingContact((prev) => ({
          ...prev,
          Group: (prev.Group || []).filter((g) => g.id !== groupId),
        }));
      }
    },
    [removeContactFromGroup, editingContact]
  );

  // Tab change
  const handleTabChange = useCallback(
    (tab) => {
      setActiveTab(tab);
      clearSelection();
    },
    [setActiveTab, clearSelection]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED
  // ═══════════════════════════════════════════════════════════════════════════

  const showWelcomeScreen = viewMode === "list" && !editingContact;
  const showAddForm = viewMode === "add";
  const showEditForm = viewMode === "edit" && editingContact;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="max-h-screen md:h-screen flex flex-col w-full min-w-0">
      <div className="md:bg-inherit bg-white md:flex md:flex-grow capitalize">
        {/* ═══════════════════════════════════════════════════════════════════
            LEFT PANEL: Contact List
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="md:w-[30%] flex flex-col max-h-full bg-white border-r border-slate-200">
          {/* Header */}
          <div className="px-4 pt-4 flex justify-between items-center">
            <div className="flex space-x-1 text-xl items-center">
              <h2 className="font-semibold">Contacts</h2>
              <span className="text-slate-500">({totalCount})</span>
            </div>

            <button
              title="Add Contact"
              onClick={handleAddContact}
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

        {/* ═══════════════════════════════════════════════════════════════════
            RIGHT PANEL: Form or Welcome Screen
        ═══════════════════════════════════════════════════════════════════ */}

        {/* Welcome Screen */}
        {showWelcomeScreen && <WelcomeScreen onAddContact={handleAddContact} />}

        {/* Add Contact Form */}
        {showAddForm && (
          <ContactForm
            mode="create"
            groups={groups}
            onSubmit={handleSubmitContact}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Edit Contact Form */}
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
          />
        )}
      </div>
    </div>
  );
};

export default Contacts;