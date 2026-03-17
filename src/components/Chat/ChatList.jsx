// ═══════════════════════════════════════════════════════════════════════════════
// src/components/Chat/ChatList.jsx — UPGRADED
// ═══════════════════════════════════════════════════════════════════════════════
//
// CHANGES FROM ORIGINAL:
// ✅ Filter bar: All / Unread / Expired (client-side on loaded data)
// ✅ Selection mode: long-press or checkbox for broadcast
// ✅ Selection header: "X selected" + Cancel + Send buttons
// ✅ Expired chat styling: faded + clock icon
// ✅ VirtualChatItem: selection checkbox, expired indicator
// ✅ BroadcastComposer integration
// ✅ All existing functionality preserved (search, tags, virtualization, cache)
// ═══════════════════════════════════════════════════════════════════════════════

// import React, {
//   useEffect,
//   useState,
//   useRef,
//   useCallback,
//   useMemo,
//   memo,
// } from "react";
// import axios from "axios";
// import debounce from "lodash/debounce";
// import { toast } from "react-toastify";
// import API_BASE_URL from "../../config";
// import {
//   MagnifyingGlassIcon,
//   Bars3Icon,
//   ChevronUpIcon,
//   ClockIcon,
//   CheckIcon,
//   XMarkIcon,
// } from "@heroicons/react/24/solid";
// import MarkPurchaseModal from "./MarkPurchaseModal";
// import BroadcastComposer from "./BroadcastComposer";

// // ─────────────────────────────────────────────────────────────────────────────
// // CONSTANTS
// // ─────────────────────────────────────────────────────────────────────────────

// const ITEM_HEIGHT = 88;
// const BUFFER_SIZE = 5;
// const OVERSCAN = 3;
// const SCROLL_THRESHOLD = 300;
// const LONG_PRESS_DURATION = 500; // ms

// // Cache persists across component mounts
// const listCache = {
//   conversations: [],
//   page: 1,
//   hasMore: true,
//   scrollTop: 0,
//   searchQuery: "",
//   selectedTags: [],
//   lastFetchTime: 0,
// };

// const CACHE_TTL = 10000;

// // ─────────────────────────────────────────────────────────────────────────────
// // FILTER BUTTONS
// // ─────────────────────────────────────────────────────────────────────────────

// const FILTERS = [
//   { key: "all", label: "All" },
//   { key: "unread", label: "Unread" },
//   { key: "expired", label: "Expired" },
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // VIRTUALIZED CHAT ITEM (UPGRADED)
// // ─────────────────────────────────────────────────────────────────────────────

// const VirtualChatItem = memo(
//   ({
//     conv,
//     style,
//     onSelect,
//     onMarkPurchase,
//     formatTimestamp,
//     isSelectionMode,
//     isSelected,
//     onToggleSelect,
//     onLongPress,
//   }) => {
//     const longPressTimer = useRef(null);
//     const wasLongPress = useRef(false);

//     const handleTouchStart = useCallback(() => {
//       wasLongPress.current = false;
//       longPressTimer.current = setTimeout(() => {
//         wasLongPress.current = true;
//         onLongPress?.(conv.recipient);
//       }, LONG_PRESS_DURATION);
//     }, [conv.recipient, onLongPress]);

//     const handleTouchEnd = useCallback(() => {
//       if (longPressTimer.current) {
//         clearTimeout(longPressTimer.current);
//         longPressTimer.current = null;
//       }
//     }, []);

//     const handleClick = useCallback(() => {
//       if (wasLongPress.current) {
//         wasLongPress.current = false;
//         return;
//       }
//       if (isSelectionMode) {
//         onToggleSelect(conv.recipient);
//       } else {
//         onSelect(conv.recipient);
//       }
//     }, [isSelectionMode, conv.recipient, onSelect, onToggleSelect]);

//     const isExpired = conv.is_expired;

//     return (
//       <div
//         style={style}
//         className={`absolute left-0 right-0 flex items-start gap-3 px-4 py-3
//                    cursor-pointer border-b border-gray-50 transition-colors
//                    ${isExpired ? "opacity-60" : ""}
//                    ${isSelected ? "bg-emerald-50" : "hover:bg-gray-50 active:bg-gray-100"}`}
//         onClick={handleClick}
//         onTouchStart={handleTouchStart}
//         onTouchEnd={handleTouchEnd}
//         onTouchCancel={handleTouchEnd}
//         onContextMenu={(e) => {
//           e.preventDefault();
//           onLongPress?.(conv.recipient);
//         }}
//       >
//         {/* Selection Checkbox */}
//         {isSelectionMode && (
//           <div className="flex-shrink-0 self-center">
//             <div
//               className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
//                 ${isSelected ? "bg-emerald-500 border-emerald-500" : "border-gray-300"}
//                 ${isExpired ? "opacity-40 pointer-events-none" : ""}`}
//             >
//               {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
//             </div>
//           </div>
//         )}

//         {/* Avatar */}
//         <div className="flex-shrink-0 relative">
//           <div
//             className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm
//               ${isExpired
//                 ? "bg-gradient-to-br from-gray-400 to-gray-500"
//                 : "bg-gradient-to-br from-emerald-400 to-teal-500"}`}
//           >
//             {(conv.user_name || "U")[0].toUpperCase()}
//           </div>
//           {/* Future: online indicator */}
//           {/* {!isExpired && conv.is_online && (
//             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
//           )} */}
//         </div>

//         {/* Content */}
//         <div className="flex-1 min-w-0 py-0.5">
//           <div className="flex items-baseline justify-between gap-2">
//             <h4 className="font-semibold text-gray-900 truncate text-[15px]">
//               {conv.user_name || conv.recipient || "Unknown"}
//             </h4>
//             <div className="flex items-center gap-1 flex-shrink-0">
//               {isExpired && (
//                 <ClockIcon className="w-3.5 h-3.5 text-amber-500" />
//               )}
//               <span
//                 className={`text-xs ${
//                   conv.unread_count > 0
//                     ? "text-emerald-600 font-medium"
//                     : "text-gray-500"
//                 }`}
//               >
//                 {formatTimestamp(conv.last_message_at)}
//               </span>
//             </div>
//           </div>

//           <div className="flex items-center gap-2 mt-0.5">
//             <p
//               className={`text-sm truncate flex-1 ${
//                 conv.unread_count > 0
//                   ? "text-gray-800 font-medium"
//                   : "text-gray-500"
//               }`}
//             >
//               {conv.last_message_text || "No messages yet"}
//             </p>
//             {conv.unread_count > 0 && (
//               <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
//                 {conv.unread_count > 99 ? "99+" : conv.unread_count}
//               </span>
//             )}
//           </div>

