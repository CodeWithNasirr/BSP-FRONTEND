// ═══════════════════════════════════════════════════════════════════════════════
// src/components/context/ChatContext.jsx
// Global chat state - preloads on app start, persists across navigation
// ═══════════════════════════════════════════════════════════════════════════════

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import axios from "axios";
import API_BASE_URL from "../../../config";

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

const ChatContext = createContext(null);

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_TTL = 60000;
const BACKGROUND_REFRESH_INTERVAL = 30000;
const PAGE_SIZE = 20;

// ─────────────────────────────────────────────────────────────────────────────
// MODULE-LEVEL STATE (scroll + navigation safety)
// ─────────────────────────────────────────────────────────────────────────────

let MODULE_SCROLL_POSITION = 0;
let MODULE_IS_SELECTING = false;

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

export const ChatProvider = ({ children }) => {
  const token = localStorage.getItem("authToken");

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════

  const [allConversations, setAllConversations] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [serverSearch, setServerSearch] = useState("");
  const [serverTags, setServerTags] = useState([]);

  const [availableTags, setAvailableTags] = useState([]);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // REFS
  // ═══════════════════════════════════════════════════════════════════════════

  const abortControllerRef = useRef(null);
  const isLoadingRef = useRef(false);
  const pageRef = useRef(page);
  const hasMoreRef = useRef(hasMore);
  const wsRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  const lastWsUpdateRef = useRef(0); // ⭐ IMPORTANT

  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE-LEVEL HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  const setSavedScrollPosition = useCallback((value) => {
    if (MODULE_IS_SELECTING || value === 0) return;
    MODULE_SCROLL_POSITION = value;
  }, []);

  const getSavedScrollPosition = useCallback(() => MODULE_SCROLL_POSITION, []);
  const forceSavedScrollPosition = useCallback((v) => (MODULE_SCROLL_POSITION = v), []);
  const setIsSelecting = useCallback((v) => (MODULE_IS_SELECTING = v), []);
  const getIsSelecting = useCallback(() => MODULE_IS_SELECTING, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH CONVERSATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const fetchConversations = useCallback(
    async (pageNum = 1, search = "", tags = [], isAppending = false, silent = false) => {
      if (!token || (isLoadingRef.current && !isAppending)) return;
      isLoadingRef.current = true;

      // ❗ Abort ONLY non-silent fetches
      if (!silent && abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        if (!silent) {
          if (isAppending) setIsLoadingMore(true);
          else if (pageNum === 1 && !isInitialized) setIsInitialLoading(true);
          else setIsRefreshing(true);
        }

        const tagsQuery = tags.length ? `&tags=${encodeURIComponent(tags.join(","))}` : "";

        const res = await axios.get(
          `${API_BASE_URL}/api/chats/?page=${pageNum}&page_size=${PAGE_SIZE}&search=${encodeURIComponent(search)}${tagsQuery}`,
          {
            headers: { Authorization: `Token ${token}` },
            signal: abortControllerRef.current.signal,
          }
        );

        const newItems = res.data.results || [];
        const hasNext = !!res.data.next;

        if (isAppending) {
          setAllConversations((prev) => {
            const ids = new Set(prev.map((c) => c.recipient));
            return [...prev, ...newItems.filter((c) => !ids.has(c.recipient))];
          });
        } else if (silent && isInitialized && allConversations.length) {
          setAllConversations((prev) => {
            const map = new Map(prev.map((c) => [c.recipient, c]));
            newItems.forEach((item) => {
              const existing = map.get(item.recipient);
              if (!existing) return;
              if (new Date(item.last_message_at) >= new Date(existing.last_message_at)) {
                map.set(item.recipient, { ...existing, ...item });
              }
            });
            return [...map.values()].sort(
              (a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)
            );
          });
        } else {
        setAllConversations((prev) => {
          const map = new Map(prev.map(c => [c.recipient, c]));
          newItems.forEach(item => map.set(item.recipient, item));
          return [...map.values()].sort(
            (a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)
          );
        });
      }


        setHasMore(hasNext);
        hasMoreRef.current = hasNext;
        setTotalCount(res.data.count || 0);
        setLastFetchTime(Date.now());
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        if (err.code !== "ERR_CANCELED") {
          console.error("Fetch error:", err);
          setError(err.message);
        }
      } finally {
        isLoadingRef.current = false;
        setIsLoadingMore(false);
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, isInitialized, allConversations.length]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const loadMore = useCallback(() => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    const next = pageRef.current + 1;
    setPage(next);
    pageRef.current = next;
    fetchConversations(next, serverSearch, serverTags, true);
  }, [fetchConversations, serverSearch, serverTags]);

  const refresh = useCallback(
    (silent = true) => {
      if (MODULE_IS_SELECTING) return;
      fetchConversations(1, serverSearch, serverTags, false, silent);
    },
    [fetchConversations, serverSearch, serverTags]
  );

  const moveToTop = useCallback((recipient, data) => {
    setAllConversations((prev) => {
      const idx = prev.findIndex((c) => c.recipient === recipient);
      const prevConv = prev[idx];

      const isOutbound = data.direction === "OUTBOUND";
      const isChatOpen = MODULE_IS_SELECTING; // 👈 FINAL PIECE

      const updated = {
        recipient,
        user_name: data.user_name || prevConv?.user_name || recipient,
        last_message_text: data.text_content || "",
        last_message_at: data.timestamp || new Date().toISOString(),
        tags: prevConv?.tags || [],
        unread_count:
          isOutbound || isChatOpen
            ? prevConv?.unread_count || 0
            : (prevConv?.unread_count || 0) + 1,
      };

      if (idx === -1) return [updated, ...prev];
      return [updated, ...prev.filter((_, i) => i !== idx)];
    });
  }, []);





  const markAsRead = useCallback((recipient) => {
    setAllConversations((prev) =>
      prev.map((c) => {
        if (c.recipient !== recipient) return c;

        // 👇 force a render without changing ordering
        return {
          ...c,
          unread_count: 0,
          last_read_at: Date.now(), // 🔑 NEW (UI-only field)
        };
      })
    );
  }, []);


  // ═══════════════════════════════════════════════════════════════════════════
  // TAGS
  // ═══════════════════════════════════════════════════════════════════════════

  const fetchTags = useCallback(async () => {
    if (!token) return;
    const res = await axios.get(`${API_BASE_URL}/api/contacts/tags/`, {
      headers: { Authorization: `Token ${token}` },
    });
    setAvailableTags(res.data.tags.map((t) => ({ name: t.tag, count: t.count })));
  }, [token]);

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBSOCKET
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(
      `${window.location.protocol === "https:" ? "wss" : "ws"}://${API_BASE_URL.replace(/^https?:\/\//, "")}/ws/chatlist/?token=${token}`
    );
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const { action, data } = JSON.parse(e.data || "{}").message || {};
      if (action === "new_message") {
        lastWsUpdateRef.current = Date.now();
        moveToTop(data.recipient, data);
      }
      if (action === "mark_read") markAsRead(data.recipient);
    };

    return () => ws.close();
  }, [token, moveToTop, markAsRead]);

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIAL LOAD + BACKGROUND REFRESH
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!token) return;

    if (!isInitialized) {
      fetchConversations();
      fetchTags();
    }

    refreshIntervalRef.current = setInterval(() => {
      const cacheAge = Date.now() - lastFetchTime;
      if (
        cacheAge > CACHE_TTL &&
        Date.now() - lastWsUpdateRef.current > 15000 &&
        !isLoadingRef.current &&
        !MODULE_IS_SELECTING
      ) {
        refresh(true);
      }
    }, BACKGROUND_REFRESH_INTERVAL);

    return () => clearInterval(refreshIntervalRef.current);
  }, [token, isInitialized]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT VALUE
  // ═══════════════════════════════════════════════════════════════════════════

  const value = useMemo(() => ({
    conversations: allConversations,
    isInitialLoading,
    isLoadingMore,
    isRefreshing,
    hasMore,
    totalCount,
    error,
    availableTags,
    isInitialized,
    loadMore,
    refresh,
    moveToTop,
    markAsRead,
    fetchTags,
    setSavedScrollPosition,
    getSavedScrollPosition,
    forceSavedScrollPosition,
    setIsSelecting,
    getIsSelecting,
  }), [allConversations, isInitialLoading, isLoadingMore, isRefreshing, hasMore]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// ─────────────────────────────────────────────────────────────────────────────

export const useChatContext = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
};

export default ChatContext;
