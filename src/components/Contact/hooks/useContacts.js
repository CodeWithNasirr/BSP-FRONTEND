// ═══════════════════════════════════════════════════════════════════════════════
// contacts/hooks/useContacts.js
// Custom hook for managing contacts with infinite scroll
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useEffect } from "react";
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
  filters: { search: "", segment: "", group: "" },
  lastFetchTime: 0,
};

const CACHE_TTL = 30000; // 30 seconds

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL STORAGE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

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

const getLocalStorageContacts = () => {
  try {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      const parsed = JSON.parse(storedUserInfo);
      return parsed.contacts || [];
    }
  } catch (e) {
    console.error("Failed to read localStorage:", e);
  }
  return [];
};

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export const useContacts = (token, filters = {}) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [contacts, setContacts] = useState(() => contactsCache.contacts);
  const [page, setPage] = useState(() => contactsCache.page);
  const [hasMore, setHasMore] = useState(() => contactsCache.hasMore);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // REFS
  // ═══════════════════════════════════════════════════════════════════════════
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const pageRef = useRef(page);
  const hasMoreRef = useRef(hasMore);
  const filtersRef = useRef(filters);

  // Keep refs updated
  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CACHE SYNC
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    contactsCache.contacts = contacts;
    contactsCache.page = page;
    contactsCache.hasMore = hasMore;
    contactsCache.filters = filters;
  }, [contacts, page, hasMore, filters]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH CONTACTS
  // ═══════════════════════════════════════════════════════════════════════════
  const fetchContacts = useCallback(
    async (pageNum, currentFilters, isAppending = false) => {
      if (isLoadingRef.current) {
        console.log("⏳ Already loading, skipping...");
        return;
      }

      isLoadingRef.current = true;

      // Cancel pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        if (isAppending) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        console.log(`📡 Fetching contacts page ${pageNum}...`);

        const response = await contactsApi.getContacts(
          token,
          {
            page: pageNum,
            search: currentFilters.search || "",
            segment: currentFilters.segment || "",
            group: currentFilters.group || "",
          },
          abortControllerRef.current.signal
        );

        const newContacts = response.results || [];
        const hasNext = !!response.next;

        console.log(`✅ Received ${newContacts.length} contacts, hasMore: ${hasNext}`);

        if (isAppending) {
          // Append and deduplicate
          setContacts((prev) => {
            const ids = new Set(prev.map((c) => c.id));
            const unique = newContacts.filter((c) => !ids.has(c.id));
            const updated = [...prev, ...unique];
            updateLocalStorageContacts(updated);
            return updated;
          });
        } else {
          // Fresh load
          setContacts(newContacts);
          updateLocalStorageContacts(newContacts);
        }

        setHasMore(hasNext);
        hasMoreRef.current = hasNext;
        setTotalCount(response.count || 0);
        contactsCache.lastFetchTime = Date.now();
        setError(null);

      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          console.error("❌ Fetch error:", err);
          setError(err.message || "Failed to fetch contacts");
          toast.error("Failed to fetch contacts");
        }
      } finally {
        isLoadingRef.current = false;
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
    if (isLoadingRef.current || !hasMoreRef.current) return;

    const nextPage = pageRef.current + 1;
    setPage(nextPage);
    pageRef.current = nextPage;
    fetchContacts(nextPage, filtersRef.current, true);
  }, [fetchContacts]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RESET & RELOAD (on filter change)
  // ═══════════════════════════════════════════════════════════════════════════
  const resetAndReload = useCallback(() => {
    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    hasMoreRef.current = true;
    setContacts([]);
    fetchContacts(1, filtersRef.current, false);
  }, [fetchContacts]);

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIAL LOAD & FILTER CHANGES
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!token) return;

    const cacheAge = Date.now() - contactsCache.lastFetchTime;
    const filtersChanged =
      JSON.stringify(contactsCache.filters) !== JSON.stringify(filters);

    // Use cache if valid
    if (
      contactsCache.contacts.length > 0 &&
      cacheAge < CACHE_TTL &&
      !filtersChanged
    ) {
      console.log("📦 Using cached contacts");
      setIsLoading(false);
      return;
    }

    // Fetch fresh
    resetAndReload();
  }, [token, filters.search, filters.segment, filters.group]); // eslint-disable-line

  // ═══════════════════════════════════════════════════════════════════════════
  // CRUD OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const createContact = useCallback(
    async (contactData) => {
      try {
        const response = await contactsApi.createContact(token, contactData);
        
        // Add to local state (optimistic)
        setContacts((prev) => {
          const updated = [response.data, ...prev];
          updateLocalStorageContacts(updated);
          return updated;
        });

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

        // Update local state
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

        // Remove from local state (optimistic)
        setContacts((prev) => {
          const updated = prev.filter((c) => !ids.includes(c.id));
          updateLocalStorageContacts(updated);
          return updated;
        });

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

        // Update local state
        setContacts((prev) =>
          prev.map((c) =>
            c.id === contactId
              ? { ...c, Group: [...(c.Group || []), { id: groupId, group_name: groupName }] }
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

        // Update local state
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
    contactsCache.lastFetchTime = 0;
    resetAndReload();
  }, [resetAndReload]);

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
    resetAndReload,
    createContact,
    updateContact,
    deleteContacts,
    addContactToGroup,
    removeContactFromGroup,
    getContactById,
    invalidateCache,

    // Cache utilities
    getCacheScrollTop: () => contactsCache.scrollTop,
    setCacheScrollTop: (value) => { contactsCache.scrollTop = value; },
  };
};

export default useContacts;