//           <div className="flex items-center gap-1.5 mt-1.5">
//             {conv.tags?.slice(0, 2).map((tag) => (
//               <span
//                 key={tag}
//                 className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full"
//               >
//                 {tag}
//               </span>
//             ))}
//             {conv.tags?.length > 2 && (
//               <span className="text-[10px] text-gray-400">
//                 +{conv.tags.length - 2}
//               </span>
//             )}
//             {isExpired && (
//               <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full ml-auto">
//                 Expired
//               </span>
//             )}
//             {!isExpired && !isSelectionMode && (
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onMarkPurchase(conv);
//                 }}
//                 className="ml-auto text-[10px] font-medium text-indigo-600 hover:text-indigo-800 
//                            px-1.5 py-0.5 rounded hover:bg-indigo-50"
//               >
//                 💰 Purchase
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   },
//   (prev, next) =>
//     prev.conv.recipient === next.conv.recipient &&
//     prev.conv.last_message_at === next.conv.last_message_at &&
//     prev.conv.unread_count === next.conv.unread_count &&
//     prev.conv.is_expired === next.conv.is_expired &&
//     prev.style.top === next.style.top &&
//     prev.isSelected === next.isSelected &&
//     prev.isSelectionMode === next.isSelectionMode
// );

// VirtualChatItem.displayName = "VirtualChatItem";

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────

// const ChatListVirtualized = ({ onSelectConversation }) => {
//   // State
//   const [conversations, setConversations] = useState(() => listCache.conversations);
//   const [searchQuery, setSearchQuery] = useState(() => listCache.searchQuery);
//   const [debouncedSearch, setDebouncedSearch] = useState(() => listCache.searchQuery);
//   const [selectedTags, setSelectedTags] = useState(() => listCache.selectedTags);
//   const [availableTags, setAvailableTags] = useState([]);
//   const [showTags, setShowTags] = useState(false);
//   const token = localStorage.getItem("authToken");

//   const [page, setPage] = useState(() => listCache.page);
//   const [hasMore, setHasMore] = useState(() => listCache.hasMore);
//   const [isLoadingMore, setIsLoadingMore] = useState(false);
//   const [isInitialLoad, setIsInitialLoad] = useState(() => listCache.conversations.length === 0);
//   const [newMessagesCount, setNewMessagesCount] = useState(0);
//   const [scrollTop, setScrollTop] = useState(() => listCache.scrollTop);
//   const [containerHeight, setContainerHeight] = useState(0);
//   const [isVisible, setIsVisible] = useState(true);

//   // ✅ NEW: Filter state
//   const [activeFilter, setActiveFilter] = useState("all");

//   // ✅ NEW: Selection mode
//   const [isSelectionMode, setIsSelectionMode] = useState(false);
//   const selectedRecipientsRef = useRef(new Set());
//   const [selectedCount, setSelectedCount] = useState(0);

//   // ✅ NEW: Broadcast composer
//   const [showBroadcastComposer, setShowBroadcastComposer] = useState(false);
//   const [isBroadcasting, setIsBroadcasting] = useState(false);

//   // Purchase modal
//   const [showPurchaseModal, setShowPurchaseModal] = useState(false);
//   const [selectedContact, setSelectedContact] = useState(null);
//   const [purchaseForm, setPurchaseForm] = useState({
//     full_name:"",
//     amount: "",
//     location: "",
//     tags: [],
//     tagInput: "",
//   });

//   // Refs
//   const listContainerRef = useRef(null);
//   const isLoadingRef = useRef(false);
//   const abortControllerRef = useRef(null);
//   const pageRef = useRef(page);
//   const hasMoreRef = useRef(hasMore);
//   const searchRef = useRef(debouncedSearch);
//   const tagsRef = useRef(selectedTags);
//   const conversationsRef = useRef(conversations);

//   useEffect(() => { pageRef.current = page; }, [page]);
//   useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
//   useEffect(() => { searchRef.current = debouncedSearch; }, [debouncedSearch]);
//   useEffect(() => { tagsRef.current = selectedTags; }, [selectedTags]);
//   useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // ✅ NEW: CLIENT-SIDE FILTERED LIST
//   // ═══════════════════════════════════════════════════════════════════════════

//   const filteredConversations = useMemo(() => {
//     if (activeFilter === "all") return conversations;
//     if (activeFilter === "unread") return conversations.filter((c) => c.unread_count > 0);
//     if (activeFilter === "expired") return conversations.filter((c) => c.is_expired);
//     return conversations;
//   }, [conversations, activeFilter]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // ✅ NEW: SELECTION HANDLERS
//   // ═══════════════════════════════════════════════════════════════════════════

//   const handleLongPress = useCallback(
//     (recipient) => {
//       if (!isSelectionMode) {
//         setIsSelectionMode(true);
//       }
//       // Auto-select the long-pressed item (if not expired)
//       const conv = conversationsRef.current.find((c) => c.recipient === recipient);
//       if (conv && !conv.is_expired) {
//         selectedRecipientsRef.current.add(recipient);
//         setSelectedCount(selectedRecipientsRef.current.size);
//       }
//     },
//     [isSelectionMode]
//   );

//   const handleToggleSelect = useCallback((recipient) => {
//     const conv = conversationsRef.current.find((c) => c.recipient === recipient);
//     if (conv?.is_expired) return;

//     const set = selectedRecipientsRef.current;
//     if (set.has(recipient)) {
//       set.delete(recipient);
//     } else {
//       set.add(recipient);
//     }
//     setSelectedCount(set.size);

//     // Exit selection mode if nothing selected
//     if (set.size === 0) {
//       setIsSelectionMode(false);
//     }
//   }, []);

//   const clearSelection = useCallback(() => {
//     selectedRecipientsRef.current = new Set();
//     setSelectedCount(0);
//     setIsSelectionMode(false);
//   }, []);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // ✅ NEW: BROADCAST SEND
//   // ═══════════════════════════════════════════════════════════════════════════

//   const handleBroadcastSend = useCallback(
//     async (messageText) => {
//       const recipients = Array.from(selectedRecipientsRef.current);
//       if (recipients.length === 0) return { error: "No recipients selected" };

//       setIsBroadcasting(true);
//       try {
//         const response = await axios.post(
//           `${API_BASE_URL}/api/chats/broadcast/`,
//           {
//             recipients,
//             message_text: messageText,
//           },
//           { headers: { Authorization: `Token ${token}` } }
//         );

//         setShowBroadcastComposer(false);
//         clearSelection();
//         return response.data;
//       } catch (err) {
//         return { error: err.response?.data?.error || "Failed to send broadcast" };
//       } finally {
//         setIsBroadcasting(false);
//       }
//     },
//     [token, clearSelection]
//   );

//   // ═══════════════════════════════════════════════════════════════════════════
//   // VISIBILITY & CACHE (existing)
//   // ═══════════════════════════════════════════════════════════════════════════

//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (document.visibilityState === "visible") {
//         setIsVisible(true);
//         const cacheAge = Date.now() - listCache.lastFetchTime;
//         if (cacheAge > CACHE_TTL) {
//           fetchChatListInternal(1, searchRef.current, tagsRef.current, false);
//         }
//       } else {
//         setIsVisible(false);
//       }
//     };
//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, []);

//   useEffect(() => {
//     listCache.conversations = conversations;
//     listCache.page = page;
//     listCache.hasMore = hasMore;
//     listCache.searchQuery = debouncedSearch;
//     listCache.selectedTags = selectedTags;
//   }, [conversations, page, hasMore, debouncedSearch, selectedTags]);

