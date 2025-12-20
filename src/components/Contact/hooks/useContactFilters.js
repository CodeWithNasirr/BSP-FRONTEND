// ═══════════════════════════════════════════════════════════════════════════════
// contacts/hooks/useContactFilters.js
// Custom hook for managing contact filters with debounced search
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useMemo, useEffect } from "react";
import debounce from "lodash/debounce";

/**
 * Manages filter state with:
 * - Debounced search (instant UI, delayed API call)
 * - Segment filter
 * - Group filter
 * - URL persistence (optional)
 */
export const useContactFilters = (options = {}) => {
  const { persistToUrl = false, debounceMs = 400 } = options;

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Search has two values: immediate (for UI) and debounced (for API)
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Other filters
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // DEBOUNCED SEARCH
  // ═══════════════════════════════════════════════════════════════════════════

  // Create debounced setter (stable across renders)
  const debouncedSetSearch = useMemo(
    () =>
      debounce((value) => {
        setDebouncedSearch(value);
      }, debounceMs),
    [debounceMs]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  // Handle search input change
  const handleSearchChange = useCallback(
    (value) => {
      setSearchInput(value); // Immediate UI update
      debouncedSetSearch(value); // Delayed API call
    },
    [debouncedSetSearch]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // FILTER ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const setSegment = useCallback((segment) => {
    setSelectedSegment(segment);
  }, []);

  const setGroup = useCallback((group) => {
    setSelectedGroup(group);
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchInput("");
    setDebouncedSearch("");
    setSelectedSegment("");
    setSelectedGroup("");
    debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setDebouncedSearch("");
    debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════════════════

  // Combined filters object (for useContacts hook)
  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      segment: selectedSegment,
      group: selectedGroup,
    }),
    [debouncedSearch, selectedSegment, selectedGroup]
  );

  // Check if any filter is active
  const hasActiveFilters = useMemo(
    () => !!(debouncedSearch || selectedSegment || selectedGroup),
    [debouncedSearch, selectedSegment, selectedGroup]
  );

  // Count of active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (debouncedSearch) count++;
    if (selectedSegment) count++;
    if (selectedGroup) count++;
    return count;
  }, [debouncedSearch, selectedSegment, selectedGroup]);

  // ═══════════════════════════════════════════════════════════════════════════
  // URL PERSISTENCE (Optional)
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!persistToUrl) return;

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedSegment) params.set("segment", selectedSegment);
    if (selectedGroup) params.set("group", selectedGroup);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params}`
      : window.location.pathname;

    window.history.replaceState({}, "", newUrl);
  }, [debouncedSearch, selectedSegment, selectedGroup, persistToUrl]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    // Search state
    searchInput,
    debouncedSearch,
    handleSearchChange,
    clearSearch,

    // Segment filter
    selectedSegment,
    setSegment,

    // Group filter
    selectedGroup,
    setGroup,

    // Filter panel
    showFilters,
    toggleFilters,
    setShowFilters,

    // Utilities
    filters, // Combined filters object
    hasActiveFilters,
    activeFilterCount,
    clearAllFilters,
  };
};

export default useContactFilters;