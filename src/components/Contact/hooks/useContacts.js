// ═══════════════════════════════════════════════════════════════════════════════
// contacts/hooks/useContacts.js
// Custom hook for managing contacts with infinite scroll (FIXED)
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { contactsApi } from "../api/contactsApi";

// ─────────────────────────────────────────────────────────────────────────────
// CACHE (Module-level - survives component unmount)
// ─────────────────────────────────────────────────────────────────────────────

const contactsCache = {
  contacts: [],
  page: 1,
  hasMore: true,
  scrollTop: 0,
  filterKey: "", // Normalized filter signature
  lastFetchTime: 0,
};

const CACHE_TTL = 30000; // 30 seconds

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a normalized filter key for cache comparison
 * Ensures consistent string representation
 */
const getFilterKey = (filters) => {
  const search = (filters.search || "").trim().toLowerCase();
  const segment = (filters.segment || "").toString().trim();
  const group = (filters.group || "").toString().trim();
  return `${search}|${segment}|${group}`;
};

const updateLocalStorageContacts = (contacts) => {
  try {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      const parsed = JSON.parse(storedUserInfo);
      parsed.contacts = contacts;
      localStorage.setItem("userInfo", JSON.stringify(parsed));
    }
  } catch (e) {
    console.error("Failed to update localStorage:", e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export const useContacts = (token, filters = {}) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // NORMALIZE FILTERS (prevent unnecessary re-renders)
  // ═══════════════════════════════════════════════════════════════════════════
  const normalizedFilters = useMemo(
    () => ({
      search: (filters.search || "").trim(),
      segment: (filters.segment || "").toString().trim(),
      group: (filters.group || "").toString().trim(),
    }),
    [filters.search, filters.segment, filters.group]
  );

  const filterKey = useMemo(
    () => getFilterKey(normalizedFilters),
    [normalizedFilters]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [contacts, setContacts] = useState(() => {
    // Only use cache if filters match
    if (contactsCache.filterKey === filterKey && contactsCache.contacts.length > 0) {
      return contactsCache.contacts;
    }
    return [];
  });

  const [page, setPage] = useState(() => {
    if (contactsCache.filterKey === filterKey) {
      return contactsCache.page;
    }
    return 1;
  });

  const [hasMore, setHasMore] = useState(() => {
    if (contactsCache.filterKey === filterKey) {
      return contactsCache.hasMore;
    }
    return true;
  });

  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // REFS (for async callbacks)
  // ═══════════════════════════════════════════════════════════════════════════
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const pageRef = useRef(page);
  const hasMoreRef = useRef(hasMore);
  const filterKeyRef = useRef(filterKey);
  const fetchIdRef = useRef(0); // Track fetch sequence to ignore stale responses

  // Keep refs synced
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    filterKeyRef.current = filterKey;
  }, [filterKey]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CACHE SYNC
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (page === 1) {
      contactsCache.contacts = contacts;
      contactsCache.page = page;
      contactsCache.hasMore = hasMore;
    }
  }, [contacts, page, hasMore]);


  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH CONTACTS
  // ═══════════════════════════════════════════════════════════════════════════
  const fetchContacts = useCallback(
    async (pageNum, currentFilters, isAppending = false) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const currentFetchId = ++fetchIdRef.current;
      const currentFilterKey = getFilterKey(currentFilters);

      try {
        if (isAppending) setIsLoadingMore(true);
        else setIsLoading(true);

        console.log(`📡 Fetching contacts page ${pageNum}, filters: ${currentFilterKey}`);

        const response = await contactsApi.getContacts(
          token,
          {
            page: pageNum,
            search: currentFilters.search,
            segment: currentFilters.segment,
            group: currentFilters.group,
          },
          abortControllerRef.current.signal
        );

        // Ignore stale responses
        if (
          currentFetchId !== fetchIdRef.current ||
          currentFilterKey !== filterKeyRef.current
        ) {
          console.log("🚫 Ignoring stale response");
          return;
        }

        const newContacts = response.results || [];
        const hasNext = !!response.next;

        if (isAppending) {
          setContacts((prev) => {
            const ids = new Set(prev.map((c) => c.id));
            return [...prev, ...newContacts.filter((c) => !ids.has(c.id))];
          });
        } else {
          setContacts(newContacts);
        }

        setHasMore(hasNext);
        setTotalCount(response.count || 0);

        // ✅ update cache metadata
        contactsCache.filterKey = currentFilterKey;
        contactsCache.lastFetchTime = Date.now();

      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          return;
        }
        toast.error("Failed to fetch contacts");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [token]
  );


  // ═══════════════════════════════════════════════════════════════════════════
  // LOAD MORE (for infinite scroll)
  // ═══════════════════════════════════════════════════════════════════════════
  const loadMore = useCallback(() => {
    if (isLoadingRef.current || !hasMoreRef.current) {
      return;
    }

    const nextPage = pageRef.current + 1;
    setPage(nextPage);
    pageRef.current = nextPage;

    // Use current normalized filters
    fetchContacts(
      nextPage,
      {
        search: normalizedFilters.search,
        segment: normalizedFilters.segment,
        group: normalizedFilters.group,
      },
      true
    );
  }, [fetchContacts, normalizedFilters]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FILTER CHANGE HANDLER
  // ═══════════════════════════════════════════════════════════════════════════
  // useEffect(() => {
  //   if (!token) return;

  //   const cacheAge = Date.now() - contactsCache.lastFetchTime;
  //   const cacheValid =
  //     contactsCache.filterKey === filterKey &&
  //     contactsCache.contacts.length > 0 &&
  //     cacheAge < CACHE_TTL;

  //   if (cacheValid) {
  //     console.log("📦 Using cached contacts for filter:", filterKey);
  //     // Restore from cache
  //     setContacts(contactsCache.contacts);
  //     setPage(contactsCache.page);
  //     setHasMore(contactsCache.hasMore);
  //     pageRef.current = contactsCache.page;
  //     hasMoreRef.current = contactsCache.hasMore;
  //     setIsLoading(false);
  //     return;
  //   }

  //   // ═══════════════════════════════════════════════════════════════════════
  //   // FIX: Clear state BEFORE fetching to prevent stale data showing
  //   // ═══════════════════════════════════════════════════════════════════════
  //   console.log("🔄 Filter changed, resetting...", filterKey);

  //   // Reset state
  //   setPage(1);
  //   pageRef.current = 1;
  //   setHasMore(true);
  //   hasMoreRef.current = true;
  //   setContacts([]);
  //   setError(null);

  //   // Fetch with new filters
  //   fetchContacts(1, normalizedFilters, false);
  // }, [token, filterKey, normalizedFilters, fetchContacts]);
  useEffect(() => {
    if (!token) return;

    // HARD reset cache on filter change
    contactsCache.lastFetchTime = 0;
    contactsCache.contacts = [];

    console.log("🔄 Filter changed, fetching:", filterKey);

    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    hasMoreRef.current = true;
    setContacts([]);
    setError(null);

    fetchContacts(1, normalizedFilters, false);
  }, [token, filterKey]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CRUD OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const createContact = useCallback(
    async (contactData) => {
      try {
        const response = await contactsApi.createContact(token, contactData);

        // Optimistic update - add to beginning
        setContacts((prev) => {
          const updated = [response.data, ...prev];
          updateLocalStorageContacts(updated);
          return updated;
        });
        setTotalCount((prev) => prev + 1);

        toast.success(response.Message || "Contact saved successfully");
        return { success: true, data: response.data };
      } catch (err) {
        const errorMsg = err.response?.data?.error || "Failed to create contact";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    [token]
  );

  const updateContact = useCallback(
    async (contactId, contactData) => {
      try {
        const response = await contactsApi.updateContact(token, contactId, contactData);

        // Update in place
        setContacts((prev) => {
          const updated = prev.map((c) =>
            c.id === contactId ? { ...c, ...response.data } : c
          );
          updateLocalStorageContacts(updated);
          return updated;
        });

        toast.success(response.Message || "Contact updated successfully");
        return { success: true, data: response.data };
      } catch (err) {
        const errorMsg = err.response?.data?.error || "Failed to update contact";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    [token]
  );

  const deleteContacts = useCallback(
    async (contactIds) => {
      const ids = Array.isArray(contactIds) ? contactIds : [contactIds];

      try {
        await contactsApi.deleteContacts(token, ids);

        // Remove from state
        setContacts((prev) => {
          const updated = prev.filter((c) => !ids.includes(c.id));
          updateLocalStorageContacts(updated);
          return updated;
        });
        setTotalCount((prev) => Math.max(0, prev - ids.length));

        toast.success(`${ids.length} contact(s) deleted successfully`);
        return { success: true };
      } catch (err) {
        const errorMsg = err.response?.data?.error || "Failed to delete contacts";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    [token]
  );

  const addContactToGroup = useCallback(
    async (contactId, groupId, groupName) => {
      try {
        await contactsApi.addToGroup(token, contactId, groupId);

        setContacts((prev) =>
          prev.map((c) =>
            c.id === contactId
              ? {
                  ...c,
                  Group: [...(c.Group || []), { id: groupId, group_name: groupName }],
                }
              : c
          )
        );

        toast.success("Contact added to group");
        return { success: true };
      } catch (err) {
        const errorMsg = err.response?.data?.error || "Failed to add to group";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    [token]
  );

  const removeContactFromGroup = useCallback(
    async (contactId, groupId) => {
      try {
        await contactsApi.removeFromGroup(token, contactId, groupId);

        setContacts((prev) =>
          prev.map((c) =>
            c.id === contactId
              ? { ...c, Group: (c.Group || []).filter((g) => g.id !== groupId) }
              : c
          )
        );

        toast.success("Contact removed from group");
        return { success: true };
      } catch (err) {
        const errorMsg = err.response?.data?.error || "Failed to remove from group";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    [token]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const getContactById = useCallback(
    (id) => contacts.find((c) => c.id === id),
    [contacts]
  );

  const invalidateCache = useCallback(() => {
    console.log("🗑️ Invalidating cache...");
    contactsCache.lastFetchTime = 0;
    contactsCache.contacts = [];
    contactsCache.filterKey = "";

    // Reset and refetch
    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    hasMoreRef.current = true;
    setContacts([]);

    fetchContacts(1, normalizedFilters, false);
  }, [fetchContacts, normalizedFilters]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════
  return {
    // State
    contacts,
    page,
    hasMore,
    totalCount,
    isLoading,
    isLoadingMore,
    error,

    // Actions
    loadMore,
    invalidateCache,
    createContact,
    updateContact,
    deleteContacts,
    addContactToGroup,
    removeContactFromGroup,
    getContactById,

    // Cache utilities
    getCacheScrollTop: () => contactsCache.scrollTop,
    setCacheScrollTop: (value) => {
      contactsCache.scrollTop = value;
    },
  };
};

export default useContacts;