//   const saveScrollPosition = useCallback(() => {
//     if (listContainerRef.current) {
//       listCache.scrollTop = listContainerRef.current.scrollTop;
//     }
//   }, []);

//   useEffect(() => {
//     if (listContainerRef.current && listCache.scrollTop > 0) {
//       listContainerRef.current.scrollTop = listCache.scrollTop;
//     }
//   }, []);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // VIRTUALIZATION (existing, uses filteredConversations)
//   // ═══════════════════════════════════════════════════════════════════════════

//   const totalHeight = filteredConversations.length * ITEM_HEIGHT;

//   const visibleRange = useMemo(() => {
//     const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
//     const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT);
//     const endIndex = Math.min(
//       filteredConversations.length - 1,
//       startIndex + visibleCount + BUFFER_SIZE * 2 + OVERSCAN
//     );
//     return { startIndex, endIndex };
//   }, [scrollTop, containerHeight, filteredConversations.length]);

//   const visibleItems = useMemo(() => {
//     const items = [];
//     for (let i = visibleRange.startIndex; i <= visibleRange.endIndex && i < filteredConversations.length; i++) {
//       items.push({
//         index: i,
//         conv: filteredConversations[i],
//         style: {
//           position: "absolute",
//           top: i * ITEM_HEIGHT,
//           left: 0,
//           right: 0,
//           height: ITEM_HEIGHT,
//         },
//       });
//     }
//     return items;
//   }, [visibleRange, filteredConversations]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // SCROLL HANDLER (existing)
//   // ═══════════════════════════════════════════════════════════════════════════

//   useEffect(() => {
//     const container = listContainerRef.current;
//     if (!container) return;

//     let rafId = null;
//     let ticking = false;

//     const handleScroll = () => {
//       if (!ticking) {
//         rafId = requestAnimationFrame(() => {
//           const currentScrollTop = container.scrollTop;
//           const scrollHeight = container.scrollHeight;
//           const clientHeight = container.clientHeight;

//           setScrollTop(currentScrollTop);
//           listCache.scrollTop = currentScrollTop;

//           const distanceFromBottom = scrollHeight - currentScrollTop - clientHeight;

//           if (
//             distanceFromBottom < SCROLL_THRESHOLD &&
//             hasMoreRef.current &&
//             !isLoadingRef.current
//           ) {
//             loadMoreConversations();
//           }

//           ticking = false;
//         });
//         ticking = true;
//       }
//     };

//     const handleResize = () => {
//       setContainerHeight(container.clientHeight);
//     };

//     handleResize();

//     container.addEventListener("scroll", handleScroll, { passive: true });
//     window.addEventListener("resize", handleResize, { passive: true });

