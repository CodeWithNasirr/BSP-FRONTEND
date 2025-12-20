// ═══════════════════════════════════════════════════════════════════════════════
// contacts/hooks/useGroups.js (Full Version)
// Custom hooks for Groups and Segments with caching
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { toast } from "react-toastify";
import { groupsApi, segmentsApi } from "../api/contactsApi";

// ─────────────────────────────────────────────────────────────────────────────
// CACHE (Module-level - survives component unmount)
// ─────────────────────────────────────────────────────────────────────────────

const groupsCache = {
  data: [],
  lastFetchTime: 0,
};

const segmentsCache = {
  data: [],
  lastFetchTime: 0,
};

const CACHE_TTL = 60000; // 1 minute

// ─────────────────────────────────────────────────────────────────────────────
// useGroups Hook
// ─────────────────────────────────────────────────────────────────────────────

export const useGroups = (token) => {
  const [groups, setGroups] = useState(() => groupsCache.data);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH GROUPS
  // ═══════════════════════════════════════════════════════════════════════════
  const fetchGroups = useCallback(async (force = false) => {
    if (!token) return;

    const cacheAge = Date.now() - groupsCache.lastFetchTime;
    if (!force && groupsCache.data.length > 0 && cacheAge < CACHE_TTL) {
      console.log("📦 Using cached groups");
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setIsLoading(true);
      const response = await groupsApi.getGroups(token);
      const groupsData = response.data || [];

      setGroups(groupsData);
      groupsCache.data = groupsData;
      groupsCache.lastFetchTime = Date.now();
      setError(null);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      setError(err.message);
      toast.error("Failed to fetch groups");
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [token]);

  // Initial fetch
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Sync cache
  useEffect(() => {
    groupsCache.data = groups;
  }, [groups]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE GROUP
  // ═══════════════════════════════════════════════════════════════════════════
  const createGroup = useCallback(
    async (groupName) => {
      if (!groupName?.trim()) {
        toast.error("Group name is required");
        return { success: false, error: "Group name is required" };
      }

      try {
        const response = await groupsApi.createGroup(token, groupName.trim());

        // Optimistic update
        const newGroup = response.data;
        setGroups((prev) => {
          const updated = [...prev, newGroup];
          groupsCache.data = updated;
          return updated;
        });

        toast.success(response.Message || "Group created successfully");
        return { success: true, data: newGroup };
      } catch (err) {
        const errorMsg = err.response?.data?.error || "Failed to create group";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    [token]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE GROUP(S)
  // ═══════════════════════════════════════════════════════════════════════════
  const deleteGroups = useCallback(
    async (groupIds) => {
      const ids = Array.isArray(groupIds) ? groupIds : [groupIds];

      if (ids.length === 0) {
        toast.error("No groups selected");
        return { success: false, error: "No groups selected" };
      }

      try {
        // Delete one by one (API expects single ID)
        for (const id of ids) {
          await groupsApi.deleteGroup(token, id);
        }

        // Optimistic update
        setGroups((prev) => {
          const updated = prev.filter((g) => !ids.includes(g.id));
          groupsCache.data = updated;
          return updated;
        });

        toast.success(`${ids.length} group(s) deleted successfully`);
        return { success: true };
      } catch (err) {
        const errorMsg = err.response?.data?.error || "Failed to delete group(s)";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    [token]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  const getGroupById = useCallback(
    (id) => groups.find((g) => g.id === id),
    [groups]
  );

  const getGroupByName = useCallback(
    (name) => groups.find((g) => g.group_name === name),
    [groups]
  );

  const invalidateCache = useCallback(() => {
    groupsCache.lastFetchTime = 0;
    fetchGroups(true);
  }, [fetchGroups]);

  return {
    // State
    groups,
    isLoading,
    error,

    // Actions
    fetchGroups,
    createGroup,
    deleteGroups,

    // Utilities
    getGroupById,
    getGroupByName,
    invalidateCache,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// useGroupSelection Hook
// ─────────────────────────────────────────────────────────────────────────────

export const useGroupSelection = (groups = []) => {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    const allIds = groups.map((g) => g.id);
    setSelectedIds((prev) => {
      if (prev.length === allIds.length && allIds.every((id) => prev.includes(id))) {
        return [];
      }
      return allIds;
    });
  }, [groups]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback(
    (id) => selectedIds.includes(id),
    [selectedIds]
  );

  const isAllSelected = useMemo(() => {
    if (groups.length === 0) return false;
    return groups.every((g) => selectedIds.includes(g.id));
  }, [groups, selectedIds]);

  const selectedCount = useMemo(() => selectedIds.length, [selectedIds]);

  const hasSelection = useMemo(() => selectedIds.length > 0, [selectedIds]);

  return {
    selectedIds,
    selectedCount,
    hasSelection,
    isAllSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isSelected,
    setSelectedIds,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// useSegments Hook
// ─────────────────────────────────────────────────────────────────────────────

export const useSegments = (token) => {
  const [segments, setSegments] = useState(() => segmentsCache.data);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  const fetchSegments = useCallback(async (force = false) => {
    if (!token) return;

    const cacheAge = Date.now() - segmentsCache.lastFetchTime;
    if (!force && segmentsCache.data.length > 0 && cacheAge < CACHE_TTL) {
      console.log("📦 Using cached segments");
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setIsLoading(true);
      const response = await segmentsApi.getSegments(token);
      const segmentsData = response.data || [];

      setSegments(segmentsData);
      segmentsCache.data = segmentsData;
      segmentsCache.lastFetchTime = Date.now();
      setError(null);
    } catch (err) {
      console.error("Failed to fetch segments:", err);
      setError(err.message);
      toast.error("Failed to fetch segments");
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [token]);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  return {
    segments,
    isLoading,
    error,
    fetchSegments,
  };
};

export default { useGroups, useGroupSelection, useSegments };