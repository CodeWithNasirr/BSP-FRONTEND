// // ═══════════════════════════════════════════════════════════════════════════════
// // src/components/context/ChatContext.jsx
// // Global chat state - preloads on app start, persists across navigation
// // ═══════════════════════════════════════════════════════════════════════════════

// import React, {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
//   useRef,
//   useEffect,
//   useMemo,
// } from "react";
// import axios from "axios";
// import API_BASE_URL from "../../../config";

// // ─────────────────────────────────────────────────────────────────────────────
// // CONTEXT CREATION
// // ─────────────────────────────────────────────────────────────────────────────

// const ChatContext = createContext(null);

// // ─────────────────────────────────────────────────────────────────────────────
// // CONSTANTS
// // ─────────────────────────────────────────────────────────────────────────────

// const CACHE_TTL = 60000; // 1 minute
// const BACKGROUND_REFRESH_INTERVAL = 30000; // 30 seconds
// const PAGE_SIZE = 20;

// // ─────────────────────────────────────────────────────────────────────────────
// // ⭐ MODULE-LEVEL STORAGE - SURVIVES REACT REMOUNTS!
// // This is the key to preserving scroll position across navigation
// // ─────────────────────────────────────────────────────────────────────────────

// let MODULE_SCROLL_POSITION = 0;
// let MODULE_IS_SELECTING = false;

// // ─────────────────────────────────────────────────────────────────────────────
// // PROVIDER COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────

// export const ChatProvider = ({ children }) => {
//   const token = localStorage.getItem("authToken");

//   // ═══════════════════════════════════════════════════════════════════════════
//   // STATE
//   // ═══════════════════════════════════════════════════════════════════════════

//   // All conversations (master list)
//   const [allConversations, setAllConversations] = useState([]);

//   // Pagination
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [totalCount, setTotalCount] = useState(0);

//   // Loading states
//   const [isInitialLoading, setIsInitialLoading] = useState(true);
//   const [isLoadingMore, setIsLoadingMore] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   // Server-side filters
//   const [serverSearch, setServerSearch] = useState("");
//   const [serverTags, setServerTags] = useState([]);

//   // Tags
//   const [availableTags, setAvailableTags] = useState([]);

//   // Error & timestamps
//   const [error, setError] = useState(null);
//   const [lastFetchTime, setLastFetchTime] = useState(0);
//   const [isInitialized, setIsInitialized] = useState(false);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // REFS
//   // ═══════════════════════════════════════════════════════════════════════════

//   const abortControllerRef = useRef(null);
//   const isLoadingRef = useRef(false);
//   const pageRef = useRef(page);
//   const hasMoreRef = useRef(hasMore);
//   const wsRef = useRef(null);
//   const refreshIntervalRef = useRef(null);

//   // Keep refs synced
//   useEffect(() => {
//     pageRef.current = page;
//   }, [page]);
  
//   useEffect(() => {
//     hasMoreRef.current = hasMore;
//   }, [hasMore]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // ⭐ MODULE-LEVEL SCROLL POSITION FUNCTIONS
//   // These use module-level variables that survive React remounts
//   // ═══════════════════════════════════════════════════════════════════════════

//   const setSavedScrollPosition = useCallback((value) => {
//     // ⭐ CRITICAL: Block ALL updates when selecting (navigating to chat)
//     if (MODULE_IS_SELECTING) {
//     //   console.log("🚫 BLOCKED scroll update during selection:", value);
//       return;
//     }
    
//     // ⭐ CRITICAL: Never save 0 - it means nothing to restore
//     if (value === 0) {
//     //   console.log("🚫 BLOCKED scroll reset to 0");
//       return;
//     }
    
//     // console.log("✅ Saving scroll position:", value);
//     MODULE_SCROLL_POSITION = value;
//   }, []);

//   const getSavedScrollPosition = useCallback(() => {
//     return MODULE_SCROLL_POSITION;
//   }, []);

//   const forceSavedScrollPosition = useCallback((value) => {
//     // Force update even during selection (for intentional resets)
//     // console.log("🔄 Force setting scroll position:", value);
//     MODULE_SCROLL_POSITION = value;
//   }, []);

//   const setIsSelecting = useCallback((value) => {
//     // console.log("🔄 setIsSelecting:", value);
//     MODULE_IS_SELECTING = value;
//   }, []);