//     return () => {
//       if (rafId) cancelAnimationFrame(rafId);
//       container.removeEventListener("scroll", handleScroll);
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   const loadMoreConversations = useCallback(() => {
//     if (isLoadingRef.current || !hasMoreRef.current) return;
//     const nextPage = pageRef.current + 1;
//     setPage(nextPage);
//     fetchChatListInternal(nextPage, searchRef.current, tagsRef.current, true);
//   }, []);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // CORE FETCH (existing)
//   // ═══════════════════════════════════════════════════════════════════════════

//   const fetchChatListInternal = useCallback(
//     async (pageNum, query, tags, isAppending = false) => {
//       if (isLoadingRef.current) return;
//       isLoadingRef.current = true;

//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//       abortControllerRef.current = new AbortController();

//       try {
//         if (isAppending) {
//           setIsLoadingMore(true);
//         } else {
//           setIsInitialLoad(true);
//         }

//         const tagsQuery = tags.length > 0
//           ? `&tags=${encodeURIComponent(tags.join(","))}`
//           : "";

//         const response = await axios.get(
//           `${API_BASE_URL}/api/chats/?page=${pageNum}&search=${encodeURIComponent(query)}${tagsQuery}`,
//           {
//             headers: { Authorization: `Token ${token}` },
//             signal: abortControllerRef.current.signal,
//           }
//         );

//         const data = response.data;
//         const newItems = data.results || [];

//         if (isAppending) {
//           setConversations((prev) => {
//             const ids = new Set(prev.map((c) => c.recipient));
//             const uniqueNew = newItems.filter((c) => !ids.has(c.recipient));
//             return [...prev, ...uniqueNew];
//           });
//         } else {
//           setConversations(newItems);
//           setNewMessagesCount(0);
//         }

//         const hasNext = !!data.next;
//         setHasMore(hasNext);
//         hasMoreRef.current = hasNext;
//         listCache.lastFetchTime = Date.now();
//       } catch (err) {
//         if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
//           console.error("❌ Fetch error:", err);
//           toast.error("Failed to fetch chats");
//         }
//       } finally {
//         isLoadingRef.current = false;
//         setIsLoadingMore(false);
//         setIsInitialLoad(false);
//       }
//     },
//     [token]
//   );

//   // ═══════════════════════════════════════════════════════════════════════════
//   // SEARCH (existing)
//   // ═══════════════════════════════════════════════════════════════════════════

//   const debouncedSetSearch = useMemo(
//     () => debounce((val) => setDebouncedSearch(val), 400),
//     []
//   );

//   const handleSearchChange = useCallback(
//     (e) => {
//       setSearchQuery(e.target.value);
//       debouncedSetSearch(e.target.value);
//     },
//     [debouncedSetSearch]
//   );

//   useEffect(() => () => debouncedSetSearch.cancel(), [debouncedSetSearch]);

//   // Initial load (existing)
//   useEffect(() => {
//     if (!token) return;

//     const cacheAge = Date.now() - listCache.lastFetchTime;
//     const filtersChanged =
//       listCache.searchQuery !== debouncedSearch ||
//       JSON.stringify(listCache.selectedTags) !== JSON.stringify(selectedTags);

//     if (
//       listCache.conversations.length > 0 &&
//       cacheAge < CACHE_TTL &&
//       !filtersChanged
//     ) {
//       setIsInitialLoad(false);
//       return;
//     }

//     setPage(1);
//     pageRef.current = 1;
//     setHasMore(true);
//     hasMoreRef.current = true;
//     setConversations([]);

//     if (listContainerRef.current) {
//       listContainerRef.current.scrollTop = 0;
//     }

//     fetchChatListInternal(1, debouncedSearch, selectedTags, false);
//   }, [token, debouncedSearch, selectedTags, fetchChatListInternal]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // CHAT SELECTION (existing)
//   // ═══════════════════════════════════════════════════════════════════════════

//   const handleSelect = useCallback(
//     (recipient) => {
//       setConversations((prev) =>
//         prev.map((c) => (c.recipient === recipient ? { ...c, unread_count: 0 } : c))
//       );
//       saveScrollPosition();
//       onSelectConversation(recipient);
//     },
//     [onSelectConversation, saveScrollPosition]
//   );

//   // ═══════════════════════════════════════════════════════════════════════════
//   // WEBSOCKET (existing)
//   // ═══════════════════════════════════════════════════════════════════════════

//   useEffect(() => {
//     if (!token) return;

//     let ws;
//     let pingInterval;
//     let isMounted = true;
//     let reconnectTimeout;

//     const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
//     const backendHost = API_BASE_URL.replace(/^https?:\/\//, "");
//     const wsUrl = `${wsProtocol}${backendHost}/ws/chatlist/?token=${token}`;

//     const connect = () => {
//       if (!isMounted) return;
//       ws = new WebSocket(wsUrl);

//       ws.onopen = () => {
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

//           if (action === "new_message") {
//             listCache.lastFetchTime = 0;
//             fetchChatListInternal(1, searchRef.current, tagsRef.current, false);

//             if (!document.hasFocus() || document.visibilityState !== "visible") {
//               setNewMessagesCount((c) => c + 1);
//             }
//           } else if (action === "mark_read" && payload) {
//             setConversations((prev) =>
//               prev.map((c) =>
//                 c.recipient === payload.recipient ? { ...c, unread_count: 0 } : c
//               )
//             );
//           }
//           else if (action === "contact_updated" && payload) {
//             setConversations(prev =>
//               prev.map(c =>
//                 c.recipient === payload.recipient
//                   ? { ...c, user_name: payload.user_name }
//                   : c
//               )
//             );
//           }
//           else if (action === "batch_update" && payload?.batch) {
//             let shouldRefresh = false;

//             payload.batch.forEach(update => {
//               const a = update.action;
//               const p = update.data;

//               if (a === "new_message") {
//                 shouldRefresh = true;
//               }

//               if (a === "mark_read" && p) {
//                 setConversations(prev =>
//                   prev.map(c =>
//                     c.recipient === p.recipient
//                       ? { ...c, unread_count: 0 }
//                       : c
//                   )
//                 );
//               }

//               if (a === "contact_updated" && p) {
//                 setConversations(prev =>
//                   prev.map(c =>
//                     c.recipient === p.recipient
//                       ? { ...c, user_name: p.user_name }
//                       : c
//                   )
//                 );
//               }

//               if (a === "broadcast_result" && p) {
//                 toast.info(
//                   `Broadcast: Sent to ${p.sent} chats${
//                     p.failed > 0 ? `, ${p.failed} failed` : ""
//                   }`
//                 );
//                 shouldRefresh = true;
//               }
//             });

//             // ONE refresh after batch (important)
//             if (shouldRefresh) {
//               listCache.lastFetchTime = 0;
//               fetchChatListInternal(1, searchRef.current, tagsRef.current, false);
//             }
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

//       ws.onerror = (err) => {
//         console.error("WebSocket error:", err);
//         ws.close();
//       };
//     };

//     connect();

//     return () => {
//       isMounted = false;
//       if (pingInterval) clearInterval(pingInterval);
//       if (reconnectTimeout) clearTimeout(reconnectTimeout);
//       if (ws) ws.close();
//     };
//   }, [token, fetchChatListInternal]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // TAG HANDLERS (existing)
//   // ═══════════════════════════════════════════════════════════════════════════

//   const handleTagChange = useCallback((tag) => {
//     setSelectedTags((prev) =>
//       prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
//     );
//   }, []);

//   useEffect(() => {
//     if (!token) return;
//     axios
//       .get(`${API_BASE_URL}/api/contacts/tags/`, {
//         headers: { Authorization: `Token ${token}` },
//       })
//       .then((res) => {
//         setAvailableTags(res.data.tags.map((t) => ({ name: t.tag, count: t.count })));
//       })
//       .catch(() => {});
//   }, [token]);

//   // Modal handlers (existing)
//   const handleOpenModal = useCallback((contact) => {
//     setSelectedContact(contact);
//     setPurchaseForm({
//     full_name: contact.user_name || "",
//     amount: "",
//     location: "",
//     tags: contact.tags || [],
//     tagInput: "",
//   });

//     setShowPurchaseModal(true);
//   }, []);

//   const handleCloseModal = useCallback(() => {
//     setShowPurchaseModal(false);
//     setSelectedContact(null);
//   }, []);

//   // Utils (existing)
//   const formatTimestamp = useCallback((ts) => {
//     if (!ts) return "";
//     const d = new Date(ts);
//     const now = new Date();
//     if (d.toDateString() === now.toDateString()) {
//       return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//     }
//     const yesterday = new Date(now);
//     yesterday.setDate(now.getDate() - 1);
//     if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
//     return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
//   }, []);

//   const scrollToTop = useCallback(() => {
//     listContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
//     setNewMessagesCount(0);
//   }, []);

//   const clearFilters = useCallback(() => {
//     setSearchQuery("");
//     setDebouncedSearch("");
//     setSelectedTags([]);
//     setActiveFilter("all");
//   }, []);

//   const isScrolledDown = scrollTop > 200;

//   // ═══════════════════════════════════════════════════════════════════════════
//   // FILTER COUNTS (for badges)
//   // ═══════════════════════════════════════════════════════════════════════════

//   const filterCounts = useMemo(() => ({
//     all: conversations.length,
//     unread: conversations.filter((c) => c.unread_count > 0).length,
//     expired: conversations.filter((c) => c.is_expired).length,
//   }), [conversations]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // RENDER
//   // ═══════════════════════════════════════════════════════════════════════════

//   return (
//     <div className="flex flex-col h-full bg-white relative">
//       {/* ── Selection Mode Header ── */}
//       {isSelectionMode && (
//         <div className="sticky top-0 z-30 bg-emerald-600 text-white px-4 py-3 flex items-center justify-between animate-slideDown">
//           <div className="flex items-center gap-3">
//             <button
//               onClick={clearSelection}
//               className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-emerald-700"
//             >
//               <XMarkIcon className="w-5 h-5" />
//             </button>
//             <span className="font-semibold text-base">
//               {selectedCount} selected
//             </span>
//           </div>
//           <button
//             onClick={() => {
//               if (selectedCount === 0) {
//                 toast.error("Select at least one conversation");
//                 return;
//               }
//               setShowBroadcastComposer(true);
//             }}
//             disabled={selectedCount === 0}
//             className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 
//                        font-semibold text-sm rounded-full hover:bg-emerald-50 
//                        disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
//               <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
//             </svg>
//             Broadcast
//           </button>
//         </div>
//       )}

//       {/* ── Normal Header ── */}
//       {!isSelectionMode && (
//         <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100">
//           <div className="p-3">
//             {/* Search */}
//             <div className="relative">
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={handleSearchChange}
//                 placeholder="Search conversations..."
//                 className="w-full py-2.5 pl-10 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm
//                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
//               />
//               <MagnifyingGlassIcon className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
//               <button
//                 onClick={() => setShowTags((p) => !p)}
//                 className={`absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded-lg transition-colors
//                            ${showTags ? "bg-emerald-100 text-emerald-600" : "hover:bg-gray-100 text-gray-500"}`}
//               >
//                 <Bars3Icon className="h-5 w-5" />
//               </button>
//             </div>

//             {/* ✅ NEW: Filter Bar */}
//             <div className="flex items-center gap-2 mt-3">
//               {FILTERS.map((f) => {
//                 const count = filterCounts[f.key];
//                 const isActive = activeFilter === f.key;
//                 return (
//                   <button
//                     key={f.key}
//                     onClick={() => setActiveFilter(f.key)}
//                     className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
//                       ${isActive
//                         ? "bg-emerald-500 text-white shadow-sm"
//                         : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
//                   >
//                     {f.label}
//                     {count > 0 && f.key !== "all" && (
//                       <span
//                         className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold
//                           ${isActive ? "bg-white/25 text-white" : "bg-gray-200 text-gray-700"}`}
//                       >
//                         {count}
//                       </span>
//                     )}
//                   </button>
//                 );
//               })}

//               {/* Selection mode toggle (desktop) */}
//               <button
//                 onClick={() => setIsSelectionMode(true)}
//                 className="ml-auto p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
//                 title="Select chats for broadcast"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </button>
//             </div>

//             {/* Tags filter (existing) */}
//             {showTags && availableTags.length > 0 && (
//               <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
//                 {availableTags.map((t) => (
//                   <button
//                     key={t.name}
//                     onClick={() => handleTagChange(t.name)}
//                     className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
//                                ${selectedTags.includes(t.name)
//                                  ? "bg-emerald-500 text-white"
//                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
//                   >
//                     {t.name} ({t.count})
//                   </button>
//                 ))}
//               </div>
//             )}

//             {/* Active filters display (existing) */}
//             {(selectedTags.length > 0 || debouncedSearch) && (
//               <div className="flex items-center gap-2 mt-2 text-xs">
//                 <span className="text-gray-500">Filters:</span>
//                 {debouncedSearch && (
//                   <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
//                     "{debouncedSearch}"
//                   </span>
//                 )}
//                 {selectedTags.map((tag) => (
//                   <span key={tag} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full">
//                     {tag}
//                   </span>
//                 ))}
//                 <button onClick={clearFilters} className="ml-auto text-red-500 hover:text-red-600">
//                   Clear
//                 </button>
//               </div>
//             )}
//           </div>
//         </header>
//       )}

//       {/* New Messages Indicator */}
//       {newMessagesCount > 0 && isScrolledDown && (
//         <button
//           onClick={scrollToTop}
//           className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 
//                      bg-emerald-500 text-white text-sm font-medium rounded-full 
//                      shadow-lg hover:bg-emerald-600 flex items-center gap-2"
//         >
//           <ChevronUpIcon className="w-4 h-4" />
//           {newMessagesCount} new
//         </button>
//       )}

//       {/* Virtualized List */}
//       <div
//         ref={listContainerRef}
//         className="flex-1 overflow-y-auto overscroll-contain"
//         style={{ WebkitOverflowScrolling: "touch" }}
//       >
//         {isInitialLoad && (
//           <div className="flex flex-col items-center justify-center py-16">
//             <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
//             <p className="mt-4 text-sm text-gray-500">Loading...</p>
//           </div>
//         )}

//         {!isInitialLoad && filteredConversations.length === 0 && (
//           <div className="flex flex-col items-center justify-center py-20">
//             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//               <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={1.5}
//                   d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
//                 />
//               </svg>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-800">
//               {activeFilter === "unread"
//                 ? "No unread conversations"
//                 : activeFilter === "expired"
//                 ? "No expired conversations"
//                 : "No conversations"}
//             </h3>
//             {(debouncedSearch || selectedTags.length > 0 || activeFilter !== "all") && (
//               <button onClick={clearFilters} className="mt-4 px-4 py-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg">
//                 Clear filters
//               </button>
//             )}
//           </div>
//         )}

//         {!isInitialLoad && filteredConversations.length > 0 && (
//           <div style={{ height: totalHeight, position: "relative" }}>
//             {visibleItems.map(({ conv, style }) => (
//               <VirtualChatItem
//                 key={conv.recipient}
//                 conv={conv}
//                 style={style}
//                 onSelect={handleSelect}
//                 onMarkPurchase={handleOpenModal}
//                 formatTimestamp={formatTimestamp}
//                 isSelectionMode={isSelectionMode}
//                 isSelected={selectedRecipientsRef.current.has(conv.recipient)}
//                 onToggleSelect={handleToggleSelect}
//                 onLongPress={handleLongPress}
//               />
//             ))}
//           </div>
//         )}

//         {isLoadingMore && (
//           <div className="flex items-center justify-center py-4">
//             <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
//             <span className="ml-2 text-sm text-gray-500">Loading more...</span>
//           </div>
//         )}

//         {!hasMore && conversations.length > 10 && (
//           <div className="text-center py-6 text-xs text-gray-400">
//             — End of conversations —
//           </div>
//         )}
//       </div>

//       {/* Scroll to top button */}
//       {isScrolledDown && newMessagesCount === 0 && (
//         <button
//           onClick={scrollToTop}
//           className="absolute bottom-4 right-4 z-30 w-10 h-10 bg-gray-800 text-white 
//                      rounded-full shadow-lg flex items-center justify-center hover:bg-gray-700"
//         >
//           <ChevronUpIcon className="w-5 h-5" />
//         </button>
//       )}

//       {/* Broadcast Composer Modal */}
//       {showBroadcastComposer && (
//         <BroadcastComposer
//           recipientCount={selectedCount}
//           onSend={handleBroadcastSend}
//           onCancel={() => setShowBroadcastComposer(false)}
//           isSending={isBroadcasting}
//         />
//       )}

//       {/* Purchase Modal (existing) */}
//       <MarkPurchaseModal
//         show={showPurchaseModal}
//         onClose={handleCloseModal}
//         contact={selectedContact}
//         purchaseForm={purchaseForm}
//         setPurchaseForm={setPurchaseForm}
//         availableTags={availableTags}
//         fetchChatList={() => {
//           listCache.lastFetchTime = 0;
//           fetchChatListInternal(1, debouncedSearch, selectedTags, false);
//         }}
//         token={token}
//         loading={isLoadingMore}
//         setLoading={setIsLoadingMore}
//       />
//     </div>
//   );
// };

// export default ChatListVirtualized;


// ═══════════════════════════════════════════════════════════════════════════════
// src/components/Chat/ChatListVirtualized.jsx — WITH PIN SUPPORT
// ═══════════════════════════════════════════════════════════════════════════════
//
// CHANGES FROM ORIGINAL:
// ✅ Added is_pinned to conversation object
// ✅ Pin icon display on pinned chats
// ✅ Pin/unpin toggle in context menu
// ✅ Client-side sorting: pinned first, then by last_message_at
// ✅ Optimistic updates for instant feedback
// ✅ WebSocket handler for pin_changed action
// ═══════════════════════════════════════════════════════════════════════════════

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
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  ChevronUpIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import MarkPurchaseModal from "./MarkPurchaseModal";
import BroadcastComposer from "./BroadcastComposer";

import usePinChat from "./hooks/usePinChat";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 88;
const BUFFER_SIZE = 5;
const OVERSCAN = 3;
const SCROLL_THRESHOLD = 300;
const LONG_PRESS_DURATION = 500;

const listCache = {
  conversations: [],
  page: 1,
  hasMore: true,
  scrollTop: 0,
  searchQuery: "",
  selectedTags: [],
  lastFetchTime: 0,
};

const CACHE_TTL = 10000;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "expired", label: "Expired" },
  { key: "pinned", label: "📌 Pinned" },  // ✅ NEW filter
];

