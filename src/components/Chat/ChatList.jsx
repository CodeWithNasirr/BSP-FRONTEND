import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
import axios from "axios";
import debounce from "lodash/debounce";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";
import { MagnifyingGlassIcon, Bars3Icon, ChevronUpIcon } from "@heroicons/react/24/solid";
import MarkPurchaseModal from "./MarkPurchaseModal";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * VIRTUALIZED WHATSAPP-STYLE CHAT LIST (FIXED VERSION)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * FIXES:
 * ✅ Infinite scroll now loads ALL pages (not just page 2)
 * ✅ Cached state - no reload when returning from chat
 * ✅ Proper scroll event handling for load detection
 */

// ─────────────────────────────────────────────────────────────────────────────
// 📐 CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 88;
const BUFFER_SIZE = 5;
const OVERSCAN = 3;
const SCROLL_THRESHOLD = 300; // px from bottom to trigger load

// ─────────────────────────────────────────────────────────────────────────────
// 💾 SIMPLE CACHE (persists across component mounts)
// ─────────────────────────────────────────────────────────────────────────────

// Cache object lives outside component - survives unmount/remount
const listCache = {
  conversations: [],
  page: 1,
  hasMore: true,
  scrollTop: 0,
  searchQuery: "",
  selectedTags: [],
  lastFetchTime: 0,
};

const CACHE_TTL = 30000; // 30 seconds - refetch if older

// ─────────────────────────────────────────────────────────────────────────────
// 🎨 VIRTUALIZED CHAT ITEM
// ─────────────────────────────────────────────────────────────────────────────