//   const getIsSelecting = useCallback(() => {
//     return MODULE_IS_SELECTING;
//   }, []);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // FETCH CONVERSATIONS (Core API)
//   // ═══════════════════════════════════════════════════════════════════════════

//   const fetchConversations = useCallback(
//     async (pageNum = 1, search = "", tags = [], isAppending = false, silent = false) => {
//       if (!token) return;
//       if (isLoadingRef.current && !isAppending) return;

//       isLoadingRef.current = true;

//       // Cancel previous request
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//       abortControllerRef.current = new AbortController();

//       try {
//         if (!silent) {
//           if (isAppending) {
//             setIsLoadingMore(true);
//           } else if (pageNum === 1 && !isInitialized) {
//             setIsInitialLoading(true);
//           } else {
//             setIsRefreshing(true);
//           }
//         }

//         const tagsQuery = tags.length > 0
//           ? `&tags=${encodeURIComponent(tags.join(","))}`
//           : "";

//         const response = await axios.get(
//           `${API_BASE_URL}/api/chats/?page=${pageNum}&page_size=${PAGE_SIZE}&search=${encodeURIComponent(search)}${tagsQuery}`,
//           {
//             headers: { Authorization: `Token ${token}` },
//             signal: abortControllerRef.current.signal,
//           }
//         );

//         const data = response.data;
//         const newItems = data.results || [];
//         const hasNext = !!data.next;

//         if (isAppending) {
//           // Append and deduplicate
//           setAllConversations((prev) => {
//             const ids = new Set(prev.map((c) => c.recipient));
//             const unique = newItems.filter((c) => !ids.has(c.recipient));
//             return [...prev, ...unique];
//           });
//         } else if (silent && isInitialized && allConversations.length > 0) {
//           // SILENT REFRESH: Merge new data without replacing the list
//           setAllConversations((prev) => {
//             const prevMap = new Map(prev.map((c) => [c.recipient, c]));
            
//             // Update existing items with fresh data
//             newItems.forEach((item) => {
//               if (prevMap.has(item.recipient)) {
//                 prevMap.set(item.recipient, { ...prevMap.get(item.recipient), ...item });
//               }
//             });
            
//             return Array.from(prevMap.values());
//           });
//         } else {
//           // Fresh load (initial or forced refresh)
//           setAllConversations(newItems);
//         }

//         setHasMore(hasNext);
//         hasMoreRef.current = hasNext;
//         setTotalCount(data.count || 0);
//         setLastFetchTime(Date.now());
//         setError(null);
//         setIsInitialized(true);
//       } catch (err) {
//         if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
//           console.error("❌ Fetch error:", err);
//           setError(err.message);
//         }
//       } finally {
//         isLoadingRef.current = false;
//         setIsLoadingMore(false);
//         setIsInitialLoading(false);
//         setIsRefreshing(false);
//       }
//     },
//     [token, isInitialized, allConversations.length]
//   );

//   // ═══════════════════════════════════════════════════════════════════════════
//   // LOAD MORE (Pagination)
//   // ═══════════════════════════════════════════════════════════════════════════

//   const loadMore = useCallback(() => {
//     if (isLoadingRef.current || !hasMoreRef.current) return;

//     const nextPage = pageRef.current + 1;
//     setPage(nextPage);
//     pageRef.current = nextPage;
//     fetchConversations(nextPage, serverSearch, serverTags, true);
//   }, [fetchConversations, serverSearch, serverTags]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // SEARCH (Server-side)
//   // ═══════════════════════════════════════════════════════════════════════════

//   const searchConversations = useCallback(
//     (search, tags = []) => {
//       setServerSearch(search);
//       setServerTags(tags);
//       setPage(1);
//       pageRef.current = 1;
//       setHasMore(true);
//       hasMoreRef.current = true;
//       fetchConversations(1, search, tags, false);
//     },
//     [fetchConversations]
//   );

//   // ═══════════════════════════════════════════════════════════════════════════
//   // REFRESH
//   // ═══════════════════════════════════════════════════════════════════════════

//   const refresh = useCallback(
//     (silent = true) => {
//       // ⭐ Block refresh during selection
//       if (MODULE_IS_SELECTING) {
//         console.log("🚫 Refresh blocked - user is selecting");
//         return;
//       }

