// ═══════════════════════════════════════════════════════════════════════════════
// src/components/Chat/ChatList.jsx
// Optimized WhatsApp-style chat list with instant local search
// ═══════════════════════════════════════════════════════════════════════════════

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useLayoutEffect,
  memo,
} from "react";
import debounce from "lodash/debounce";
import { MagnifyingGlassIcon, Bars3Icon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { useChatContext } from "./context/ChatContext";
import MarkPurchaseModal from "./MarkPurchaseModal";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 88;
const BUFFER_SIZE = 5;
const SCROLL_THRESHOLD = 300;
const SERVER_SEARCH_DELAY = 500;

// ─────────────────────────────────────────────────────────────────────────────
// CHAT ITEM (Memoized)
// ─────────────────────────────────────────────────────────────────────────────

const ChatItem = memo(
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
    prev.conv.last_message_text === next.conv.last_message_text &&
    prev.style?.top === next.style?.top
);

ChatItem.displayName = "ChatItem";

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────────────────────────────────────────

const ChatSkeleton = () => (
  <div className="flex items-start gap-3 px-4 py-3 animate-pulse">
    <div className="w-12 h-12 rounded-full bg-gray-200" />
    <div className="flex-1">
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-3 w-12 bg-gray-200 rounded" />
      </div>
      <div className="h-3 w-full bg-gray-200 rounded mt-2" />
      <div className="h-3 w-2/3 bg-gray-200 rounded mt-1" />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const ChatList = ({ onSelectConversation }) => {
  const token = localStorage.getItem("authToken");

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT - Global chat state
  // ═══════════════════════════════════════════════════════════════════════════

  const {
    conversations,
    isInitialLoading,
    isLoadingMore,
    isRefreshing,
    hasMore,
    availableTags,
    loadMore,
    refresh,
    searchConversations,
    markAsRead,
    isInitialized,
    // ⭐ Module-level scroll functions
    setSavedScrollPosition,
    getSavedScrollPosition,
    forceSavedScrollPosition,
    setIsSelecting,
    getIsSelecting,
  } = useChatContext();

  // ═══════════════════════════════════════════════════════════════════════════
  // LOCAL STATE
  // ═══════════════════════════════════════════════════════════════════════════

  const [searchInput, setSearchInput] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTags, setShowTags] = useState(false);

  // Virtualization - initialize from saved scroll position
  const [scrollTop, setScrollTop] = useState(() => getSavedScrollPosition());
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

  // ═══════════════════════════════════════════════════════════════════════════
  // LOCAL FILTERING - INSTANT (no server call)
  // ═══════════════════════════════════════════════════════════════════════════

  const filteredConversations = useMemo(() => {
    if (!localSearch && selectedTags.length === 0) {
      return conversations;
    }

    const searchLower = localSearch.toLowerCase().trim();

    return conversations.filter((conv) => {
      // Search filter
      if (searchLower) {
        const matchesName = conv.user_name?.toLowerCase().includes(searchLower);
        const matchesPhone = conv.recipient?.includes(searchLower);
        const matchesMessage = conv.last_message_text?.toLowerCase().includes(searchLower);

        if (!matchesName && !matchesPhone && !matchesMessage) {
          return false;
        }
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasTags = selectedTags.every((tag) => conv.tags?.includes(tag));
        if (!hasTags) return false;
      }

      return true;
    });
  }, [conversations, localSearch, selectedTags]);

  // ═══════════════════════════════════════════════════════════════════════════
  // DEBOUNCED SERVER SEARCH
  // ═══════════════════════════════════════════════════════════════════════════

  const debouncedServerSearch = useMemo(
    () =>
      debounce((search, tags) => {
        if (search.length >= 2 || tags.length > 0) {
          searchConversations(search, tags);
        }
      }, SERVER_SEARCH_DELAY),
    [searchConversations]
  );

  useEffect(() => {
    return () => debouncedServerSearch.cancel();
  }, [debouncedServerSearch]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchInput(value);
      setLocalSearch(value);
      debouncedServerSearch(value, selectedTags);
    },
    [debouncedServerSearch, selectedTags]
  );

  const handleTagChange = useCallback(
    (tag) => {
      setSelectedTags((prev) => {
        const newTags = prev.includes(tag)
          ? prev.filter((t) => t !== tag)
          : [...prev, tag];
        debouncedServerSearch(searchInput, newTags);
        return newTags;
      });
    },
    [debouncedServerSearch, searchInput]
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setLocalSearch("");
    setSelectedTags([]);
    forceSavedScrollPosition(0); // ⭐ Force reset (intentional)
    refresh(false);
  }, [refresh, forceSavedScrollPosition]);

  // ⭐ CRITICAL: Handle chat selection with proper scroll saving
  const handleSelect = useCallback(
    (recipient) => {
      // ⭐ STEP 1: Block all scroll/refresh updates
      setIsSelecting(true);
      
      // ⭐ STEP 2: Save current scroll position BEFORE any navigation
      const currentScroll = listContainerRef.current?.scrollTop || 0;
      if (currentScroll > 0) {
        // Directly set module variable (bypassing safeguards for this intentional save)
        // console.log("💾 Saving scroll before navigation:", currentScroll);
        // Use a timeout to ensure this runs before navigation
        setTimeout(() => {
          // This is a direct module-level assignment
          window.__CHAT_SCROLL_POSITION__ = currentScroll;
        }, 0);
      }
      
      // ⭐ STEP 3: Mark as read (optimistic update - no refresh)
      markAsRead(recipient);
      
      // ⭐ STEP 4: Navigate to chat
      onSelectConversation(recipient);
      
      // ⭐ STEP 5: Keep blocking for a while to prevent any refresh during navigation
      setTimeout(() => {
        setIsSelecting(false);
      }, 2000); // 2 seconds to be safe
    },
    [onSelectConversation, markAsRead, setIsSelecting]
  );

  const handleOpenModal = useCallback((contact) => {
    setSelectedContact(contact);
    setPurchaseForm({
      amount: "",
      location: "",
      tags: contact.tags || [],
      tagInput: "",
    });
    setShowPurchaseModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowPurchaseModal(false);
    setSelectedContact(null);
  }, []);

  const scrollToTop = useCallback(() => {
    forceSavedScrollPosition(0);
    listContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [forceSavedScrollPosition]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ⭐ SCROLL POSITION RESTORATION
  // ═══════════════════════════════════════════════════════════════════════════

  useLayoutEffect(() => {
    const container = listContainerRef.current;
    if (!container) return;

    // ⭐ Get saved position from module-level storage OR window fallback
    const savedPosition = getSavedScrollPosition() || window.__CHAT_SCROLL_POSITION__ || 0;

    if (savedPosition > 0) {
      // console.log("🔄 Restoring scroll position:", savedPosition);
      
      // Use multiple RAF frames to ensure DOM is ready
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          container.scrollTop = savedPosition;
          setScrollTop(savedPosition);
        });
      });
    }
  }, [getSavedScrollPosition, filteredConversations.length]);

  // ═══════════════════════════════════════════════════════════════════════════
  // VIRTUALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  const totalHeight = filteredConversations.length * ITEM_HEIGHT;

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT);
    const endIndex = Math.min(
      filteredConversations.length - 1,
      startIndex + visibleCount + BUFFER_SIZE * 2
    );
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, filteredConversations.length]);

  const visibleItems = useMemo(() => {
    const items = [];
    for (
      let i = visibleRange.startIndex;
      i <= visibleRange.endIndex && i < filteredConversations.length;
      i++
    ) {
      items.push({
        index: i,
        conv: filteredConversations[i],
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
  }, [visibleRange, filteredConversations]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SCROLL HANDLER
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

          // ⭐ CRITICAL: Only save scroll when NOT selecting
          if (!getIsSelecting()) {
            // Save to module-level storage
            setSavedScrollPosition(currentScrollTop);
            // Also save to window as backup
            window.__CHAT_SCROLL_POSITION__ = currentScrollTop;
            setScrollTop(currentScrollTop);
          }

          // Load more when near bottom
          const distanceFromBottom = scrollHeight - currentScrollTop - clientHeight;
          if (distanceFromBottom < SCROLL_THRESHOLD && hasMore && !isLoadingRef.current) {
            isLoadingRef.current = true;
            loadMore();
            setTimeout(() => {
              isLoadingRef.current = false;
            }, 500);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    const handleResize = () => {
      setContainerHeight(container.clientHeight);
    };

    handleResize();
    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [hasMore, loadMore, getIsSelecting, setSavedScrollPosition]);

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

  const isScrolledDown = scrollTop > 200;
  const hasFilters = localSearch || selectedTags.length > 0;

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
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search name, phone, or message..."
              className="w-full py-2.5 pl-10 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm
                         placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" />

            {/* Refresh indicator */}
            {isRefreshing && (
              <div className="absolute top-1/2 right-12 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <button
              onClick={() => setShowTags((p) => !p)}
              className={`absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded-lg transition-colors
                         ${showTags ? "bg-emerald-100 text-emerald-600" : "hover:bg-gray-100 text-gray-500"}`}
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>

          {/* Tags */}
          {showTags && availableTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              {availableTags.map((t) => (
                <button
                  key={t.name}
                  onClick={() => handleTagChange(t.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                             ${
                               selectedTags.includes(t.name)
                                 ? "bg-emerald-500 text-white"
                                 : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                             }`}
                >
                  {t.name} ({t.count})
                </button>
              ))}
            </div>
          )}

          {/* Active filters */}
          {hasFilters && (
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-gray-500">
                {filteredConversations.length} result{filteredConversations.length !== 1 ? "s" : ""}
              </span>
              {localSearch && (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                  "{localSearch}"
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

      {/* List Container */}
      <div
        ref={listContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Initial Loading */}
        {isInitialLoading && !isInitialized && (
          <div className="divide-y divide-gray-50">
            {[...Array(8)].map((_, i) => (
              <ChatSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isInitialLoading && filteredConversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {hasFilters ? "No matches found" : "No conversations"}
            </h3>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Virtualized List */}
        {!isInitialLoading && filteredConversations.length > 0 && (
          <div style={{ height: totalHeight, position: "relative" }}>
            {visibleItems.map(({ conv, style }) => (
              <ChatItem
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

        {/* End Indicator */}
        {!hasMore && filteredConversations.length > 10 && (
          <div className="text-center py-6 text-xs text-gray-400">— End of conversations —</div>
        )}
      </div>

      {/* Scroll to Top */}
      {isScrolledDown && (
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
        fetchChatList={() => refresh(false)}
        token={token}
        loading={isLoadingMore}
        setLoading={() => {}}
      />
    </div>
  );
};

export default ChatList;