// ─────────────────────────────────────────────────────────────────────────────
// PIN ICON COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const PinIcon = memo(({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16 4a1 1 0 0 1 1 1v3.586l1.707 1.707a1 1 0 0 1 .293.707v2a1 1 0 0 1-1 1h-4v5l-1 2-1-2v-5H7a1 1 0 0 1-1-1v-2a1 1 0 0 1 .293-.707L8 8.586V5a1 1 0 0 1 1-1h7z" />
  </svg>
));

PinIcon.displayName = "PinIcon";

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT MENU COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const ChatContextMenu = memo(({
  isOpen,
  position,
  conv,
  onClose,
  onPin,
  onSelect,
  isPinning,
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !conv) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] py-1.5 bg-white rounded-xl shadow-xl
                 border border-gray-200 animate-scaleIn"
      style={{
        top: position.y,
        left: position.x,
        transform: "translateX(-50%)",
      }}
    >
      {/* Pin/Unpin */}
      <button
        onClick={() => {
          onPin(conv.recipient, conv.is_pinned);
          onClose();
        }}
        disabled={isPinning}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700
                   hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        <PinIcon className="w-4 h-4" />
        {conv.is_pinned ? "Unpin chat" : "Pin chat"}
      </button>

      {/* Open chat */}
      <button
        onClick={() => {
          onSelect(conv.recipient);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700
                   hover:bg-gray-100 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Open chat
      </button>

      <style >{`
        @keyframes scaleIn {
          from { opacity: 0; transform: translateX(-50%) scale(0.95); }
          to { opacity: 1; transform: translateX(-50%) scale(1); }
        }
        .animate-scaleIn { animation: scaleIn 0.15s ease-out; }
      `}</style>
    </div>
  );
});