//       if (silent) {
//         fetchConversations(1, serverSearch, serverTags, false, true);
//       } else {
//         setPage(1);
//         pageRef.current = 1;
//         setHasMore(true);
//         hasMoreRef.current = true;
//         fetchConversations(1, serverSearch, serverTags, false);
//       }
//     },
//     [fetchConversations, serverSearch, serverTags]
//   );

//   // ═══════════════════════════════════════════════════════════════════════════
//   // UPDATE SINGLE CONVERSATION
//   // ═══════════════════════════════════════════════════════════════════════════

//   const updateConversation = useCallback((recipient, updates) => {
//     setAllConversations((prev) => {
//       const idx = prev.findIndex((c) => c.recipient === recipient);
//       if (idx === -1) {
//         return [{ recipient, ...updates }, ...prev];
//       }
//       const updated = [...prev];
//       updated[idx] = { ...updated[idx], ...updates };
//       return updated;
//     });
//   }, []);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // MOVE TO TOP (New message)
//   // ═══════════════════════════════════════════════════════════════════════════

//   const moveToTop = useCallback((recipient, messageData) => {
//     setAllConversations((prev) => {
//       const idx = prev.findIndex((c) => c.recipient === recipient);

//       const updated = {
//         recipient,
//         user_name: messageData.user_name || prev[idx]?.user_name || "Unknown",
//         last_message_text: messageData.text_content || "",
//         last_message_at: messageData.timestamp || new Date().toISOString(),
//         tags: messageData.tags || prev[idx]?.tags || [],
//         unread_count: (prev[idx]?.unread_count || 0) + 1,
//       };

//       if (idx === -1) {
//         return [updated, ...prev];
//       }

//       const list = prev.filter((_, i) => i !== idx);
//       return [updated, ...list];
//     });
//   }, []);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // MARK AS READ - Local only, no refresh, no re-ordering
//   // ═══════════════════════════════════════════════════════════════════════════

//   const markAsRead = useCallback((recipient) => {
//     setAllConversations((prev) =>
//       prev.map((c) => 
//         c.recipient === recipient 
//           ? { ...c, unread_count: 0 } 
//           : c
//       )
//     );
//   }, []);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // FETCH TAGS
//   // ═══════════════════════════════════════════════════════════════════════════

//   const fetchTags = useCallback(async () => {
//     if (!token) return;
//     try {
//       const response = await axios.get(`${API_BASE_URL}/api/contacts/tags/`, {
//         headers: { Authorization: `Token ${token}` },
//       });
//       const tags = response.data.tags.map((t) => ({
//         name: t.tag,
//         count: t.count,
//       }));
//       setAvailableTags(tags);
//     } catch (err) {
//       console.error("Failed to fetch tags:", err);
//     }
//   }, [token]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // WEBSOCKET - Real-time updates (without full refresh)
//   // ═══════════════════════════════════════════════════════════════════════════

//   useEffect(() => {
//     if (!token) return;

//     let pingInterval;
//     let reconnectTimeout;
//     let isMounted = true;

//     const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
//     const backendHost = API_BASE_URL.replace(/^https?:\/\//, "");
//     const wsUrl = `${wsProtocol}${backendHost}/ws/chatlist/?token=${token}`;

//     const connect = () => {
//       if (!isMounted) return;

//       const ws = new WebSocket(wsUrl);
//       wsRef.current = ws;

//       ws.onopen = () => {
//         console.log("📡 ChatContext WebSocket connected");
//         pingInterval = setInterval(() => {
//           if (ws.readyState === WebSocket.OPEN) {
//             ws.send(JSON.stringify({ type: "pong" }));
//           }
//         }, 20000);
//       };

//       ws.onmessage = (e) => {
//         if (!isMounted) return;
//         try {
//           const data = JSON.parse(e.data || "{}");

//           if (data.type === "ping") {
//             ws.send(JSON.stringify({ type: "pong" }));
//             return;
//           }

//           const action = data.message?.action;
//           const payload = data.message?.data;

//           if (action === "refresh_chatlist") {
//             // ⭐ BLOCK refresh while user is navigating
//             if (!MODULE_IS_SELECTING) {
//               refresh(true);
//             } else {
//               console.log("🚫 WebSocket refresh blocked - user is selecting");
//             }
//           } else if (action === "new_message" && payload) {
//             moveToTop(payload.recipient, payload);
//           } else if (action === "mark_read" && payload) {
//             markAsRead(payload.recipient);
//           }
//         } catch (err) {
//           console.error("WS parse error:", err);
//         }
//       };

