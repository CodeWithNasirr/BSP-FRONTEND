// ═══════════════════════════════════════════════════════════════════════════════
// contacts/hooks/useContactSelection.js
// Custom hook for managing contact selection (bulk actions)
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useMemo } from "react";

/**
 * Manages contact selection state:
 * - Individual selection
 * - Select all
 * - Bulk actions
 */
export const useContactSelection = (contacts = []) => {
  const [selectedIds, setSelectedIds] = useState([]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTION ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Toggle selection of a single contact
   */
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  }, []);

  /**
   * Select a single contact (exclusive)
   */
  const selectOne = useCallback((id) => {
    setSelectedIds([id]);
  }, []);

  /**
   * Select multiple contacts
   */
  const selectMany = useCallback((ids) => {
    setSelectedIds((prev) => {
      const newIds = ids.filter((id) => !prev.includes(id));
      return [...prev, ...newIds];
    });
  }, []);

  /**
   * Deselect multiple contacts
   */
  const deselectMany = useCallback((ids) => {
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
  }, []);

  /**
   * Toggle select all
   */
  const toggleSelectAll = useCallback(() => {
    const allIds = contacts.map((c) => c.id);
    
    setSelectedIds((prev) => {
      // If all are selected, deselect all
      if (prev.length === allIds.length && allIds.every((id) => prev.includes(id))) {
        return [];
      }
      // Otherwise, select all
      return allIds;
    });
  }, [contacts]);

  /**
   * Select all contacts
   */
  const selectAll = useCallback(() => {
    setSelectedIds(contacts.map((c) => c.id));
  }, [contacts]);

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  /**
   * Check if a contact is selected
   */
  const isSelected = useCallback(
    (id) => selectedIds.includes(id),
    [selectedIds]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * All contacts are selected
   */
  const isAllSelected = useMemo(() => {
    if (contacts.length === 0) return false;
    return contacts.every((c) => selectedIds.includes(c.id));
  }, [contacts, selectedIds]);

  /**
   * Some (but not all) contacts are selected
   */
  const isPartiallySelected = useMemo(() => {
    return selectedIds.length > 0 && selectedIds.length < contacts.length;
  }, [selectedIds.length, contacts.length]);

  /**
   * Number of selected contacts
   */
  const selectedCount = useMemo(() => selectedIds.length, [selectedIds]);

  /**
   * Has any selection
   */
  const hasSelection = useMemo(() => selectedIds.length > 0, [selectedIds]);

  /**
   * Get selected contacts (full objects)
   */
  const selectedContacts = useMemo(() => {
    const idSet = new Set(selectedIds);
    return contacts.filter((c) => idSet.has(c.id));
  }, [contacts, selectedIds]);

  /**
   * Get first selected contact (for edit mode)
   */
  const firstSelected = useMemo(() => {
    if (selectedIds.length === 0) return null;
    return contacts.find((c) => c.id === selectedIds[0]) || null;
  }, [contacts, selectedIds]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    // State
    selectedIds,
    selectedCount,
    hasSelection,
    isAllSelected,
    isPartiallySelected,
    selectedContacts,
    firstSelected,

    // Actions
    toggleSelect,
    selectOne,
    selectMany,
    deselectMany,
    toggleSelectAll,
    selectAll,
    clearSelection,
    isSelected,

    // For external control
    setSelectedIds,
  };
};

export default useContactSelection;