const VirtualChatItem = memo(
  ({ conv, style, onSelect, onMarkPurchase, formatTimestamp }) => (
    <div
      style={style}
      className="absolute left-0 right-0 flex items-start gap-3 px-4 py-3
                 cursor-pointer hover:bg-gray-50 active:bg-gray-100 
                 border-b border-gray-50 transition-colors"
      onClick={() => onSelect(conv.recipient)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 
                      flex items-center justify-center text-white font-semibold text-lg shadow-sm"
        >
          {(conv.user_name || "U")[0].toUpperCase()}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="font-semibold text-gray-900 truncate text-[15px]">
            {conv.user_name || "Unknown"}
          </h4>
          <span
            className={`flex-shrink-0 text-xs ${
              conv.unread_count > 0 ? "text-emerald-600 font-medium" : "text-gray-500"
            }`}
          >
            {formatTimestamp(conv.last_message_at)}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          <p
            className={`text-sm truncate flex-1 ${
              conv.unread_count > 0 ? "text-gray-800 font-medium" : "text-gray-500"
            }`}
          >
            {conv.last_message_text || "No messages yet"}
          </p>
          {conv.unread_count > 0 && (
            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {conv.unread_count > 99 ? "99+" : conv.unread_count}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-1.5">
          {conv.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full"
            >
              {tag}
            </span>
          ))}
          {conv.tags?.length > 2 && (
            <span className="text-[10px] text-gray-400">+{conv.tags.length - 2}</span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkPurchase(conv);
            }}
            className="ml-auto text-[10px] font-medium text-indigo-600 hover:text-indigo-800 
                       px-1.5 py-0.5 rounded hover:bg-indigo-50"
          >
            💰 Purchase
          </button>
        </div>
      </div>
    </div>
  ),
  (prev, next) =>
    prev.conv.recipient === next.conv.recipient &&
    prev.conv.last_message_at === next.conv.last_message_at &&
    prev.conv.unread_count === next.conv.unread_count &&
    prev.style.top === next.style.top
);

VirtualChatItem.displayName = "VirtualChatItem";

// ─────────────────────────────────────────────────────────────────────────────
// 🏠 MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const ChatListVirtualized = ({ onSelectConversation }) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE - Initialize from cache if available
  // ═══════════════════════════════════════════════════════════════════════════
  const [conversations, setConversations] = useState(() => listCache.conversations);
  const [searchQuery, setSearchQuery] = useState(() => listCache.searchQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(() => listCache.searchQuery);
  const [selectedTags, setSelectedTags] = useState(() => listCache.selectedTags);
  const [availableTags, setAvailableTags] = useState([]);
  const [showTags, setShowTags] = useState(false);
  const token = localStorage.getItem("authToken");

  // Pagination
  const [page, setPage] = useState(() => listCache.page);
  const [hasMore, setHasMore] = useState(() => listCache.hasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(() => listCache.conversations.length === 0);

  // New messages indicator
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  // Scroll state for virtualization
  const [scrollTop, setScrollTop] = useState(() => listCache.scrollTop);
  const [containerHeight, setContainerHeight] = useState(0);

  // Modal
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [purchaseForm, setPurchaseForm] = useState({
    amount: "",
    location: "",
    tags: [],
    tagInput: "",
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // REFS
  // ═══════════════════════════════════════════════════════════════════════════
  const listContainerRef = useRef(null);
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef(null);

  // Stable refs for async callbacks
  const pageRef = useRef(page);
  const hasMoreRef = useRef(hasMore);
  const searchRef = useRef(debouncedSearch);
  const tagsRef = useRef(selectedTags);
  const conversationsRef = useRef(conversations);

  // Keep refs updated
  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { searchRef.current = debouncedSearch; }, [debouncedSearch]);
  useEffect(() => { tagsRef.current = selectedTags; }, [selectedTags]);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CACHE SYNC - Save state to cache on changes
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    listCache.conversations = conversations;
    listCache.page = page;
    listCache.hasMore = hasMore;
    listCache.searchQuery = debouncedSearch;
    listCache.selectedTags = selectedTags;
  }, [conversations, page, hasMore, debouncedSearch, selectedTags]);

  // Save scroll position on scroll
  const saveScrollPosition = useCallback(() => {
    if (listContainerRef.current) {
      listCache.scrollTop = listContainerRef.current.scrollTop;
    }
  }, []);

  // Restore scroll position on mount
  useEffect(() => {
    if (listContainerRef.current && listCache.scrollTop > 0) {
      listContainerRef.current.scrollTop = listCache.scrollTop;
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // VIRTUALIZATION CALCULATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  const totalHeight = conversations.length * ITEM_HEIGHT;

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT);
    const endIndex = Math.min(
      conversations.length - 1,
      startIndex + visibleCount + BUFFER_SIZE * 2 + OVERSCAN
    );
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, conversations.length]);

  const visibleItems = useMemo(() => {
    const items = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex && i < conversations.length; i++) {
      items.push({
        index: i,
        conv: conversations[i],
        style: {
          position: "absolute",
          top: i * ITEM_HEIGHT,
          left: 0,
          right: 0,
          height: ITEM_HEIGHT,
        },
      });
    }
    return items;
  }, [visibleRange, conversations]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SCROLL HANDLER (Fixed - proper infinite scroll detection)
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const container = listContainerRef.current;
    if (!container) return;

    let rafId = null;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const currentScrollTop = container.scrollTop;
          const scrollHeight = container.scrollHeight;
          const clientHeight = container.clientHeight;
          
          // Update scroll position for virtualization
          setScrollTop(currentScrollTop);
          
          // Save to cache
          listCache.scrollTop = currentScrollTop;

          // ⭐ KEY FIX: Check if near bottom and should load more
          const distanceFromBottom = scrollHeight - currentScrollTop - clientHeight;
          
          if (
            distanceFromBottom < SCROLL_THRESHOLD &&
            hasMoreRef.current &&
            !isLoadingRef.current
          ) {
            // Trigger load more
            loadMoreConversations();
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    const handleResize = () => {
      setContainerHeight(container.clientHeight);
    };

    // Initial measurement
    handleResize();
    
    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty deps - refs handle the values

  // ═══════════════════════════════════════════════════════════════════════════
  // LOAD MORE FUNCTION (Separated for clarity)
  // ═══════════════════════════════════════════════════════════════════════════
  const loadMoreConversations = useCallback(() => {
    if (isLoadingRef.current || !hasMoreRef.current) return;

    const nextPage = pageRef.current + 1;
    // console.log(`📜 Loading page ${nextPage}...`);
    
    setPage(nextPage);
    fetchChatListInternal(nextPage, searchRef.current, tagsRef.current, true);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH CHAT LIST (Core API call)
  // ═══════════════════════════════════════════════════════════════════════════
  const fetchChatListInternal = useCallback(
    async (pageNum, query, tags, isAppending = false) => {
      // Prevent duplicate fetches
      if (isLoadingRef.current) {
        // console.log("⏳ Already loading, skipping...");
        return;
      }
      
      isLoadingRef.current = true;
      // console.log(`📡 Fetching page ${pageNum}, appending: ${isAppending}`);

      // Cancel pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        if (isAppending) {
          setIsLoadingMore(true);
        } else {
          setIsInitialLoad(true);
        }

        const tagsQuery = tags.length > 0
          ? `&tags=${encodeURIComponent(tags.join(","))}`
          : "";

        const response = await axios.get(
          `${API_BASE_URL}/api/chats/?page=${pageNum}&search=${encodeURIComponent(query)}${tagsQuery}`,
          {
            headers: { Authorization: `Token ${token}` },
            signal: abortControllerRef.current.signal,
          }
        );

        const data = response.data;
        const newItems = data.results || [];
        
        // console.log(`✅ Received ${newItems.length} items, hasNext: ${!!data.next}`);

        if (isAppending) {
          // Append new items, deduplicate
          setConversations((prev) => {
            const ids = new Set(prev.map((c) => c.recipient));
            const uniqueNew = newItems.filter((c) => !ids.has(c.recipient));
            // console.log(`📝 Appending ${uniqueNew.length} unique items`);
            return [...prev, ...uniqueNew];
          });
        } else {
          // Fresh load
          setConversations(newItems);
          setNewMessagesCount(0);
        }

        // Update hasMore
        const hasNext = !!data.next;
        setHasMore(hasNext);
        hasMoreRef.current = hasNext;
        
        // Update cache timestamp
        listCache.lastFetchTime = Date.now();

      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          console.error("❌ Fetch error:", err);
          toast.error("Failed to fetch chats");
        }
      } finally {
        isLoadingRef.current = false;
        setIsLoadingMore(false);
        setIsInitialLoad(false);
      }
    },
    [token]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // DEBOUNCED SEARCH
  // ═══════════════════════════════════════════════════════════════════════════
  const debouncedSetSearch = useMemo(
    () => debounce((val) => setDebouncedSearch(val), 400),
    []
  );

  const handleSearchChange = useCallback(
    (e) => {
      setSearchQuery(e.target.value);
      debouncedSetSearch(e.target.value);
    },
    [debouncedSetSearch]
  );

  useEffect(() => () => debouncedSetSearch.cancel(), [debouncedSetSearch]);

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIAL LOAD & FILTER CHANGES
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!token) return;

    // Check if we should use cache or fetch fresh
    const cacheAge = Date.now() - listCache.lastFetchTime;
    const filtersChanged = 
      listCache.searchQuery !== debouncedSearch ||
      JSON.stringify(listCache.selectedTags) !== JSON.stringify(selectedTags);

    if (
      listCache.conversations.length > 0 &&
      cacheAge < CACHE_TTL &&
      !filtersChanged
    ) {
      // console.log("📦 Using cached data");
      setIsInitialLoad(false);
      return;
    }

    // Fetch fresh data
    // console.log("🔄 Fetching fresh data");
    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    hasMoreRef.current = true;
    setConversations([]);
    
    if (listContainerRef.current) {
      listContainerRef.current.scrollTop = 0;
    }

    fetchChatListInternal(1, debouncedSearch, selectedTags, false);
  }, [token, debouncedSearch, selectedTags, fetchChatListInternal]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT SELECTION (Preserves cache)
  // ═══════════════════════════════════════════════════════════════════════════
  const handleSelect = useCallback(
    (recipient) => {
      // Mark as read locally
      setConversations((prev) =>
        prev.map((c) => (c.recipient === recipient ? { ...c, unread_count: 0 } : c))
      );

      // Save scroll position before navigating
      saveScrollPosition();

      // Call parent handler
      onSelectConversation(recipient);
    },
    [onSelectConversation, saveScrollPosition]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBSOCKET
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!token) return;

    let ws;
    let pingInterval;
    let isMounted = true;
    let reconnectTimeout;

    const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    const backendHost = API_BASE_URL.replace(/^https?:\/\//, "");
    const wsUrl = `${wsProtocol}${backendHost}/ws/chatlist/?token=${token}`;

    const connect = () => {
      if (!isMounted) return;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
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
            // Invalidate cache and refetch
            listCache.lastFetchTime = 0;
            fetchChatListInternal(1, searchRef.current, tagsRef.current, false);
          } else if (action === "new_message" && payload) {
            // Move conversation to top
            setConversations((prev) => {
              const idx = prev.findIndex((c) => c.recipient === payload.recipient);
              const updated = {
                recipient: payload.recipient,
                user_name: payload.user_name || prev[idx]?.user_name || "Unknown",
                last_message_text: payload.text_content || "",
                last_message_at: payload.timestamp || new Date().toISOString(),
                tags: payload.tags || prev[idx]?.tags || [],
                unread_count: (prev[idx]?.unread_count || 0) + 1,
              };
              if (idx === -1) return [updated, ...prev];
              const list = prev.filter((_, i) => i !== idx);
              return [updated, ...list];
            });
            setNewMessagesCount((c) => c + 1);
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
      if (ws) ws.close();
    };
  }, [token, fetchChatListInternal]);

  // ═══════════════════════════════════════════════════════════════════════════
  // TAG HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════
  const handleTagChange = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_BASE_URL}/api/contacts/tags/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        setAvailableTags(res.data.tags.map((t) => ({ name: t.tag, count: t.count })));
      })
      .catch(() => {});
  }, [token]);

  // ═══════════════════════════════════════════════════════════════════════════
  // MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  const handleOpenModal = useCallback((contact) => {
    setSelectedContact(contact);
    setPurchaseForm({ amount: "", location: "", tags: contact.tags || [], tagInput: "" });
    setShowPurchaseModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowPurchaseModal(false);
    setSelectedContact(null);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILS
  // ═══════════════════════════════════════════════════════════════════════════
  const formatTimestamp = useCallback((ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, []);

  const scrollToTop = useCallback(() => {
    listContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setNewMessagesCount(0);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedTags([]);
  }, []);

  const isScrolledDown = scrollTop > 200;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="p-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search conversations..."
              className="w-full py-2.5 pl-10 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm
                         placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <button
              onClick={() => setShowTags((p) => !p)}
              className={`absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded-lg transition-colors
                         ${showTags ? "bg-emerald-100 text-emerald-600" : "hover:bg-gray-100 text-gray-500"}`}
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>

          {showTags && availableTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              {availableTags.map((t) => (
                <button
                  key={t.name}
                  onClick={() => handleTagChange(t.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                             ${selectedTags.includes(t.name)
                               ? "bg-emerald-500 text-white"
                               : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {t.name} ({t.count})
                </button>
              ))}
            </div>
          )}

          {/* Active filters */}
          {(selectedTags.length > 0 || debouncedSearch) && (
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-gray-500">Filters:</span>
              {debouncedSearch && (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                  "{debouncedSearch}"
                </span>
              )}
              {selectedTags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full">
                  {tag}
                </span>
              ))}
              <button onClick={clearFilters} className="ml-auto text-red-500 hover:text-red-600">
                Clear
              </button>
            </div>
          )}
        </div>
      </header>

      {/* New Messages Indicator */}
      {newMessagesCount > 0 && isScrolledDown && (
        <button
          onClick={scrollToTop}
          className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 
                     bg-emerald-500 text-white text-sm font-medium rounded-full 
                     shadow-lg hover:bg-emerald-600 flex items-center gap-2"
        >
          <ChevronUpIcon className="w-4 h-4" />
          {newMessagesCount} new
        </button>
      )}

      {/* Virtualized List Container */}
      <div
        ref={listContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Loading */}
        {isInitialLoad && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm text-gray-500">Loading...</p>
          </div>
        )}

        {/* Empty */}
        {!isInitialLoad && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">No conversations</h3>
            {(debouncedSearch || selectedTags.length > 0) && (
              <button onClick={clearFilters} className="mt-4 px-4 py-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Virtualized List */}
        {!isInitialLoad && conversations.length > 0 && (
          <div style={{ height: totalHeight, position: "relative" }}>
            {visibleItems.map(({ conv, style }) => (
              <VirtualChatItem
                key={conv.recipient}
                conv={conv}
                style={style}
                onSelect={handleSelect}
                onMarkPurchase={handleOpenModal}
                formatTimestamp={formatTimestamp}
              />
            ))}
          </div>
        )}

        {/* Loading More */}
        {isLoadingMore && (
          <div className="flex items-center justify-center py-4">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-sm text-gray-500">Loading more...</span>
          </div>
        )}

        {/* End indicator */}
        {!hasMore && conversations.length > 10 && (
          <div className="text-center py-6 text-xs text-gray-400">
            — End of conversations —
          </div>
        )}
      </div>

      {/* Scroll to Top */}
      {isScrolledDown && newMessagesCount === 0 && (
        <button
          onClick={scrollToTop}
          className="absolute bottom-4 right-4 z-30 w-10 h-10 bg-gray-800 text-white 
                     rounded-full shadow-lg flex items-center justify-center hover:bg-gray-700"
        >
          <ChevronUpIcon className="w-5 h-5" />
        </button>
      )}

      {/* Modal */}
      <MarkPurchaseModal
        show={showPurchaseModal}
        onClose={handleCloseModal}
        contact={selectedContact}
        purchaseForm={purchaseForm}
        setPurchaseForm={setPurchaseForm}
        availableTags={availableTags}
        fetchChatList={() => {
          listCache.lastFetchTime = 0;
          fetchChatListInternal(1, debouncedSearch, selectedTags, false);
        }}
        token={token}
        loading={isLoadingMore}
        setLoading={setIsLoadingMore}
      />
    </div>
  );
};

export default ChatListVirtualized;



// import React, {
//   useEffect,
//   useState,
//   useRef,
//   useCallback,
// } from "react";
// import axios from "axios";
// import { useEffectEvent } from "react";
// import debounce from "lodash/debounce";
// import { toast } from "react-toastify";
// import API_BASE_URL from "../../config";
// import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/solid';
// import MarkPurchaseModal from './MarkPurchaseModal';

// const ChatList = ({ onSelectConversation }) => {
//   const [conversations, setConversations] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedTags, setSelectedTags] = useState([]);
//   const [availableTags, setAvailableTags] = useState([]);
//   const [showTags, setShowTags] = useState(false);
//   const [socket, setSocket] = useState(null);
//   const token = localStorage.getItem("authToken");
//   const [loading, setLoading] = useState(false);
//   const [selectedContact, setSelectedContact] = useState(null);
//   const [page, setPage] = useState(1);
  

  
//   const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
//   const [purchaseForm, setPurchaseForm] = useState({ amount: '', location: '', tags: [], tagInput: '' });

//   const [pagination, setPagination] = useState({
//     next: null,
//     previous: null,
//     count: 0,
//   });

//   // --- Refs for stability ---
//   const pageRef = useRef(page);
//   const tagsRef = useRef(selectedTags);
//   const searchRef = useRef(searchQuery);

//   useEffect(() => {
//     pageRef.current = page;
//   }, [page]);

//   useEffect(() => {
//     tagsRef.current = selectedTags;
//     searchRef.current = searchQuery;
//   }, [selectedTags, searchQuery]);

//   // -----------------------------
//   // 🎯 Stable Effect Event: Fetch Chat List
//   // -----------------------------
//   const fetchChatListEvent = useEffectEvent(async (pageNum, query, tags) => {
//     try {
//       // setLoading(true);

//       const tagsQuery =
//         tags.length > 0 ? `&tags=${encodeURIComponent(tags.join(","))}` : "";

//       const response = await axios.get(
//         `${API_BASE_URL}/api/chats/?page=${pageNum}&search=${encodeURIComponent(
//           query
//         )}${tagsQuery}`,
//         {
//           headers: { Authorization: `Token ${token}` },
//         }
//       );

//       const chatData = response.data;
//       setConversations(chatData.results || []);
//       setPagination({
//         next: chatData.next,
//         previous: chatData.previous,
//         count: chatData.count,
//       });
//     } catch (err) {
//       toast.error("Failed to fetch chat list");
//     } finally {
//       setLoading(false);
//     }
//   });

//   // Debounced version (stable across renders)
//   const debouncedFetchChatList = useRef(
//     debounce((pageNum, query, tags) => {
//       fetchChatListEvent(pageNum, query, tags);
//     }, 300)
//   ).current;

//   // Trigger list fetch
//   useEffect(() => {
//     if (!token) return;

//     debouncedFetchChatList(page, searchQuery, selectedTags);
//   }, [page, searchQuery, selectedTags, token]);

//   // Reset page on search or tag change
//   useEffect(() => {
//     setPage(1);
//   }, [searchQuery, selectedTags]);

//   // -----------------------------
//   // 🎯 Stable WebSocket Message Handler
//   // -----------------------------
//   const handleWsMessage = useEffectEvent((data) => {
//     if (data.message?.action === "refresh_chatlist") {
//       fetchChatListEvent(
//         pageRef.current,
//         searchRef.current,
//         tagsRef.current
//       );
//     }
//   });

//   // -----------------------------
//   // 🔌 WebSocket Connection (Stable)
//   // -----------------------------
//   useEffect(() => {
//     if (!token) return;

//     let ws;
//     let pingInterval;
//     let isMounted = true;

//     const wsProtocol =
//       window.location.protocol === "https:" ? "wss://" : "ws://";
//     const backendHost = API_BASE_URL.replace(/^https?:\/\//, "");
//     const wsUrl = `${wsProtocol}${backendHost}/ws/chatlist/?token=${token}`;

//     const connectWebSocket = () => {
//       if (!isMounted) return;

//       ws = new WebSocket(wsUrl);
//       setSocket(ws);

//       ws.onopen = () => {
//         // Send keepalive every 20s
//         pingInterval = setInterval(() => {
//           if (ws.readyState === WebSocket.OPEN) {
//             ws.send(JSON.stringify({ type: "pong" }));
//           }
//         }, 20000);
//       };

//       ws.onmessage = (e) => {
//         if (!isMounted) return;
//         const data = JSON.parse(e.data || "{}");

//         if (data.type === "ping") {
//           ws.send(JSON.stringify({ type: "pong" }));
//         }

//         handleWsMessage(data); // 🎯 stable effect event
//       };

//       ws.onclose = () => {
//         if (!isMounted) return;
//         setTimeout(connectWebSocket, 2000);
//       };

//       ws.onerror = () => {
//         ws.close();
//       };
//     };

//     connectWebSocket();

//     return () => {
//       isMounted = false;
//       if (pingInterval) clearInterval(pingInterval);
//       if (ws) ws.close();
//     };
//   }, [token]);

//   // -----------------------------
//   // Tag selection
//   // -----------------------------
//   const handleTagChange = (tag) => {
//     setSelectedTags((prev) =>
//       prev.includes(tag)
//         ? prev.filter((t) => t !== tag)
//         : [...prev, tag]
//     );
//   };


//   const fetchTagsEvent = useEffectEvent(async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/api/contacts/tags/`, {
//         headers: { Authorization: `Token ${token}` },
//       });

//       const tagsWithCounts = response.data.tags.map((t) => ({
//         name: t.tag,
//         count: t.count,
//       }));

//       setAvailableTags(tagsWithCounts);
//     } catch (error) {
//       toast.error("Failed to fetch tags");
//     }
//   });

//   useEffect(() => {
//     if (!token) return;
//     fetchTagsEvent();   // ← always latest function
//   }, [token]);


//   const handleOpenPurchaseModal = (contact) => {
//     setSelectedContact(contact);
//     setPurchaseForm({
//       amount: '',
//       location: '',
//       tags: contact.tags || [],
//       tagInput: '',
//     });
//     setShowPurchaseModal(true);
//   };

//   const formatTimestamp = (timestamp) => {
//     if (!timestamp) return "";
//     const date = new Date(timestamp);
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(today.getDate() - 1);

//     const isToday = date.toDateString() === today.toDateString();
//     const isYesterday = date.toDateString() === yesterday.toDateString();

//     if (isToday) {
//       return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//     } else if (isYesterday) {
//       return `Yesterday ${date.toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       })}`;
//     } else {
//       return date.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     }
//   };


//   return (
//     <div className="flex flex-col h-full overflow-auto">
//       {/* Search and Tag Filter */}
//       <div className="p-2 md:p-4 bg-gray-50 flex flex-col space-y-2 sticky top-0 z-10">
//         <div className="relative flex-1">
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search name or mobile number"
//             className="w-full p-2 md:p-2 pl-8 md:pl-10 bg-gray-200 rounded-md text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <MagnifyingGlassIcon className="absolute top-2.5 left-2 md:left-2.5 h-4 md:h-5 w-4 md:w-5 text-gray-500" />
//         </div>
//         {showTags && (
//           <div className="flex flex-wrap gap-2">
//             {availableTags.map((tagObj) => (
//               <button
//                 key={tagObj.name}
//                 onClick={() => handleTagChange(tagObj.name)}
//                 className={`px-2 py-1 rounded-full text-sm ${
//                   selectedTags.includes(tagObj.name)
//                     ? 'bg-blue-500 text-white'
//                     : 'bg-gray-200 text-gray-700'
//                 }`}
//               >
//                 {tagObj.name} ({tagObj.count})
//               </button>
//             ))}
//           </div>
//         )}
//         <button
//           onClick={() => setShowTags((prev) => !prev)}
//           className="p-2 md:p-2 bg-teal-100 text-teal-600 rounded-full hover:bg-teal-200 self-end"
//         >
//           <Bars3Icon className="h-4 md:h-5 w-4 md:w-5" />
//         </button>
//       </div>

//       {/* Chat List */}
//       {loading ? (
//         <p className="animate-pulse text-center py-4 md:py-6 text-lg md:text-2xl text-gray-600">
//           Loading Chats...
//         </p>
//       ) : (
//         <div className="flex-grow overflow-y-auto h-[70vh] md:h-[calc(100vh-100px)]">
//           {conversations.length > 0 ? (
//             <ul className="w-full">
//               {conversations.map((conv) => (
//                 <li
//                   key={conv.recipient}
//                   className="cursor-pointer border-b border-gray-200 p-2 md:p-4 hover:bg-gray-50"
//                   onClick={() => onSelectConversation(conv.recipient)}
//                 >
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <span className="font-semibold text-sm md:text-base">{conv.user_name || 'unknown'}</span>
//                       <span className="ml-2 text-xs text-gray-500">({conv.tags?.length || 0} tags)</span>
//                     </div>
//                     <span className="text-xs md:text-sm text-gray-500">
//                       {formatTimestamp(conv.last_message_at)}
//                     </span>
//                   </div>
//                   <p className="text-xs md:text-sm text-gray-600 overflow-hidden">{conv.last_message_text}</p>
//                   <div className="flex flex-wrap gap-1 mt-1">
//                     {conv.tags?.map((tag) => (
//                       <span
//                         key={tag}
//                         className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full"
//                       >
//                         {tag}
//                       </span>
//                     ))}
//                   </div>
//                   <div className="flex space-x-2 mt-2">
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleOpenPurchaseModal(conv);
//                       }}
//                       className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
//                     >
//                       Mark Purchase
//                     </button>
//                     {conv.unread_count > 0 && (
//                       <span className="inline-block bg-blue-500 text-white text-xs px-1 md:px-2 py-0.5 md:py-1 rounded-full">
//                         {conv.unread_count} unread
//                       </span>
//                     )}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <h5 className="text-lg md:text-xl text-center font-medium text-gray-600 p-4">
//               No chats yet!
//             </h5>
//           )}
//         </div>
//       )}

//       {/* Pagination Controls */}
//       <div className="flex justify-between mt-2 md:mt-4 px-2 md:px-4">
//         <button
//           onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
//           disabled={!pagination.previous || page === 1}
//           className="px-2 md:px-4 py-1 md:py-2 bg-gray-200 rounded text-sm md:text-base disabled:opacity-50"
//         >
//           Previous
//         </button>
//         <span className="text-sm md:text-base">
//           Page {page} of {Math.max(1, Math.ceil(pagination.count / 10))}
//         </span>
//         <button
//           onClick={() => {
//             if (pagination.next) setPage((prev) => prev + 1);
//           }}
//           disabled={!pagination.next}
//           className="px-2 md:px-4 py-1 md:py-2 bg-gray-200 rounded text-sm md:text-base disabled:opacity-50"
//         >
//           Next
//         </button>
//       </div>

//       {/* Mark Purchase Modal */}
//       <MarkPurchaseModal
//           show={showPurchaseModal}
//           onClose={() => {
//             setShowPurchaseModal(false);
//             setPurchaseForm({ amount: '', location: '', tags: [], tagInput: '' });
//             setSelectedContact(null);
//           }}
//           contact={selectedContact}
//           purchaseForm={purchaseForm}
//           setPurchaseForm={setPurchaseForm}
//           availableTags={availableTags}
//           fetchChatList={() => fetchChatListEvent(pageRef.current, searchQuery, selectedTags)}
//           token={token}
//           loading={loading}
//           setLoading={setLoading}
//         />

//     </div>
//   );
// };

// export default ChatList;