//       ws.onclose = () => {
//         if (isMounted) {
//           reconnectTimeout = setTimeout(connect, 2000);
//         }
//       };

//       ws.onerror = () => ws.close();
//     };

//     connect();

//     return () => {
//       isMounted = false;
//       if (pingInterval) clearInterval(pingInterval);
//       if (reconnectTimeout) clearTimeout(reconnectTimeout);
//       if (wsRef.current) wsRef.current.close();
//     };
//   }, [token, refresh, moveToTop, markAsRead]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // INITIAL LOAD - Only fetch once, preserve state across navigation
//   // ═══════════════════════════════════════════════════════════════════════════

//   useEffect(() => {
//     if (!token) return;

//     // IMPORTANT: Only fetch if NOT already initialized
//     if (!isInitialized) {
//       fetchConversations(1, "", [], false);
//       fetchTags();
//     }

//     // Background refresh interval
//     refreshIntervalRef.current = setInterval(() => {
//       const cacheAge = Date.now() - lastFetchTime;
//       if (cacheAge > CACHE_TTL && !isLoadingRef.current && isInitialized && !MODULE_IS_SELECTING) {
//         refresh(true);
//       }
//     }, BACKGROUND_REFRESH_INTERVAL);

//     return () => {
//       if (refreshIntervalRef.current) {
//         clearInterval(refreshIntervalRef.current);
//       }
//     };
//   }, [token, isInitialized]); // eslint-disable-line react-hooks/exhaustive-deps

//   // ═══════════════════════════════════════════════════════════════════════════
//   // CONTEXT VALUE
//   // ═══════════════════════════════════════════════════════════════════════════

//   const value = useMemo(
//     () => ({
//       // State
//       conversations: allConversations,
//       isInitialLoading,
//       isLoadingMore,
//       isRefreshing,
//       hasMore,
//       totalCount,
//       error,
//       availableTags,
//       serverSearch,
//       serverTags,
//       isInitialized,

//       // Actions
//       loadMore,
//       refresh,
//       searchConversations,
//       updateConversation,
//       moveToTop,
//       markAsRead,
//       fetchTags,
      
//       // ⭐ Module-level scroll position (survives remounts!)
//       setSavedScrollPosition,
//       getSavedScrollPosition,
//       forceSavedScrollPosition,
//       setIsSelecting,
//       getIsSelecting,
//     }),
//     [
//       allConversations,
//       isInitialLoading,
//       isLoadingMore,
//       isRefreshing,
//       hasMore,
//       totalCount,
//       error,
//       availableTags,
//       serverSearch,
//       serverTags,
//       isInitialized,
//       loadMore,
//       refresh,
//       searchConversations,
//       updateConversation,
//       moveToTop,
//       markAsRead,
//       fetchTags,
//       setSavedScrollPosition,
//       getSavedScrollPosition,
//       forceSavedScrollPosition,
//       setIsSelecting,
//       getIsSelecting,
//     ]
//   );

//   return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // HOOK - Use this in components
// // ─────────────────────────────────────────────────────────────────────────────

// export const useChatContext = () => {
//   const context = useContext(ChatContext);
//   if (!context) {
//     throw new Error("useChatContext must be used within ChatProvider");
//   }
//   return context;
// };

// export default ChatContext;


// ═══════════════════════════════════════════════════════════════════════════════
// src/components/Chat/context/ChatContext.jsx
// UPGRADED: Selection mode, filters, broadcast support
// ═══════════════════════════════════════════════════════════════════════════════
//
// CHANGES FROM ORIGINAL:
// ✅ Added selection mode state (ref-based Set for perf)
// ✅ Added activeFilter state (all/unread/expired)
// ✅ Added filteredConversations memoized getter
// ✅ Added broadcast result handling via WebSocket
// ✅ All existing functionality preserved
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

const CACHE_TTL = 60000;
const BACKGROUND_REFRESH_INTERVAL = 30000;
const PAGE_SIZE = 20;

// ─────────────────────────────────────────────────────────────────────────────
// MODULE-LEVEL STORAGE
// ─────────────────────────────────────────────────────────────────────────────

