// ═══════════════════════════════════════════════════════════════════════════════
// src/components/context/ChatContext.jsx
// FIXED: Real-time mark-as-read without triggering full refresh
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
// CONTEXT CREATION
// ─────────────────────────────────────────────────────────────────────────────

const ChatContext = createContext(null);

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_TTL = 60000; // 1 minute
const BACKGROUND_REFRESH_INTERVAL = 30000; // 30 seconds
const PAGE_SIZE = 20;

// ─────────────────────────────────────────────────────────────────────────────
// ⭐ MODULE-LEVEL STORAGE - SURVIVES REACT REMOUNTS!
// ─────────────────────────────────────────────────────────────────────────────

let MODULE_SCROLL_POSITION = 0;
let MODULE_IS_SELECTING = false;

// ⭐ NEW: Track locally updated unread counts to prevent server overwrite
let LOCAL_UNREAD_OVERRIDES = new Map(); // recipient -> unread_count

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER COMPONENT
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

  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ⭐ MODULE-LEVEL SCROLL POSITION FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const setSavedScrollPosition = useCallback((value) => {
    if (MODULE_IS_SELECTING) return;
    if (value === 0) return;
    MODULE_SCROLL_POSITION = value;
  }, []);

  const getSavedScrollPosition = useCallback(() => {
    return MODULE_SCROLL_POSITION;
  }, []);

  const forceSavedScrollPosition = useCallback((value) => {
    MODULE_SCROLL_POSITION = value;
  }, []);

  const setIsSelecting = useCallback((value) => {
    MODULE_IS_SELECTING = value;
  }, []);

  const getIsSelecting = useCallback(() => {
    return MODULE_IS_SELECTING;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // ⭐ NEW: Local unread management
  // ═══════════════════════════════════════════════════════════════════════════

  const setLocalUnreadOverride = useCallback((recipient, count) => {
    LOCAL_UNREAD_OVERRIDES.set(recipient, count);
  }, []);

  const clearLocalUnreadOverride = useCallback((recipient) => {
    LOCAL_UNREAD_OVERRIDES.delete(recipient);
  }, []);

  const getLocalUnreadOverride = useCallback((recipient) => {
    return LOCAL_UNREAD_OVERRIDES.get(recipient);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // ⭐ IMPROVED: Apply local unread overrides when merging server data
  // ═══════════════════════════════════════════════════════════════════════════

  const applyLocalOverrides = useCallback((conversations) => {
    return conversations.map(conv => {
      const localOverride = LOCAL_UNREAD_OVERRIDES.get(conv.recipient);
      if (localOverride !== undefined) {
        return { ...conv, unread_count: localOverride };
      }
      return conv;
    });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH CONVERSATIONS (Core API)
  // ═══════════════════════════════════════════════════════════════════════════

  const fetchConversations = useCallback(
    async (pageNum = 1, search = "", tags = [], isAppending = false, silent = false) => {
      if (!token) return;
      if (isLoadingRef.current && !isAppending) return;

      isLoadingRef.current = true;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        if (!silent) {
          if (isAppending) {
            setIsLoadingMore(true);
          } else if (pageNum === 1 && !isInitialized) {
            setIsInitialLoading(true);
          } else {
            setIsRefreshing(true);
          }
        }

        const tagsQuery = tags.length > 0
          ? `&tags=${encodeURIComponent(tags.join(","))}`
          : "";

        const response = await axios.get(
          `${API_BASE_URL}/api/chats/?page=${pageNum}&page_size=${PAGE_SIZE}&search=${encodeURIComponent(search)}${tagsQuery}`,
          {
            headers: { Authorization: `Token ${token}` },
            signal: abortControllerRef.current.signal,
          }
        );

        const data = response.data;
        const newItems = data.results || [];
        const hasNext = !!data.next;

        if (isAppending) {
          setAllConversations((prev) => {
            const ids = new Set(prev.map((c) => c.recipient));
            const unique = newItems.filter((c) => !ids.has(c.recipient));
            return applyLocalOverrides([...prev, ...unique]);
          });
        } else if (silent && allConversations.length > 0) {
          // ⭐ IMPROVED: Silent background refresh - preserve local state
          setAllConversations((prev) => {
            const prevMap = new Map(prev.map((c) => [c.recipient, c]));

            newItems.forEach((item) => {
              const prevItem = prevMap.get(item.recipient);
              const localUnread = LOCAL_UNREAD_OVERRIDES.get(item.recipient);

              if (prevItem) {
                prevMap.set(item.recipient, {
                  ...prevItem,
                  // ⭐ CRITICAL: Use local override if exists, otherwise use server value
                  unread_count: localUnread !== undefined ? localUnread : item.unread_count,
                  last_message_text: item.last_message_text,
                  last_message_at: item.last_message_at,
                  tags: item.tags,
                });
              } else {
                // New conversation from server
                const conv = { ...item };
                // Apply local override if exists
                if (localUnread !== undefined) {
                  conv.unread_count = localUnread;
                }
                prevMap.set(item.recipient, conv);
              }
            });

            return Array.from(prevMap.values());
          });
        } else {
          // Fresh load (initial or forced refresh)
          setAllConversations(applyLocalOverrides(newItems));
        }

        setHasMore(hasNext);
        hasMoreRef.current = hasNext;
        setTotalCount(data.count || 0);
        setLastFetchTime(Date.now());
        setError(null);
        setIsInitialized(true);
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          console.error("❌ Fetch error:", err);
          setError(err.message);
        }
      } finally {
        isLoadingRef.current = false;
        setIsLoadingMore(false);
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, isInitialized, allConversations.length, applyLocalOverrides]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // LOAD MORE (Pagination)
  // ═══════════════════════════════════════════════════════════════════════════

  const loadMore = useCallback(() => {
    if (isLoadingRef.current || !hasMoreRef.current) return;

    const nextPage = pageRef.current + 1;
    setPage(nextPage);
    pageRef.current = nextPage;
    fetchConversations(nextPage, serverSearch, serverTags, true);
  }, [fetchConversations, serverSearch, serverTags]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SEARCH (Server-side)
  // ═══════════════════════════════════════════════════════════════════════════

  const searchConversations = useCallback(
    (search, tags = []) => {
      setServerSearch(search);
      setServerTags(tags);
      setPage(1);
      pageRef.current = 1;
      setHasMore(true);
      hasMoreRef.current = true;
      fetchConversations(1, search, tags, false);
    },
    [fetchConversations]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // REFRESH
  // ═══════════════════════════════════════════════════════════════════════════

  const refresh = useCallback(
    (silent = true) => {
      if (MODULE_IS_SELECTING) {
        console.log("🚫 Refresh blocked - user is selecting");
        return;
      }

      if (silent) {
        fetchConversations(1, serverSearch, serverTags, false, true);
      } else {
        setPage(1);
        pageRef.current = 1;
        setHasMore(true);
        hasMoreRef.current = true;
        fetchConversations(1, serverSearch, serverTags, false);
      }
    },
    [fetchConversations, serverSearch, serverTags]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE SINGLE CONVERSATION
  // ═══════════════════════════════════════════════════════════════════════════

  const updateConversation = useCallback((recipient, updates) => {
    setAllConversations((prev) => {
      const idx = prev.findIndex((c) => c.recipient === recipient);
      if (idx === -1) {
        return [{ recipient, ...updates }, ...prev];
      }
      const updated = [...prev];
      updated[idx] = { ...updated[idx], ...updates };
      return updated;
    });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // MOVE TO TOP (New message)
  // ═══════════════════════════════════════════════════════════════════════════

  const moveToTop = useCallback((recipient, messageData) => {
    setAllConversations((prev) => {
      const idx = prev.findIndex((c) => c.recipient === recipient);
      const localUnread = LOCAL_UNREAD_OVERRIDES.get(recipient);

      const updated = {
        recipient,
        user_name: messageData.user_name || prev[idx]?.user_name || "Unknown",
        last_message_text: messageData.text_content || "",
        last_message_at: messageData.timestamp || new Date().toISOString(),
        tags: messageData.tags || prev[idx]?.tags || [],
        // ⭐ Use local override if exists, otherwise increment
        unread_count: localUnread !== undefined 
          ? localUnread 
          : (prev[idx]?.unread_count || 0) + 1,
      };

      if (idx === -1) {
        return [updated, ...prev];
      }

      const list = prev.filter((_, i) => i !== idx);
      return [updated, ...list];
    });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // ⭐ IMPROVED: Mark as Read - Instant local update with override protection
  // ═══════════════════════════════════════════════════════════════════════════

  const markAsRead = useCallback((recipient) => {
    console.log("🔔 markAsRead called for:", recipient);
    
    // ⭐ Set local override to protect against server updates
    setLocalUnreadOverride(recipient, 0);
    
    // ⭐ Update UI immediately
    setAllConversations((prev) =>
      prev.map((c) => 
        c.recipient === recipient 
          ? { ...c, unread_count: 0 } 
          : c
      )
    );

    // ⭐ Clear override after 5 seconds (gives time for server to sync)
    setTimeout(() => {
      clearLocalUnreadOverride(recipient);
      console.log("✅ Cleared local override for:", recipient);
    }, 5000);
  }, [setLocalUnreadOverride, clearLocalUnreadOverride]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH TAGS
  // ═══════════════════════════════════════════════════════════════════════════

  const fetchTags = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/contacts/tags/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const tags = response.data.tags.map((t) => ({
        name: t.tag,
        count: t.count,
      }));
      setAvailableTags(tags);
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    }
  }, [token]);

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBSOCKET - Real-time updates
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!token) return;

    let pingInterval;
    let reconnectTimeout;
    let isMounted = true;

    const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    const backendHost = API_BASE_URL.replace(/^https?:\/\//, "");
    const wsUrl = `${wsProtocol}${backendHost}/ws/chatlist/?token=${token}`;

    const connect = () => {
      if (!isMounted) return;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("📡 ChatContext WebSocket connected");
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "pong" }));
          }
        }, 20000);
      };

      ws.onmessage = (e) => {
        if (!isMounted) return;

        try {
          const data = JSON.parse(e.data || "{}");

          if (data.type === "ping") {
            ws.send(JSON.stringify({ type: "pong" }));
            return;
          }

          const action = data.message?.action;
          const payload = data.message?.data;

          // ✅ NEW MESSAGE → move to top
          if (action === "new_message" && payload) {
            console.log("📨 WS: new_message", payload.recipient);
            moveToTop(payload.recipient, payload);
          }

          // ✅ MARK READ → instant local update with protection
          if (action === "mark_read" && payload) {
            console.log("✅ WS: mark_read", payload.recipient);
            markAsRead(payload.recipient);
          }

          // ⭐ IMPORTANT: Ignore refresh_chatlist events during selection
          if (action === "refresh_chatlist") {
            if (MODULE_IS_SELECTING) {
              console.log("🚫 WS: Ignoring refresh_chatlist during selection");
              return;
            }
            console.log("🔄 WS: refresh_chatlist");
            // Silent refresh that respects local overrides
            refresh(true);
          }
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };

      ws.onclose = () => {
        if (isMounted) {
          console.log("📡 WebSocket closed, reconnecting...");
          reconnectTimeout = setTimeout(connect, 2000);
        }
      };

      ws.onerror = () => ws.close();
    };

    connect();

    return () => {
      isMounted = false;
      if (pingInterval) clearInterval(pingInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, [token, moveToTop, markAsRead, refresh]);

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIAL LOAD
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!token) return;

    if (!isInitialized) {
      fetchConversations(1, "", [], false, true);
      fetchTags();
    }

    refreshIntervalRef.current = setInterval(() => {
      const cacheAge = Date.now() - lastFetchTime;
      if (cacheAge > CACHE_TTL && !isLoadingRef.current && isInitialized && !MODULE_IS_SELECTING) {
        refresh(true);
      }
    }, BACKGROUND_REFRESH_INTERVAL);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [token, isInitialized]); // eslint-disable-line react-hooks/exhaustive-deps

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT VALUE
  // ═══════════════════════════════════════════════════════════════════════════

  const value = useMemo(
    () => ({
      conversations: allConversations,
      isInitialLoading,
      isLoadingMore,
      isRefreshing,
      hasMore,
      totalCount,
      error,
      availableTags,
      serverSearch,
      serverTags,
      isInitialized,
      loadMore,
      refresh,
      searchConversations,
      updateConversation,
      moveToTop,
      markAsRead,
      fetchTags,
      setSavedScrollPosition,
      getSavedScrollPosition,
      forceSavedScrollPosition,
      setIsSelecting,
      getIsSelecting,
    }),
    [
      allConversations,
      isInitialLoading,
      isLoadingMore,
      isRefreshing,
      hasMore,
      totalCount,
      error,
      availableTags,
      serverSearch,
      serverTags,
      isInitialized,
      loadMore,
      refresh,
      searchConversations,
      updateConversation,
      moveToTop,
      markAsRead,
      fetchTags,
      setSavedScrollPosition,
      getSavedScrollPosition,
      forceSavedScrollPosition,
      setIsSelecting,
      getIsSelecting,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
};

export default ChatContext;