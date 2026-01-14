// ═══════════════════════════════════════════════════════════════════════════════
// src/components/context/ChatContext.jsx
// FIXED: Immediate unread updates + proper refresh on navigation
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

const ChatContext = createContext(null);

const CACHE_TTL = 60000;
const BACKGROUND_REFRESH_INTERVAL = 30000;
const PAGE_SIZE = 20;

let MODULE_SCROLL_POSITION = 0;
let MODULE_IS_SELECTING = false;

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

  // ⭐ NEW: Track if user is currently viewing chat list
  const [isViewingChatList, setIsViewingChatList] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // REFS
  // ═══════════════════════════════════════════════════════════════════════════

  const abortControllerRef = useRef(null);
  const isLoadingRef = useRef(false);
  const pageRef = useRef(page);
  const hasMoreRef = useRef(hasMore);
  const wsRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  const pendingRefreshRef = useRef(false);

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

  // ⭐ NEW: Notify when user enters/leaves chat list
  const notifyViewingChatList = useCallback((isViewing) => {
    console.log("📍 User viewing chat list:", isViewing);
    setIsViewingChatList(isViewing);
    
    // If user just returned and there's pending data, refresh
    if (isViewing && pendingRefreshRef.current) {
      console.log("🔄 Executing pending refresh...");
      pendingRefreshRef.current = false;
      // Small delay to let component mount
      setTimeout(() => {
        refresh(true);
      }, 100);
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH CONVERSATIONS
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
            return [...prev, ...unique];
          });
        } else if (silent && allConversations.length > 0) {
          // ⭐ IMPROVED: Silent merge - only update changed fields
          setAllConversations((prev) => {
            const prevMap = new Map(prev.map((c) => [c.recipient, c]));

            newItems.forEach((item) => {
              const prevItem = prevMap.get(item.recipient);

              if (prevItem) {
                // Update existing conversation
                prevMap.set(item.recipient, {
                  ...prevItem,
                  user_name: item.user_name,
                  last_message_text: item.last_message_text,
                  last_message_at: item.last_message_at,
                  tags: item.tags,
                  // ⭐ CRITICAL: Always use server unread for silent refresh
                  unread_count: item.unread_count,
                });
              } else {
                // New conversation
                prevMap.set(item.recipient, item);
              }
            });

            return Array.from(prevMap.values());
          });
        } else {
          // Fresh load
          setAllConversations(newItems);
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
    [token, isInitialized, allConversations.length]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // LOAD MORE
  // ═══════════════════════════════════════════════════════════════════════════

  const loadMore = useCallback(() => {
    if (isLoadingRef.current || !hasMoreRef.current) return;

    const nextPage = pageRef.current + 1;
    setPage(nextPage);
    pageRef.current = nextPage;
    fetchConversations(nextPage, serverSearch, serverTags, true);
  }, [fetchConversations, serverSearch, serverTags]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SEARCH
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
  // ⭐ IMPROVED REFRESH - Check if user is viewing
  // ═══════════════════════════════════════════════════════════════════════════

  const refresh = useCallback(
    (silent = true) => {
      if (MODULE_IS_SELECTING) {
        console.log("🚫 Refresh blocked - user is selecting");
        return;
      }

      // ⭐ If user not viewing chat list, mark as pending
      if (!isViewingChatList && silent) {
        console.log("📌 Marking refresh as pending (user away)");
        pendingRefreshRef.current = true;
        return;
      }

      console.log("🔄 Executing refresh (silent:", silent, ")");
      
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
    [fetchConversations, serverSearch, serverTags, isViewingChatList]
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
  // ⭐ IMPROVED: Move to top with immediate update
  // ═══════════════════════════════════════════════════════════════════════════

  const moveToTop = useCallback((recipient, messageData) => {
    console.log("📨 moveToTop:", recipient, "unread:", messageData.unread_count);
    
    setAllConversations((prev) => {
      const idx = prev.findIndex((c) => c.recipient === recipient);

      const updated = {
        recipient,
        user_name: messageData.user_name || prev[idx]?.user_name || "Unknown",
        last_message_text: messageData.text_content || messageData.last_message_text || "",
        last_message_at: messageData.timestamp || messageData.last_message_at || new Date().toISOString(),
        tags: messageData.tags || prev[idx]?.tags || [],
        // ⭐ Use exact unread from WebSocket
        unread_count: messageData.unread_count ?? (prev[idx]?.unread_count || 0) + 1,
      };

      if (idx === -1) {
        return [updated, ...prev];
      }

      const list = prev.filter((_, i) => i !== idx);
      return [updated, ...list];
    });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // ⭐ IMPROVED: Mark as read - instant local update
  // ═══════════════════════════════════════════════════════════════════════════

  const markAsRead = useCallback((recipient) => {
    console.log("✅ markAsRead:", recipient);
    
    setAllConversations((prev) =>
      prev.map((c) => 
        c.recipient === recipient 
          ? { ...c, unread_count: 0 } 
          : c
      )
    );
  }, []);

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
  // ⭐ IMPROVED WEBSOCKET - Better logging and state management
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
        console.log("📡 WebSocket CONNECTED");
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

          console.log("📡 WS Event:", action, payload?.recipient, "unread:", payload?.unread_count);

          // ✅ NEW MESSAGE
          if (action === "new_message" && payload) {
            moveToTop(payload.recipient, payload);
          }

          // ✅ MARK READ - instant update
          if (action === "mark_read" && payload) {
            markAsRead(payload.recipient);
          }

        } catch (err) {
          console.error("❌ WS parse error:", err);
        }
      };

      ws.onclose = () => {
        console.log("📡 WebSocket CLOSED, reconnecting...");
        if (isMounted) {
          reconnectTimeout = setTimeout(connect, 2000);
        }
      };

      ws.onerror = (err) => {
        console.error("📡 WebSocket ERROR:", err);
        ws.close();
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (pingInterval) clearInterval(pingInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, [token, moveToTop, markAsRead]);

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIAL LOAD
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!token) return;

    if (!isInitialized) {
      console.log("🚀 Initial load...");
      fetchConversations(1, "", [], false, false);
      fetchTags();
    }

    // Background refresh
    refreshIntervalRef.current = setInterval(() => {
      const cacheAge = Date.now() - lastFetchTime;
      if (cacheAge > CACHE_TTL && !isLoadingRef.current && isInitialized && !MODULE_IS_SELECTING) {
        console.log("⏰ Background refresh triggered");
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
      notifyViewingChatList, // ⭐ NEW
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
      notifyViewingChatList,
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