let MODULE_SCROLL_POSITION = 0;
let MODULE_IS_SELECTING = false;

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const ChatProvider = ({ children }) => {
  const token = localStorage.getItem("authToken");

  // ═══════════════════════════════════════════════════════════════════════════
  // EXISTING STATE
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
  // ✅ NEW: FILTER STATE
  // ═══════════════════════════════════════════════════════════════════════════

  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "unread" | "expired"

  // ═══════════════════════════════════════════════════════════════════════════
  // ✅ NEW: SELECTION MODE (Broadcast)
  // Using ref for the Set to avoid re-renders when toggling individual items.
  // Only `selectedCount` is in state (triggers header badge update).
  // ═══════════════════════════════════════════════════════════════════════════

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const selectedRecipientsRef = useRef(new Set());
  const [selectedCount, setSelectedCount] = useState(0);

  // ✅ NEW: Broadcast result from WebSocket
  const [broadcastResult, setBroadcastResult] = useState(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // REFS (existing)
  // ═══════════════════════════════════════════════════════════════════════════

  const abortControllerRef = useRef(null);
  const isLoadingRef = useRef(false);
  const pageRef = useRef(page);
  const hasMoreRef = useRef(hasMore);
  const wsRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ✅ NEW: FILTERED CONVERSATIONS (client-side, memoized)
  // ═══════════════════════════════════════════════════════════════════════════

  const filteredConversations = useMemo(() => {
    if (activeFilter === "all") return allConversations;
    if (activeFilter === "unread") return allConversations.filter((c) => c.unread_count > 0);
    if (activeFilter === "expired") return allConversations.filter((c) => c.is_expired);
    return allConversations;
  }, [allConversations, activeFilter]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ✅ NEW: SELECTION HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
  }, []);

  const toggleSelectRecipient = useCallback(
    (recipient) => {
      // Block selecting expired conversations
      const conv = allConversations.find((c) => c.recipient === recipient);
      if (conv?.is_expired) return;

      const set = selectedRecipientsRef.current;
      if (set.has(recipient)) {
        set.delete(recipient);
      } else {
        set.add(recipient);
      }
      setSelectedCount(set.size);
    },
    [allConversations]
  );

  const clearSelection = useCallback(() => {
    selectedRecipientsRef.current = new Set();
    setSelectedCount(0);
    setIsSelectionMode(false);
  }, []);

  const getSelectedRecipients = useCallback(() => {
    return Array.from(selectedRecipientsRef.current);
  }, []);

  const isRecipientSelected = useCallback((recipient) => {
    return selectedRecipientsRef.current.has(recipient);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE-LEVEL SCROLL POSITION FUNCTIONS (existing)
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
  // FETCH CONVERSATIONS (existing, unchanged)
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

        const tagsQuery =
          tags.length > 0 ? `&tags=${encodeURIComponent(tags.join(","))}` : "";

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
        } else if (silent && isInitialized && allConversations.length > 0) {
          setAllConversations((prev) => {
            const prevMap = new Map(prev.map((c) => [c.recipient, c]));
            newItems.forEach((item) => {
              if (prevMap.has(item.recipient)) {
                prevMap.set(item.recipient, { ...prevMap.get(item.recipient), ...item });
              }
            });
            return Array.from(prevMap.values());
          });
        } else {
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
  // LOAD MORE (existing, unchanged)
  // ═══════════════════════════════════════════════════════════════════════════

  const loadMore = useCallback(() => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    const nextPage = pageRef.current + 1;
    setPage(nextPage);
    pageRef.current = nextPage;
    fetchConversations(nextPage, serverSearch, serverTags, true);
  }, [fetchConversations, serverSearch, serverTags]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SEARCH (existing, unchanged)
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
  // REFRESH (existing, unchanged)
  // ═══════════════════════════════════════════════════════════════════════════

  const refresh = useCallback(
    (silent = true) => {
      if (MODULE_IS_SELECTING) {
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
  // UPDATE SINGLE CONVERSATION (existing, unchanged)
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
  // MOVE TO TOP (existing, unchanged)
  // ═══════════════════════════════════════════════════════════════════════════

  const moveToTop = useCallback((recipient, messageData) => {
    setAllConversations((prev) => {
      const idx = prev.findIndex((c) => c.recipient === recipient);

      const updated = {
        recipient,
        user_name: messageData.user_name || prev[idx]?.user_name || "Unknown",
        last_message_text: messageData.text_content || "",
        last_message_at: messageData.timestamp || new Date().toISOString(),
        tags: messageData.tags || prev[idx]?.tags || [],
        unread_count: (prev[idx]?.unread_count || 0) + 1,
        is_expired: prev[idx]?.is_expired ?? false, // ✅ Preserve expiry status
      };

      if (idx === -1) {
        return [updated, ...prev];
      }

      const list = prev.filter((_, i) => i !== idx);
      return [updated, ...list];
    });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // MARK AS READ (existing, unchanged)
  // ═══════════════════════════════════════════════════════════════════════════

  const markAsRead = useCallback((recipient) => {
    setAllConversations((prev) =>
      prev.map((c) =>
        c.recipient === recipient ? { ...c, unread_count: 0 } : c
      )
    );
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH TAGS (existing, unchanged)
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
  // ✅ NEW: BROADCAST API CALL
  // ═══════════════════════════════════════════════════════════════════════════

  const sendBroadcast = useCallback(
    async (messageText, mediaUrl = null, mediaType = null) => {
      const recipients = getSelectedRecipients();
      if (recipients.length === 0) return { error: "No recipients selected" };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/chats/broadcast/`,
          {
            recipients,
            message_text: messageText,
            media_url: mediaUrl,
            media_type: mediaType,
          },
          { headers: { Authorization: `Token ${token}` } }
        );

        // Clear selection after successful queue
        clearSelection();

        return response.data;
      } catch (err) {
        console.error("Broadcast error:", err);
        return {
          error: err.response?.data?.error || "Failed to send broadcast",
        };
      }
    },
    [token, getSelectedRecipients, clearSelection]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBSOCKET — ✅ EXTENDED with broadcast_result
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

          if (action === "refresh_chatlist") {
            if (!MODULE_IS_SELECTING) {
              refresh(true);
            }
          } else if (action === "new_message" && payload) {
            moveToTop(payload.recipient, payload);
          } else if (action === "mark_read" && payload) {
            markAsRead(payload.recipient);
          }
          // ✅ NEW: Handle broadcast completion
          else if (action === "broadcast_result" && payload) {
            setBroadcastResult({
              sent: payload.sent,
              failed: payload.failed,
              total: payload.total,
              timestamp: Date.now(),
            });
            // Refresh to show updated last messages
            if (!MODULE_IS_SELECTING) {
              setTimeout(() => refresh(true), 1000);
            }
          }
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };

      ws.onclose = () => {
        if (isMounted) {
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
  }, [token, refresh, moveToTop, markAsRead]);

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIAL LOAD (existing, unchanged)
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!token) return;

    if (!isInitialized) {
      fetchConversations(1, "", [], false);
      fetchTags();
    }

    refreshIntervalRef.current = setInterval(() => {
      const cacheAge = Date.now() - lastFetchTime;
      if (
        cacheAge > CACHE_TTL &&
        !isLoadingRef.current &&
        isInitialized &&
        !MODULE_IS_SELECTING
      ) {
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
      // State
      conversations: allConversations,
      filteredConversations, // ✅ NEW
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

      // ✅ NEW: Filter
      activeFilter,
      setActiveFilter,

      // ✅ NEW: Selection mode
      isSelectionMode,
      selectedCount,
      enterSelectionMode,
      toggleSelectRecipient,
      clearSelection,
      getSelectedRecipients,
      isRecipientSelected,

      // ✅ NEW: Broadcast
      sendBroadcast,
      broadcastResult,
      setBroadcastResult,

      // Actions (existing)
      loadMore,
      refresh,
      searchConversations,
      updateConversation,
      moveToTop,
      markAsRead,
      fetchTags,

      // Scroll position (existing)
      setSavedScrollPosition,
      getSavedScrollPosition,
      forceSavedScrollPosition,
      setIsSelecting,
      getIsSelecting,
    }),
    [
      allConversations,
      filteredConversations,
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
      activeFilter,
      isSelectionMode,
      selectedCount,
      broadcastResult,
      loadMore,
      refresh,
      searchConversations,
      updateConversation,
      moveToTop,
      markAsRead,
      fetchTags,
      enterSelectionMode,
      toggleSelectRecipient,
      clearSelection,
      getSelectedRecipients,
      isRecipientSelected,
      sendBroadcast,
      setSavedScrollPosition,
      getSavedScrollPosition,
      forceSavedScrollPosition,
      setIsSelecting,
      getIsSelecting,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
};

export default ChatContext;