ChatContextMenu.displayName = "ChatContextMenu";

// ─────────────────────────────────────────────────────────────────────────────
// VIRTUALIZED CHAT ITEM (WITH PIN)
// ─────────────────────────────────────────────────────────────────────────────

const VirtualChatItem = memo(
  ({
    conv,
    style,
    onSelect,
    onMarkPurchase,
    formatTimestamp,
    isSelectionMode,
    isSelected,
    onToggleSelect,
    onLongPress,
    onContextMenu,
  }) => {
    const longPressTimer = useRef(null);
    const wasLongPress = useRef(false);
    const touchStartPos = useRef({ x: 0, y: 0 });

    const handleTouchStart = useCallback((e) => {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      wasLongPress.current = false;
      longPressTimer.current = setTimeout(() => {
        wasLongPress.current = true;
        onLongPress?.(conv.recipient);
        // Also show context menu on long press
        onContextMenu?.(e, conv);
      }, LONG_PRESS_DURATION);
    }, [conv, onLongPress, onContextMenu]);

    const handleTouchEnd = useCallback(() => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }, []);

    const handleClick = useCallback(() => {
      if (wasLongPress.current) {
        wasLongPress.current = false;
        return;
      }
      if (isSelectionMode) {
        onToggleSelect(conv.recipient);
      } else {
        onSelect(conv.recipient);
      }
    }, [isSelectionMode, conv.recipient, onSelect, onToggleSelect]);

    const handleContextMenuEvent = useCallback((e) => {
      e.preventDefault();
      onContextMenu?.(e, conv);
    }, [conv, onContextMenu]);

    const isExpired = conv.is_expired;
    const isPinned = conv.is_pinned;

    return (
      <div
        style={style}
        className={`absolute left-0 right-0 flex items-start gap-3 px-4 py-3
                   cursor-pointer border-b border-gray-50 transition-colors
                   ${isExpired ? "opacity-60" : ""}
                   ${isPinned ? "bg-amber-50/50" : ""}
                   ${isSelected ? "bg-emerald-50" : "hover:bg-gray-50 active:bg-gray-100"}`}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onContextMenu={handleContextMenuEvent}
      >
        {/* Selection Checkbox */}
        {isSelectionMode && (
          <div className="flex-shrink-0 self-center">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                ${isSelected ? "bg-emerald-500 border-emerald-500" : "border-gray-300"}
                ${isExpired ? "opacity-40 pointer-events-none" : ""}`}
            >
              {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
            </div>
          </div>
        )}

        {/* Avatar */}
        <div className="flex-shrink-0 relative">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm
              ${isExpired
                ? "bg-gradient-to-br from-gray-400 to-gray-500"
                : "bg-gradient-to-br from-emerald-400 to-teal-500"}`}
          >
            {(conv.user_name || "U")[0].toUpperCase()}
          </div>
          
          {/* ✅ PIN INDICATOR on avatar */}
          {isPinned && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full
                            flex items-center justify-center shadow-sm">
              <PinIcon className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate text-[15px]">
                {conv.user_name || conv.recipient || "Unknown"}
              </h4>
              {/* ✅ Inline pin icon */}
              {isPinned && (
                <PinIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isExpired && (
                <ClockIcon className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span
                className={`text-xs ${
                  conv.unread_count > 0
                    ? "text-emerald-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                {formatTimestamp(conv.last_message_at)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <p
              className={`text-sm truncate flex-1 ${
                conv.unread_count > 0
                  ? "text-gray-800 font-medium"
                  : "text-gray-500"
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
              <span className="text-[10px] text-gray-400">
                +{conv.tags.length - 2}
              </span>
            )}
            {isExpired && (
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full ml-auto">
                Expired
              </span>
            )}
            {!isExpired && !isSelectionMode && (
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
            )}
          </div>
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.conv.recipient === next.conv.recipient &&
    prev.conv.last_message_at === next.conv.last_message_at &&
    prev.conv.unread_count === next.conv.unread_count &&
    prev.conv.is_expired === next.conv.is_expired &&
    prev.conv.is_pinned === next.conv.is_pinned &&  // ✅ Include pin in memo
    prev.style.top === next.style.top &&
    prev.isSelected === next.isSelected &&
    prev.isSelectionMode === next.isSelectionMode
);

VirtualChatItem.displayName = "VirtualChatItem";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const ChatListVirtualized = ({ onSelectConversation }) => {
  // State
  const [conversations, setConversations] = useState(() => listCache.conversations);
  const [searchQuery, setSearchQuery] = useState(() => listCache.searchQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(() => listCache.searchQuery);
  const [selectedTags, setSelectedTags] = useState(() => listCache.selectedTags);
  const [availableTags, setAvailableTags] = useState([]);
  const [showTags, setShowTags] = useState(false);
  const token = localStorage.getItem("authToken");

  const [page, setPage] = useState(() => listCache.page);
  const [hasMore, setHasMore] = useState(() => listCache.hasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(() => listCache.conversations.length === 0);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [scrollTop, setScrollTop] = useState(() => listCache.scrollTop);
  const [containerHeight, setContainerHeight] = useState(0);

  const [activeFilter, setActiveFilter] = useState("all");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const selectedRecipientsRef = useRef(new Set());
  const [selectedCount, setSelectedCount] = useState(0);
  const [showBroadcastComposer, setShowBroadcastComposer] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // ✅ NEW: Context menu state
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    conv: null,
  });

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [purchaseForm, setPurchaseForm] = useState({
    full_name: "",
    amount: "",
    location: "",
    tags: [],
    tagInput: "",
  });

  // Refs
  const listContainerRef = useRef(null);
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const pageRef = useRef(page);
  const hasMoreRef = useRef(hasMore);
  const searchRef = useRef(debouncedSearch);
  const tagsRef = useRef(selectedTags);
  const conversationsRef = useRef(conversations);

  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { searchRef.current = debouncedSearch; }, [debouncedSearch]);
  useEffect(() => { tagsRef.current = selectedTags; }, [selectedTags]);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ✅ PIN HANDLING
  // ═══════════════════════════════════════════════════════════════════════════

  const handlePinChange = useCallback((recipient, isPinned, isOptimistic) => {
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.recipient === recipient ? { ...c, is_pinned: isPinned } : c
      );
      
      // Re-sort: pinned first, then by date
      return updated.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        
        const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return bTime - aTime;
      });
    });
  }, []);

  const { togglePin, isPinning } = usePinChat(handlePinChange);

  const handleContextMenu = useCallback((e, conv) => {
    e.preventDefault();
    const rect = listContainerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    
    // Get position from touch or mouse event
    const clientX = e.touches?.[0]?.clientX || e.clientX;
    const clientY = e.touches?.[0]?.clientY || e.clientY;
    
    setContextMenu({
      isOpen: true,
      position: {
        x: clientX,
        y: Math.min(clientY, window.innerHeight - 120), // Keep menu in viewport
      },
      conv,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, conv: null });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIENT-SIDE FILTERED + SORTED LIST
  // ═══════════════════════════════════════════════════════════════════════════

  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    
    // Apply filter
    if (activeFilter === "unread") {
      filtered = conversations.filter((c) => c.unread_count > 0);
    } else if (activeFilter === "expired") {
      filtered = conversations.filter((c) => c.is_expired);
    } else if (activeFilter === "pinned") {
      filtered = conversations.filter((c) => c.is_pinned);
    }
    
    // Sort: pinned first, then by date (already sorted from API, but ensure)
    return filtered.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      
      const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return bTime - aTime;
    });
  }, [conversations, activeFilter]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTION HANDLERS (existing)
  // ═══════════════════════════════════════════════════════════════════════════

  const handleLongPress = useCallback(
    (recipient) => {
      if (!isSelectionMode) {
        setIsSelectionMode(true);
      }
      const conv = conversationsRef.current.find((c) => c.recipient === recipient);
      if (conv && !conv.is_expired) {
        selectedRecipientsRef.current.add(recipient);
        setSelectedCount(selectedRecipientsRef.current.size);
      }
    },
    [isSelectionMode]
  );

  const handleToggleSelect = useCallback((recipient) => {
    const conv = conversationsRef.current.find((c) => c.recipient === recipient);
    if (conv?.is_expired) return;

    const set = selectedRecipientsRef.current;
    if (set.has(recipient)) {
      set.delete(recipient);
    } else {
      set.add(recipient);
    }
    setSelectedCount(set.size);

    if (set.size === 0) {
      setIsSelectionMode(false);
    }
  }, []);

  const clearSelection = useCallback(() => {
    selectedRecipientsRef.current = new Set();
    setSelectedCount(0);
    setIsSelectionMode(false);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // BROADCAST SEND (existing)
  // ═══════════════════════════════════════════════════════════════════════════

  const handleBroadcastSend = useCallback(
    async (messageText) => {
      const recipients = Array.from(selectedRecipientsRef.current);
      if (recipients.length === 0) return { error: "No recipients selected" };

      setIsBroadcasting(true);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/chats/broadcast/`,
          { recipients, message_text: messageText },
          { headers: { Authorization: `Token ${token}` } }
        );
        setShowBroadcastComposer(false);
        clearSelection();
        return response.data;
      } catch (err) {
        return { error: err.response?.data?.error || "Failed to send broadcast" };
      } finally {
        setIsBroadcasting(false);
      }
    },
    [token, clearSelection]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // VIRTUALIZATION (existing)
  // ═══════════════════════════════════════════════════════════════════════════

  const totalHeight = filteredConversations.length * ITEM_HEIGHT;

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT);
    const endIndex = Math.min(
      filteredConversations.length - 1,
      startIndex + visibleCount + BUFFER_SIZE * 2 + OVERSCAN
    );
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, filteredConversations.length]);

  const visibleItems = useMemo(() => {
    const items = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex && i < filteredConversations.length; i++) {
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
  // SCROLL HANDLER (existing)
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

          setScrollTop(currentScrollTop);
          listCache.scrollTop = currentScrollTop;

          const distanceFromBottom = scrollHeight - currentScrollTop - clientHeight;

          if (
            distanceFromBottom < SCROLL_THRESHOLD &&
            hasMoreRef.current &&
            !isLoadingRef.current
          ) {
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

    handleResize();

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const loadMoreConversations = useCallback(() => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    const nextPage = pageRef.current + 1;
    setPage(nextPage);
    fetchChatListInternal(nextPage, searchRef.current, tagsRef.current, true);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE FETCH (existing)
  // ═══════════════════════════════════════════════════════════════════════════

  const fetchChatListInternal = useCallback(
    async (pageNum, query, tags, isAppending = false) => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;

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

        if (isAppending) {
          setConversations((prev) => {
            const ids = new Set(prev.map((c) => c.recipient));
            const uniqueNew = newItems.filter((c) => !ids.has(c.recipient));
            const merged = [...prev, ...uniqueNew];
            
            // Sort merged list
            return merged.sort((a, b) => {
              if (a.is_pinned && !b.is_pinned) return -1;
              if (!a.is_pinned && b.is_pinned) return 1;
              const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
              const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
              return bTime - aTime;
            });
          });
        } else {
          // Sort initial list
          const sorted = newItems.sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
            const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
            return bTime - aTime;
          });
          setConversations(sorted);
          setNewMessagesCount(0);
        }

        const hasNext = !!data.next;
        setHasMore(hasNext);
        hasMoreRef.current = hasNext;
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
  // SEARCH & FILTERS (existing)
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

  useEffect(() => {
    if (!token) return;

    const cacheAge = Date.now() - listCache.lastFetchTime;
    const filtersChanged =
      listCache.searchQuery !== debouncedSearch ||
      JSON.stringify(listCache.selectedTags) !== JSON.stringify(selectedTags);

    if (
      listCache.conversations.length > 0 &&
      cacheAge < CACHE_TTL &&
      !filtersChanged
    ) {
      setIsInitialLoad(false);
      return;
    }

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
  // CHAT SELECTION (existing)
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSelect = useCallback(
    (recipient) => {
      setConversations((prev) =>
        prev.map((c) => (c.recipient === recipient ? { ...c, unread_count: 0 } : c))
      );
      if (listContainerRef.current) {
        listCache.scrollTop = listContainerRef.current.scrollTop;
      }
      onSelectConversation(recipient);
    },
    [onSelectConversation]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBSOCKET (WITH PIN SUPPORT)
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

          if (action === "new_message") {
            listCache.lastFetchTime = 0;
            fetchChatListInternal(1, searchRef.current, tagsRef.current, false);

            if (!document.hasFocus() || document.visibilityState !== "visible") {
              setNewMessagesCount((c) => c + 1);
            }
          } else if (action === "mark_read" && payload) {
            setConversations((prev) =>
              prev.map((c) =>
                c.recipient === payload.recipient ? { ...c, unread_count: 0 } : c
              )
            );
          } else if (action === "contact_updated" && payload) {
            setConversations((prev) =>
              prev.map((c) =>
                c.recipient === payload.recipient
                  ? { ...c, user_name: payload.user_name }
                  : c
              )
            );
          }
          // ✅ NEW: Handle pin_changed from WebSocket
          else if (action === "pin_changed" && payload) {
            handlePinChange(payload.recipient, payload.is_pinned, false);
          }
          else if (action === "batch_update" && payload?.batch) {
            let shouldRefresh = false;

            payload.batch.forEach((update) => {
              const a = update.action;
              const p = update.data;

              if (a === "new_message") shouldRefresh = true;
              if (a === "mark_read" && p) {
                setConversations((prev) =>
                  prev.map((c) =>
                    c.recipient === p.recipient ? { ...c, unread_count: 0 } : c
                  )
                );
              }
              if (a === "contact_updated" && p) {
                setConversations((prev) =>
                  prev.map((c) =>
                    c.recipient === p.recipient ? { ...c, user_name: p.user_name } : c
                  )
                );
              }
              if (a === "pin_changed" && p) {
                handlePinChange(p.recipient, p.is_pinned, false);
              }
              if (a === "broadcast_result" && p) {
                toast.info(
                  `Broadcast: Sent to ${p.sent} chats${p.failed > 0 ? `, ${p.failed} failed` : ""}`
                );
                shouldRefresh = true;
              }
            });

            if (shouldRefresh) {
              listCache.lastFetchTime = 0;
              fetchChatListInternal(1, searchRef.current, tagsRef.current, false);
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

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (pingInterval) clearInterval(pingInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [token, fetchChatListInternal, handlePinChange]);

  // ═══════════════════════════════════════════════════════════════════════════
  // TAG HANDLERS (existing)
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

  // Modal handlers
  const handleOpenModal = useCallback((contact) => {
    setSelectedContact(contact);
    setPurchaseForm({
      full_name: contact.user_name || "",
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

  // Utils
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
    setActiveFilter("all");
  }, []);

  const isScrolledDown = scrollTop > 200;

  // Filter counts
  const filterCounts = useMemo(() => ({
    all: conversations.length,
    unread: conversations.filter((c) => c.unread_count > 0).length,
    expired: conversations.filter((c) => c.is_expired).length,
    pinned: conversations.filter((c) => c.is_pinned).length,
  }), [conversations]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Selection Mode Header */}
      {isSelectionMode && (
        <div className="sticky top-0 z-30 bg-emerald-600 text-white px-4 py-3 flex items-center justify-between animate-slideDown">
          <div className="flex items-center gap-3">
            <button
              onClick={clearSelection}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-emerald-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <span className="font-semibold text-base">
              {selectedCount} selected
            </span>
          </div>
          <button
            onClick={() => {
              if (selectedCount === 0) {
                toast.error("Select at least one conversation");
                return;
              }
              setShowBroadcastComposer(true);
            }}
            disabled={selectedCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 
                       font-semibold text-sm rounded-full hover:bg-emerald-50 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
            Broadcast
          </button>
        </div>
      )}

      {/* Normal Header */}
      {!isSelectionMode && (
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="p-3">
            {/* Search */}
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

            {/* Filter Bar */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
              {FILTERS.map((f) => {
                const count = filterCounts[f.key];
                const isActive = activeFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                      ${isActive
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {f.label}
                    {count > 0 && f.key !== "all" && (
                      <span
                        className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                          ${isActive ? "bg-white/25 text-white" : "bg-gray-200 text-gray-700"}`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                onClick={() => setIsSelectionMode(true)}
                className="ml-auto flex-shrink-0 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                title="Select chats for broadcast"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            {/* Tags filter */}
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

            {/* Active filters display */}
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
      )}

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

      {/* Virtualized List */}
      <div
        ref={listContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {isInitialLoad && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm text-gray-500">Loading...</p>
          </div>
        )}

        {!isInitialLoad && filteredConversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {activeFilter === "pinned" ? (
                <PinIcon className="w-8 h-8 text-gray-400" />
              ) : (
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {activeFilter === "unread"
                ? "No unread conversations"
                : activeFilter === "expired"
                ? "No expired conversations"
                : activeFilter === "pinned"
                ? "No pinned chats"
                : "No conversations"}
            </h3>
            {activeFilter === "pinned" && (
              <p className="text-sm text-gray-500 mt-2">
                Long-press a chat to pin it
              </p>
            )}
            {(debouncedSearch || selectedTags.length > 0 || activeFilter !== "all") && (
              <button onClick={clearFilters} className="mt-4 px-4 py-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg">
                Clear filters
              </button>
            )}
          </div>
        )}

        {!isInitialLoad && filteredConversations.length > 0 && (
          <div style={{ height: totalHeight, position: "relative" }}>
            {visibleItems.map(({ conv, style }) => (
              <VirtualChatItem
                key={conv.recipient}
                conv={conv}
                style={style}
                onSelect={handleSelect}
                onMarkPurchase={handleOpenModal}
                formatTimestamp={formatTimestamp}
                isSelectionMode={isSelectionMode}
                isSelected={selectedRecipientsRef.current.has(conv.recipient)}
                onToggleSelect={handleToggleSelect}
                onLongPress={handleLongPress}
                onContextMenu={handleContextMenu}
              />
            ))}
          </div>
        )}

        {isLoadingMore && (
          <div className="flex items-center justify-center py-4">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-sm text-gray-500">Loading more...</span>
          </div>
        )}

        {!hasMore && conversations.length > 10 && (
          <div className="text-center py-6 text-xs text-gray-400">
            — End of conversations —
          </div>
        )}
      </div>

      {/* Scroll to top button */}
      {isScrolledDown && newMessagesCount === 0 && (
        <button
          onClick={scrollToTop}
          className="absolute bottom-4 right-4 z-30 w-10 h-10 bg-gray-800 text-white 
                     rounded-full shadow-lg flex items-center justify-center hover:bg-gray-700"
        >
          <ChevronUpIcon className="w-5 h-5" />
        </button>
      )}

      {/* Context Menu */}
      <ChatContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        conv={contextMenu.conv}
        onClose={closeContextMenu}
        onPin={togglePin}
        onSelect={handleSelect}
        isPinning={isPinning}
      />

      {/* Broadcast Composer Modal */}
      {showBroadcastComposer && (
        <BroadcastComposer
          recipientCount={selectedCount}
          onSend={handleBroadcastSend}
          onCancel={() => setShowBroadcastComposer(false)}
          isSending={isBroadcasting}
        />
      )}

      {/* Purchase Modal */}
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

      {/* Styles */}
      <style >{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
    </div>
  );
};

export default ChatListVirtualized;