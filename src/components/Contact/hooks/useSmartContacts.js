// ═══════════════════════════════════════════════════════════════════════════════
// contacts/hooks/useSmartContacts.js
// Custom hooks for Smart Contact Management
// Follows the exact same patterns as useContacts.js and useGroups.js
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { smartContactsApi, triggerFileDownload } from "../api/smartContactsApi";

// ─────────────────────────────────────────────────────────────────────────────
// useContactStats — Dashboard stat cards
// ─────────────────────────────────────────────────────────────────────────────

const statsCache = { data: null, lastFetchTime: 0 };
const STATS_CACHE_TTL = 15000; // 15 seconds

export const useContactStats = (token) => {
  const [stats, setStats] = useState(
    statsCache.data || { total: 0, new: 0, exported: 0, saved: 0, added_today: 0 }
  );
  const [isLoading, setIsLoading] = useState(!statsCache.data);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(
    async (force = false) => {
      if (!token) return;

      const cacheAge = Date.now() - statsCache.lastFetchTime;
      if (!force && statsCache.data && cacheAge < STATS_CACHE_TTL) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await smartContactsApi.getStats(token);
        setStats(data);
        statsCache.data = data;
        statsCache.lastFetchTime = Date.now();
      } catch (err) {
        console.error("Failed to fetch contact stats:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refresh = useCallback(() => fetchStats(true), [fetchStats]);

  return { stats, isLoading, error, refresh };
};

// ─────────────────────────────────────────────────────────────────────────────
// useSmartContacts — Enhanced contact list with status filters
// ─────────────────────────────────────────────────────────────────────────────

export const useSmartContacts = (token, filters = {}) => {
  const normalizedFilters = useMemo(
    () => ({
      search: (filters.search || "").trim(),
      status: (filters.status || "").trim().toUpperCase(),
      date_from: (filters.date_from || "").trim(),
      date_to: (filters.date_to || "").trim(),
    }),
    [filters.search, filters.status, filters.date_from, filters.date_to]
  );

  const filterKey = useMemo(
    () =>
      `${normalizedFilters.search}|${normalizedFilters.status}|${normalizedFilters.date_from}|${normalizedFilters.date_to}`,
    [normalizedFilters]
  );

  const [contacts, setContacts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const abortControllerRef = useRef(null);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const isLoadingRef = useRef(false);
  const fetchIdRef = useRef(0);
  const filterKeyRef = useRef(filterKey);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);
  useEffect(() => {
    filterKeyRef.current = filterKey;
  }, [filterKey]);

  const fetchContacts = useCallback(
    async (pageNum, currentFilters, isAppending = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const currentFetchId = ++fetchIdRef.current;

      try {
        if (isAppending) setIsLoadingMore(true);
        else setIsLoading(true);
        isLoadingRef.current = true;

        const response = await smartContactsApi.getSmartContacts(
          token,
          {
            page: pageNum,
            search: currentFilters.search,
            status: currentFilters.status,
            date_from: currentFilters.date_from,
            date_to: currentFilters.date_to,
          },
          abortControllerRef.current.signal
        );

        if (currentFetchId !== fetchIdRef.current) return;

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
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        toast.error("Failed to fetch contacts");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        isLoadingRef.current = false;
      }
    },
    [token]
  );

  const loadMore = useCallback(() => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    const nextPage = pageRef.current + 1;
    setPage(nextPage);
    pageRef.current = nextPage;
    fetchContacts(nextPage, normalizedFilters, true);
  }, [fetchContacts, normalizedFilters]);

  // Reset on filter change
  useEffect(() => {
    if (!token) return;
    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    hasMoreRef.current = true;
    setContacts([]);
    fetchContacts(1, normalizedFilters, false);
  }, [token, filterKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => {
    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    hasMoreRef.current = true;
    setContacts([]);
    fetchContacts(1, normalizedFilters, false);
  }, [fetchContacts, normalizedFilters]);

  return {
    contacts,
    totalCount,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    refresh,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// useExportHistory — Past exports list
// ─────────────────────────────────────────────────────────────────────────────

export const useExportHistory = (token) => {
  const [exports, setExports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await smartContactsApi.getExportHistory(token);
      setExports(data.exports || []);
    } catch (err) {
      console.error("Failed to fetch export history:", err);
      toast.error("Failed to load export history");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { exports, isLoading, refresh: fetchHistory };
};

// ─────────────────────────────────────────────────────────────────────────────
// useContactExport — Export actions
// ─────────────────────────────────────────────────────────────────────────────

export const useContactExport = (token) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportContacts = useCallback(
    async (options = {}) => {
      if (!token || isExporting) return null;

      try {
        setIsExporting(true);
        const result = await smartContactsApi.exportVCF(token, options);
        triggerFileDownload(result.blob, result.filename);
        toast.success(`Exported ${result.contactCount} contacts`);
        return result;
      } catch (err) {
        const errorMsg =
          err.response?.status === 400
            ? "No contacts match the export criteria"
            : "Export failed. Please try again.";
        toast.error(errorMsg);
        return null;
      } finally {
        setIsExporting(false);
      }
    },
    [token, isExporting]
  );

  const downloadPastExport = useCallback(
    async (exportId) => {
      if (!token) return;
      try {
        const result = await smartContactsApi.downloadExport(token, exportId);
        triggerFileDownload(result.blob, result.filename);
        toast.success("Export downloaded");
      } catch (err) {
        toast.error("Download failed");
      }
    },
    [token]
  );

  return { isExporting, exportContacts, downloadPastExport };
};

// ─────────────────────────────────────────────────────────────────────────────
// useBulkActions — Bulk status/tag operations
// ─────────────────────────────────────────────────────────────────────────────

export const useBulkActions = (token) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const updateStatus = useCallback(
    async (contactIds, newStatus) => {
      if (!token || !contactIds.length) return null;
      try {
        setIsProcessing(true);
        const result = await smartContactsApi.bulkUpdateStatus(
          token,
          contactIds,
          newStatus
        );
        toast.success(`${result.updated} contact(s) marked as ${newStatus}`);
        return result;
      } catch (err) {
        toast.error("Failed to update status");
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [token]
  );

  const updateTags = useCallback(
    async (contactIds, action, tags) => {
      if (!token || !contactIds.length || !tags.length) return null;
      try {
        setIsProcessing(true);
        const result = await smartContactsApi.bulkUpdateTags(
          token,
          contactIds,
          action,
          tags
        );
        toast.success(
          `${result.updated} contact(s): ${action === "add" ? "added" : "removed"} tags`
        );
        return result;
      } catch (err) {
        toast.error("Failed to update tags");
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [token]
  );

  return { isProcessing, updateStatus, updateTags };
};

export default {
  useContactStats,
  useSmartContacts,
  useExportHistory,
  useContactExport,
  useBulkActions,
};