// // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// import React,{
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
// import usePinChat from "./hooks/usePinChat";
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
// // PIN ICON COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────

// const PinIcon = memo(({ className = "w-4 h-4" }) => (
//   <svg
//     className={className}
//     viewBox="0 0 24 24"
//     fill="currentColor"
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     <path d="M16 4a1 1 0 0 1 1 1v3.586l1.707 1.707a1 1 0 0 1 .293.707v2a1 1 0 0 1-1 1h-4v5l-1 2-1-2v-5H7a1 1 0 0 1-1-1v-2a1 1 0 0 1 .293-.707L8 8.586V5a1 1 0 0 1 1-1h7z" />
//   </svg>
// ));

// PinIcon.displayName = "PinIcon";

// // ─────────────────────────────────────────────────────────────────────────────
// // CONTEXT MENU COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────

// const ChatContextMenu = memo(({
//   isOpen,
//   position,
//   conv,
//   onClose,
//   onPin,
//   onSelect,
//   isPinning,
// }) => {
//   const menuRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         onClose();
//       }
//     };

//     if (isOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//       document.addEventListener("touchstart", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.removeEventListener("touchstart", handleClickOutside);
//     };
//   }, [isOpen, onClose]);

//   if (!isOpen || !conv) return null;

//   return (
//     <div
//       ref={menuRef}
//       className="fixed z-50 min-w-[160px] py-1.5 bg-white rounded-xl shadow-xl
//                  border border-gray-200 animate-scaleIn"
//       style={{
//         top: position.y,
//         left: position.x,
//         transform: "translateX(-50%)",
//       }}
//     >
//       {/* Pin/Unpin */}
//       <button
//         onClick={() => {
//           onPin(conv.recipient, conv.is_pinned);
//           onClose();
//         }}
//         disabled={isPinning}
//         className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700
//                    hover:bg-gray-100 transition-colors disabled:opacity-50"
//       >
//         <PinIcon className="w-4 h-4" />
//         {conv.is_pinned ? "Unpin chat" : "Pin chat"}
//       </button>

//       {/* Open chat */}
//       <button
//         onClick={() => {
//           onSelect(conv.recipient);
//           onClose();
//         }}
//         className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700
//                    hover:bg-gray-100 transition-colors"
//       >
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                 d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//         </svg>
//         Open chat
//       </button>

//       <style jsx>{`\n//         @keyframes scaleIn {\n//           from { opacity: 0; transform: translateX(-50%) scale(0.95); }\n//           to { opacity: 1; transform: translateX(-50%) scale(1); }\n//         }\n//         .animate-scaleIn { animation: scaleIn 0.15s ease-out; }\n//       `}</style>
//     </div>
//   );
// });

// ChatContextMenu.displayName = "ChatContextMenu";

// // ─────────────────────────────────────────────────────────────────────────────
// // VIRTUALIZED CHAT ITEM (WITH PIN SUPPORT)
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
//     onContextMenu,
//   }) => {
//     const longPressTimer = useRef(null);
//     const wasLongPress = useRef(false);

//     const handleTouchStart = useCallback(() => {
//       wasLongPress.current = false;
//       longPressTimer.current = setTimeout(() => {
//         wasLongPress.current = true;
//         onLongPress?.(conv.recipient);
//         // Also trigger context menu on long press
//         onContextMenu?.(conv);
//       }, LONG_PRESS_DURATION);
//     }, [conv.recipient, onLongPress, onContextMenu]);

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
//     const isPinned = conv.is_pinned;

//     return (
//       <div
//         style={style}
//         className={`absolute left-0 right-0 flex items-start gap-3 px-4 py-3
//                    cursor-pointer border-b border-gray-50 transition-colors
//                    ${isExpired ? "opacity-60" : ""}
//                    ${isPinned ? "bg-amber-50/30" : ""}
//                    ${isSelected ? "bg-emerald-50" : "hover:bg-gray-50 active:bg-gray-100"}`}
//         onClick={handleClick}
//         onTouchStart={handleTouchStart}
//         onTouchEnd={handleTouchEnd}
//         onTouchCancel={handleTouchEnd}
//         onContextMenu={(e) => {
//           e.preventDefault();
//           onContextMenu?.(conv, e);
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
          
//           {/* PIN INDICATOR on avatar */}
//           {isPinned && (
//             <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full
//                             flex items-center justify-center shadow-sm">
//               <PinIcon className="w-3 h-3 text-white" />
//             </div>
//           )}
//         </div>

//         {/* Content */}
//         <div className="flex-1 min-w-0 py-0.5">
//           <div className="flex items-baseline justify-between gap-2">
//             <div className="flex items-center gap-1.5 min-w-0">
//               <h4 className="font-semibold text-gray-900 truncate text-[15px]">
//                 {conv.user_name || conv.recipient || "Unknown"}
//               </h4>
//               {/* Inline pin icon */}
//               {isPinned && (
//                 <PinIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
//               )}
//             </div>
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
//     prev.conv.is_pinned === next.conv.is_pinned &&
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

//   // Filter state
//   const [activeFilter, setActiveFilter] = useState(() => {
//     return localStorage.getItem("chat_filter") || "all";
//   });

//   useEffect(() => {
//     localStorage.setItem("chat_filter", activeFilter);
//   }, [activeFilter]);

//   // Selection mode
//   const [isSelectionMode, setIsSelectionMode] = useState(false);
//   const selectedRecipientsRef = useRef(new Set());
//   const [selectedCount, setSelectedCount] = useState(0);

//   // Broadcast composer
//   const [showBroadcastComposer, setShowBroadcastComposer] = useState(false);
//   const [isBroadcasting, setIsBroadcasting] = useState(false);

//   // Context menu state - NEW
//   const [contextMenu, setContextMenu] = useState({
//     isOpen: false,
//     position: { x: 0, y: 0 },
//     conv: null,
//   });

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
//   // PIN LOGIC - NEW
//   // ═══════════════════════════════════════════════════════════════════════════

//   const handlePinChange = useCallback((recipient, isPinned) => {
//     setConversations((prev) => {
//       const updated = prev.map((c) =>
//         c.recipient === recipient ? { ...c, is_pinned: isPinned } : c
//       );

//       // ✅ IMPORTANT: reorder list (pinned first)
//       return [...updated].sort((a, b) => {
//         if (a.is_pinned && !b.is_pinned) return -1;
//         if (!a.is_pinned && b.is_pinned) return 1;

//         const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
//         const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;

//         return bTime - aTime;
//       });
//     });
//   }, []);

//   const { togglePin, isPinning } = usePinChat(handlePinChange);

//   const handleContextMenu = useCallback((conv, e) => {
//     if (e) {
//       e.preventDefault();
//       const clientX = e.touches?.[0]?.clientX || e.clientX;
//       const clientY = e.touches?.[0]?.clientY || e.clientY;
      
//       setContextMenu({
//         isOpen: true,
//         position: {
//           x: clientX,
//           y: Math.min(clientY, window.innerHeight - 120),
//         },
//         conv,
//       });
//     } else {
//       // Called from long press without event
//       setContextMenu({
//         isOpen: true,
//         position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
//         conv,
//       });
//     }
//   }, []);

//   const closeContextMenu = useCallback(() => {
//     setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, conv: null });
//   }, []);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // CLIENT-SIDE FILTERED LIST (ORIGINAL LOGIC + PIN FILTER)
//   // ═══════════════════════════════════════════════════════════════════════════
//   const filteredConversations = useMemo(() => {
//     if (activeFilter === "expired") {
//       return conversations.filter((c) => c.is_expired);
//     }
//     if (activeFilter === "pinned") {
//       return conversations.filter((c) => c.is_pinned);
//     }
//     return conversations; // unread handled by backend now
//   }, [conversations, activeFilter]);
//   // const filteredConversations = useMemo(() => {
//   //   let filtered = conversations;
    
//   //   if (activeFilter === "unread") {
//   //     filtered = conversations.filter((c) => c.unread_count > 0);
//   //   } else if (activeFilter === "expired") {
//   //     filtered = conversations.filter((c) => c.is_expired);
//   //   } else if (activeFilter === "pinned") {
//   //     filtered = conversations.filter((c) => c.is_pinned);
//   //   }
//   //   // "all" returns everything (no filter)
    
//   //   return filtered;
//   // }, [conversations, activeFilter]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // SELECTION HANDLERS (ORIGINAL)
//   // ═══════════════════════════════════════════════════════════════════════════

//   const handleLongPress = useCallback(
//     (recipient) => {
//       if (!isSelectionMode) {
//         setIsSelectionMode(true);
//       }
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
//   // BROADCAST SEND (ORIGINAL)
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
//   // VISIBILITY & CACHE (ORIGINAL)
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
//   // VIRTUALIZATION (ORIGINAL - uses filteredConversations)
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
//   // SCROLL HANDLER (ORIGINAL)
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
//   // CORE FETCH (ORIGINAL - NO SORTING HERE)
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

//         const filterQuery =
//           activeFilter !== "all" ? `&filter=${activeFilter}` : "";

//         const response = await axios.get(
//            `${API_BASE_URL}/api/chats/?page=${pageNum}&search=${encodeURIComponent(query)}${tagsQuery}${filterQuery}`,
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
//     }, [token, activeFilter]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // SEARCH (ORIGINAL)
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

//   // Initial load (original)
//   useEffect(() => {
//     if (!token) return;

//     // 🔥 IMPORTANT: prevent override when filter is active
//     if (activeFilter !== "all") return;

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

//   // ✅ NEW: refetch when filter changes
//   useEffect(() => {
//     setPage(1);
//     pageRef.current = 1;
//     setHasMore(true);
//     hasMoreRef.current = true;

//     // ✅ IMPORTANT: clear old data
//     setConversations([]);

//     // reset scroll
//     if (listContainerRef.current) {
//       listContainerRef.current.scrollTop = 0;
//     }

//     fetchChatListInternal(1, searchRef.current, tagsRef.current, false);
//   }, [activeFilter]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // CHAT SELECTION (ORIGINAL)
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
//   // WEBSOCKET (ORIGINAL + PIN HANDLER)
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
//           // NEW: Handle pin_changed from WebSocket
//           else if (action === "pin_changed" && payload) {
//             setConversations((prev) =>
//               prev.map((c) =>
//                 c.recipient === payload.recipient
//                   ? { ...c, is_pinned: payload.is_pinned }
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

//               // NEW: Handle pin_changed in batch
//               if (a === "pin_changed" && p) {
//                 setConversations((prev) =>
//                   prev.map((c) =>
//                     c.recipient === p.recipient
//                       ? { ...c, is_pinned: p.is_pinned }
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
//   // TAG HANDLERS (ORIGINAL)
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

//   // Modal handlers (original)
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

//   // Utils (original)
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
//   // FILTER COUNTS (with pinned)
//   // ═══════════════════════════════════════════════════════════════════════════

//   const filterCounts = useMemo(() => ({
//     all: conversations.length,
//     unread: conversations.filter((c) => c.unread_count > 0).length,
//     expired: conversations.filter((c) => c.is_expired).length,
//     pinned: conversations.filter((c) => c.is_pinned).length,
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

//             {/* Filter Bar - with Pinned */}
//             <div className="flex items-center gap-2 mt-3">
//               {FILTERS.concat([{ key: "pinned", label: "📌 Pinned" }]).map((f) => {
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
//               {activeFilter === "pinned" ? (
//                 <PinIcon className="w-8 h-8 text-gray-400" />
//               ) : (
//                 <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={1.5}
//                     d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
//                   />
//                 </svg>
//               )}
//             </div>
//             <h3 className="text-lg font-semibold text-gray-800">
//               {activeFilter === "unread"
//                 ? "No unread conversations"
//                 : activeFilter === "expired"
//                 ? "No expired conversations"
//                 : activeFilter === "pinned"
//                 ? "No pinned chats"
//                 : "No conversations"}
//             </h3>
//             {activeFilter === "pinned" && (
//               <p className="text-sm text-gray-500 mt-2">
//                 Long-press a chat to pin it
//               </p>
//             )}
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
//                 onContextMenu={handleContextMenu}
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

//       {/* Context Menu - NEW */}
//       <ChatContextMenu
//         isOpen={contextMenu.isOpen}
//         position={contextMenu.position}
//         conv={contextMenu.conv}
//         onClose={closeContextMenu}
//         onPin={togglePin}
//         onSelect={handleSelect}
//         isPinning={isPinning}
//       />

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

// ─────────────────────────────────────────────────────────────────────────────
// ChatList.jsx — WhatsApp-style persistent state
// src/components/Chat/ChatList.jsx
//
// BEHAVIORAL FIXES:
//
//   🔴 OLD: WebSocket new_message → fetchChatListInternal(1, ...) which:
//           - showed loading spinner over existing list
//           - set conversations=[] then refilled from API page 1
//           - reset scrollTop because array changed → virtualizer recalculated
//           - caused visible flash + full reorder of all conversations
//
//   ✅ NEW: handleIncrementalUpdate(payload)
//           - finds affected conversation in state (O(n) Map lookup)
//           - moves it to top of its pin-section (pinned / unpinned)
//           - updates only: last_message_text, last_message_at, unread_count
//           - never touches scrollTop, never clears conversations array
//           - zero API calls, no render flicker
//
//   🔴 OLD: fetchChatListInternal always set isInitialLoad=true on page 1
//           which showed a spinner and visually cleared the list.
//
//   ✅ NEW: isSilent=true mode does background merge:
//           - no loading indicator
//           - conversations array is merged (not replaced)
//           - scroll position untouched
//
//   🔴 OLD: CACHE_TTL was 10s so background re-fetches were very frequent.
//   ✅ NEW: CACHE_TTL is 30s. WS handles live updates; API is just catchup.
//
// ALL business logic preserved:
//   ✅ Virtualization (ITEM_HEIGHT, BUFFER_SIZE, OVERSCAN, scroll + resize)
//   ✅ Infinite scroll with loadMoreConversations (append pages)
//   ✅ WebSocket reconnect + all action types
//   ✅ Selection mode + broadcast composer
//   ✅ Context menu (pin / unpin via usePinChat)
//   ✅ Filter tabs (All / Unread / Expired / Pinned)
//   ✅ Tag filter panel
//   ✅ listCache module-level persistent cache
//   ✅ MarkPurchaseModal + BroadcastComposer
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  useEffect, useState, useRef, useCallback, useMemo, memo,
} from "react";
import axios from "axios";
import debounce from "lodash/debounce";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";
import {
  MagnifyingGlassIcon, Bars3Icon, ChevronUpIcon,
  ClockIcon, CheckIcon, XMarkIcon,
} from "@heroicons/react/24/solid";
import MarkPurchaseModal from "./MarkPurchaseModal";
import BroadcastComposer from "./BroadcastComposer";
import usePinChat from "./hooks/usePinChat";

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const ITEM_HEIGHT = 76;
const BUFFER_SIZE = 5;
const OVERSCAN = 3;
const SCROLL_THRESHOLD = 300;
const LONG_PRESS_DURATION = 500;

// ── MODULE-LEVEL PER-FILTER CACHE ────────────────────────────────────────────
// A Map keyed by `${filter}|${search}|${tags}`.
// Every filter (all, unread, expired, pinned) + search + tag combination gets
// its own independent slot: conversations, page, hasMore, scrollTop, lastFetchTime.
// Lives outside React — survives re-renders and CSS hide/show navigation.
//
// Old behaviour: single `listCache` object → only "all" filter preserved state;
// "unread", "expired", "pinned" always cleared conversations + reset scroll.
// New behaviour: every filter preserves its own state independently.
const filterCacheMap = new Map();
const CACHE_TTL = 30_000; // 30s — WS handles live updates; API is catchup only

/** Stable string key for a given filter + search + tag combination. */
function makeCacheKey(filter, search, tags) {
  return `${filter}|${search}|${(tags || []).join(",")}`;
}

/**
 * Get (or lazily create) the cache slot for a filter/search/tags triple.
 * All reads and writes go through this function so the Map stays consistent.
 */
function getFilterCache(filter, search, tags) {
  const key = makeCacheKey(filter, search, tags);
  if (!filterCacheMap.has(key)) {
    filterCacheMap.set(key, {
      conversations: [], page: 1, hasMore: true, scrollTop: 0, lastFetchTime: 0,
    });
  }
  return filterCacheMap.get(key);
}

const FILTERS = [
  { key: "all",     label: "All"       },
  { key: "unread",  label: "Unread"    },
  { key: "expired", label: "Expired"   },
  { key: "pinned",  label: "📌 Pinned" },
];

// Sort: pinned first, then by recency
function sortConversations(list) {
  return [...list].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return  1;
    const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
    const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
    return tb - ta;
  });
}

// ── PIN ICON ──────────────────────────────────────────────────────────────────
const PinIcon = memo(({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 4a1 1 0 0 1 1 1v3.586l1.707 1.707a1 1 0 0 1 .293.707v2a1 1 0 0 1-1 1h-4v5l-1 2-1-2v-5H7a1 1 0 0 1-1-1v-2a1 1 0 0 1 .293-.707L8 8.586V5a1 1 0 0 1 1-1h7z" />
  </svg>
));
PinIcon.displayName = "PinIcon";

// ── CONTEXT MENU ──────────────────────────────────────────────────────────────
const ChatContextMenu = memo(({ isOpen, position, conv, onClose, onPin, onSelect, isPinning }) => {
  const menuRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("touchstart", handler); };
  }, [isOpen, onClose]);

  if (!isOpen || !conv) return null;
  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700"
      style={{ top: position.y, left: position.x, transform: "translateX(-50%)" }}
    >
      <button
        onClick={() => { onPin(conv.recipient, conv.is_pinned); onClose(); }}
        disabled={isPinning}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 rounded-t-2xl"
      >
        <PinIcon className="w-4 h-4 text-amber-500" />
        {conv.is_pinned ? "Unpin chat" : "Pin to top"}
      </button>
      <div className="mx-3 h-px bg-gray-100 dark:bg-gray-700" />
      <button
        onClick={() => { onSelect(conv.recipient); onClose(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-b-2xl"
      >
        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Open chat
      </button>
    </div>
  );
});
ChatContextMenu.displayName = "ChatContextMenu";

// ── CHAT ITEM ─────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-purple-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-red-500",
  "from-cyan-400 to-blue-500",
];

const VirtualChatItem = memo(({
  conv, style, onSelect, onMarkPurchase, formatTimestamp,
  isSelectionMode, isSelected, onToggleSelect, onLongPress, onContextMenu,
}) => {
  const longPressTimer = useRef(null);
  const wasLongPress   = useRef(false);

  const handleTouchStart = useCallback(() => {
    wasLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      wasLongPress.current = true;
      onLongPress?.(conv.recipient);
      onContextMenu?.(conv);
    }, LONG_PRESS_DURATION);
  }, [conv, onLongPress, onContextMenu]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }, []);

  const handleClick = useCallback(() => {
    if (wasLongPress.current) { wasLongPress.current = false; return; }
    if (isSelectionMode) onToggleSelect(conv.recipient);
    else onSelect(conv.recipient);
  }, [isSelectionMode, conv.recipient, onSelect, onToggleSelect]);

  const avatarColor = useMemo(() => {
    const name = conv.user_name || conv.recipient || "U";
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  }, [conv.user_name, conv.recipient]);

  const isExpired = conv.is_expired;
  const isPinned  = conv.is_pinned;
  const hasUnread = conv.unread_count > 0;

  return (
    <div
      style={style}
      className={`absolute left-0 right-0 flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors duration-100
        ${isExpired ? "opacity-50" : ""}
        ${isSelected ? "bg-emerald-50 dark:bg-emerald-950/30"
          : isPinned ? "bg-amber-50/60 dark:bg-amber-950/20"
          : "hover:bg-gray-50 dark:hover:bg-gray-800/60 active:bg-gray-100 dark:active:bg-gray-800"}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu?.(conv, e); }}
    >
      {isSelectionMode && (
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
          ${isSelected ? "bg-emerald-500 border-emerald-500" : "border-gray-300 dark:border-gray-600"}`}>
          {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
        </div>
      )}

      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${isExpired ? "from-gray-400 to-gray-500" : avatarColor}
          flex items-center justify-center text-white font-semibold text-base shadow-sm`}>
          {(conv.user_name || "U")[0].toUpperCase()}
        </div>
        {isPinned && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
            <PinIcon className="w-2.5 h-2.5 text-white" />
          </div>
        )}
        {hasUnread && !isSelectionMode && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
        )}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`truncate text-sm leading-tight
              ${hasUnread ? "font-semibold text-gray-900 dark:text-white" : "font-medium text-gray-800 dark:text-gray-200"}`}>
              {conv.user_name || conv.recipient || "Unknown"}
            </span>
            {isPinned && <PinIcon className="w-3 h-3 text-amber-400 shrink-0" />}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isExpired && <ClockIcon className="w-3 h-3 text-amber-500" />}
            <span className={`text-[11px] ${hasUnread ? "text-emerald-600 font-semibold" : "text-gray-400 dark:text-gray-500"}`}>
              {formatTimestamp(conv.last_message_at)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className={`text-xs truncate flex-1
            ${hasUnread ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
            {conv.last_message_text || "No messages yet"}
          </p>
          {hasUnread && (
            <span className="shrink-0 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {conv.unread_count > 99 ? "99+" : conv.unread_count}
            </span>
          )}
          {isExpired && !hasUnread && (
            <span className="text-[9px] text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded-full">Expired</span>
          )}
        </div>
        {conv.tags?.length > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            {conv.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">{tag}</span>
            ))}
            {conv.tags.length > 2 && <span className="text-[9px] text-gray-400">+{conv.tags.length - 2}</span>}
          </div>
        )}
      </div>
    </div>
  );
}, (prev, next) =>
  prev.conv.recipient      === next.conv.recipient      &&
  prev.conv.last_message_at=== next.conv.last_message_at&&
  prev.conv.unread_count   === next.conv.unread_count   &&
  prev.conv.is_expired     === next.conv.is_expired     &&
  prev.conv.is_pinned      === next.conv.is_pinned      &&
  prev.style.top           === next.style.top           &&
  prev.isSelected          === next.isSelected          &&
  prev.isSelectionMode     === next.isSelectionMode
);
VirtualChatItem.displayName = "VirtualChatItem";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const ChatListVirtualized = ({ onSelectConversation }) => {
  // Compute once at call-site — used only to seed the initial useState values.
  // Both calls are cheap (localStorage read + Map lookup) so running them on
  // every render is inconsequential; lazy initialisers only execute once anyway.
  const _initFilter = localStorage.getItem("chat_filter") || "all";
  const _initCache  = getFilterCache(_initFilter, "", []);

  const [conversations,       setConversations]       = useState(() => _initCache.conversations);
  const [searchQuery,         setSearchQuery]         = useState("");
  const [debouncedSearch,     setDebouncedSearch]     = useState("");
  const [selectedTags,        setSelectedTags]        = useState([]);
  const [availableTags,       setAvailableTags]       = useState([]);
  const [showTags,            setShowTags]            = useState(false);
  const [page,                setPage]                = useState(() => _initCache.page);
  const [hasMore,             setHasMore]             = useState(() => _initCache.hasMore);
  const [isLoadingMore,       setIsLoadingMore]       = useState(false);
  const [isInitialLoad,       setIsInitialLoad]       = useState(() => _initCache.conversations.length === 0);
  const [newMessagesCount,    setNewMessagesCount]    = useState(0);
  const [scrollTop,           setScrollTop]           = useState(() => _initCache.scrollTop);
  const [containerHeight,     setContainerHeight]     = useState(0);
  const [activeFilter,        setActiveFilter]        = useState(_initFilter);
  const [isSelectionMode,     setIsSelectionMode]     = useState(false);
  const [selectedCount,       setSelectedCount]       = useState(0);
  const [showBroadcastComposer, setShowBroadcastComposer] = useState(false);
  const [isBroadcasting,      setIsBroadcasting]      = useState(false);
  const [contextMenu,         setContextMenu]         = useState({ isOpen: false, position: { x: 0, y: 0 }, conv: null });
  const [showPurchaseModal,   setShowPurchaseModal]   = useState(false);
  const [selectedContact,     setSelectedContact]     = useState(null);
  const [purchaseForm,        setPurchaseForm]        = useState({ full_name: "", amount: "", location: "", tags: [], tagInput: "" });

  const token = localStorage.getItem("authToken");

  // ── REFS ───────────────────────────────────────────────────────────────────
  const listContainerRef   = useRef(null);
  const isLoadingRef       = useRef(false);
  const abortControllerRef = useRef(null);
  const pageRef            = useRef(page);
  const hasMoreRef         = useRef(hasMore);
  const searchRef          = useRef(debouncedSearch);
  const tagsRef            = useRef(selectedTags);
  const conversationsRef   = useRef(conversations);
  const selectedRecipientsRef = useRef(new Set());

  // ── CURRENT CACHE SLOT REF ────────────────────────────────────────────────
  // Always points to the active filter's cache slot.
  // Kept in sync via a useEffect (declared before the initial-load effect so
  // React's ordered-effect guarantee ensures it runs first on the same commit).
  // The scroll handler ([] deps, set up once) reads/writes this ref so it
  // always touches the right slot even as filter / search / tags change.
  const currentCacheRef = useRef(getFilterCache(_initFilter, "", []));

  useEffect(() => { pageRef.current          = page;            }, [page]);
  useEffect(() => { hasMoreRef.current       = hasMore;         }, [hasMore]);
  useEffect(() => { searchRef.current        = debouncedSearch; }, [debouncedSearch]);
  useEffect(() => { tagsRef.current          = selectedTags;    }, [selectedTags]);
  useEffect(() => { conversationsRef.current = conversations;   }, [conversations]);
  useEffect(() => { localStorage.setItem("chat_filter", activeFilter); }, [activeFilter]);

  // Keep currentCacheRef pointed at the active filter's slot.
  // Declared BEFORE the initial-load effect so React runs this first when
  // filter/search/tags all change in the same commit — guaranteeing that
  // fetchChatListInternal writes lastFetchTime to the correct slot.
  useEffect(() => {
    currentCacheRef.current = getFilterCache(activeFilter, debouncedSearch, selectedTags);
  }, [activeFilter, debouncedSearch, selectedTags]);

  // Keep the active filter's cache slot in sync with live state
  useEffect(() => {
    const slot         = currentCacheRef.current;
    slot.conversations = conversations;
    slot.page          = page;
    slot.hasMore       = hasMore;
  }, [conversations, page, hasMore]);

  // ── PIN ────────────────────────────────────────────────────────────────────
  const handlePinChange = useCallback((recipient, isPinned) => {
    setConversations((prev) =>
      sortConversations(prev.map((c) => c.recipient === recipient ? { ...c, is_pinned: isPinned } : c))
    );
  }, []);

  const { togglePin, isPinning } = usePinChat(handlePinChange);

  const handleContextMenu = useCallback((conv, e) => {
    if (e) {
      e.preventDefault();
      const cx = e.touches?.[0]?.clientX || e.clientX;
      const cy = e.touches?.[0]?.clientY || e.clientY;
      setContextMenu({ isOpen: true, position: { x: cx, y: Math.min(cy, window.innerHeight - 120) }, conv });
    } else {
      setContextMenu({ isOpen: true, position: { x: window.innerWidth / 2, y: window.innerHeight / 2 }, conv });
    }
  }, []);
  const closeContextMenu = useCallback(() => setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, conv: null }), []);

  // ── FILTER VIEW ────────────────────────────────────────────────────────────
  const filteredConversations = useMemo(() => {
    if (activeFilter === "expired") return conversations.filter((c) => c.is_expired);
    if (activeFilter === "pinned")  return conversations.filter((c) => c.is_pinned);
    return conversations;
  }, [conversations, activeFilter]);

  // ── SELECTION MODE ─────────────────────────────────────────────────────────
  const handleLongPress = useCallback((recipient) => {
    if (!isSelectionMode) setIsSelectionMode(true);
    const conv = conversationsRef.current.find((c) => c.recipient === recipient);
    if (conv && !conv.is_expired) {
      selectedRecipientsRef.current.add(recipient);
      setSelectedCount(selectedRecipientsRef.current.size);
    }
  }, [isSelectionMode]);

  const handleToggleSelect = useCallback((recipient) => {
    const conv = conversationsRef.current.find((c) => c.recipient === recipient);
    if (conv?.is_expired) return;
    const set = selectedRecipientsRef.current;
    if (set.has(recipient)) set.delete(recipient); else set.add(recipient);
    setSelectedCount(set.size);
    if (set.size === 0) setIsSelectionMode(false);
  }, []);

  const clearSelection = useCallback(() => {
    selectedRecipientsRef.current = new Set();
    setSelectedCount(0);
    setIsSelectionMode(false);
  }, []);

  // ── BROADCAST ──────────────────────────────────────────────────────────────
  const handleBroadcastSend = useCallback(async (messageText) => {
    const recipients = Array.from(selectedRecipientsRef.current);
    if (!recipients.length) return { error: "No recipients selected" };
    setIsBroadcasting(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/chats/broadcast/`,
        { recipients, message_text: messageText },
        { headers: { Authorization: `Token ${token}` } }
      );
      setShowBroadcastComposer(false);
      clearSelection();
      return res.data;
    } catch (err) {
      return { error: err.response?.data?.error || "Failed to send broadcast" };
    } finally {
      setIsBroadcasting(false);
    }
  }, [token, clearSelection]);

  // ── VIRTUALIZATION ─────────────────────────────────────────────────────────
  const totalHeight = filteredConversations.length * ITEM_HEIGHT;

  const visibleRange = useMemo(() => {
    const startIndex   = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT);
    const endIndex     = Math.min(filteredConversations.length - 1, startIndex + visibleCount + BUFFER_SIZE * 2 + OVERSCAN);
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, filteredConversations.length]);

  const visibleItems = useMemo(() => {
    const items = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex && i < filteredConversations.length; i++) {
      items.push({ index: i, conv: filteredConversations[i], style: { position: "absolute", top: i * ITEM_HEIGHT, left: 0, right: 0, height: ITEM_HEIGHT } });
    }
    return items;
  }, [visibleRange, filteredConversations]);

  // ── SCROLL HANDLER ─────────────────────────────────────────────────────────
  useEffect(() => {
    const container = listContainerRef.current;
    if (!container) return;
    let rafId = null; let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const st = container.scrollTop;
          setScrollTop(st);
          currentCacheRef.current.scrollTop = st;
          const gap = container.scrollHeight - st - container.clientHeight;
          if (gap < SCROLL_THRESHOLD && hasMoreRef.current && !isLoadingRef.current) {
            const nextPage = pageRef.current + 1;
            setPage(nextPage);
            fetchChatListInternalRef.current?.(nextPage, searchRef.current, tagsRef.current, true, false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    const handleResize = () => setContainerHeight(container.clientHeight);
    handleResize();
    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize,   { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []); // stable — only set up once

  // Restore scroll on mount for the initial filter's cached position
  useEffect(() => {
    const savedScroll = currentCacheRef.current.scrollTop;
    if (listContainerRef.current && savedScroll > 0) {
      listContainerRef.current.scrollTop = savedScroll;
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ INCREMENTAL UPDATE (replaces full refetch on new_message)
  //
  // Moves the affected conversation to top of its pin-section and updates
  // its metadata fields. No API call. No spinner. Scroll untouched.
  // ─────────────────────────────────────────────────────────────────────────
  const handleIncrementalUpdate = useCallback((payload) => {
    if (!payload?.recipient) return;

    const { recipient, text_content, timestamp, user_name, tags, direction } = payload;
    const isOutbound = direction === "OUTBOUND";

    setConversations((prev) => {
      const existingIdx = prev.findIndex((c) => c.recipient === recipient);

      if (existingIdx === -1) {
        // Brand-new conversation → insert at top of unpinned section
        const newConv = {
          recipient,
          user_name: user_name || recipient,
          last_message_text: text_content || "",
          last_message_at:   timestamp    || new Date().toISOString(),
          unread_count: isOutbound ? 0 : 1,
          tags: tags || [],
          is_expired: false,
          is_pinned:  false,
        };
        const pinned   = prev.filter((c) => c.is_pinned);
        const unpinned = prev.filter((c) => !c.is_pinned);
        return [...pinned, newConv, ...unpinned];
      }

      const existing = prev[existingIdx];
      const updated  = {
        ...existing,
        last_message_text: text_content || existing.last_message_text,
        last_message_at:   timestamp    || new Date().toISOString(),
        // Outbound messages don't increment unread
        unread_count: isOutbound ? existing.unread_count : existing.unread_count + 1,
        user_name:    user_name || existing.user_name,
        is_expired:   false, // just received/sent → can't be expired
      };

      const withoutCurrent = prev.filter((_, i) => i !== existingIdx);

      if (existing.is_pinned) {
        // Stays pinned, moves to top of pinned section
        const pinnedRest = withoutCurrent.filter((c) => c.is_pinned);
        const unpinned   = withoutCurrent.filter((c) => !c.is_pinned);
        return [updated, ...pinnedRest, ...unpinned];
      } else {
        // Moves to top of unpinned section
        const pinned       = withoutCurrent.filter((c) => c.is_pinned);
        const unpinnedRest = withoutCurrent.filter((c) => !c.is_pinned);
        return [...pinned, updated, ...unpinnedRest];
      }
    });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // CORE FETCH
  //
  // isSilent=true → background merge (no spinner, no list clear, no scroll reset)
  // isSilent=false → normal load (shows spinner on page 1, replaces list)
  // isAppending=true → page 2+ (appends without touching earlier items)
  // ─────────────────────────────────────────────────────────────────────────
  const fetchChatListInternal = useCallback(
    async (pageNum, query, tags, isAppending = false, isSilent = false) => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;

      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      try {
        if      (isAppending)    setIsLoadingMore(true);
        else if (!isSilent)      setIsInitialLoad(true);
        // isSilent → no indicator change

        const tagsQ   = tags.length > 0 ? `&tags=${encodeURIComponent(tags.join(","))}` : "";
        const filterQ = activeFilter !== "all" ? `&filter=${activeFilter}` : "";

        const response = await axios.get(
          `${API_BASE_URL}/api/chats/?page=${pageNum}&search=${encodeURIComponent(query)}${tagsQ}${filterQ}`,
          { headers: { Authorization: `Token ${token}` }, signal: abortControllerRef.current.signal }
        );

        const newItems = response.data.results || [];
        const hasNext  = !!response.data.next;

        if (isAppending) {
          // Append pages without disturbing existing items or scroll
          setConversations((prev) => {
            const ids = new Set(prev.map((c) => c.recipient));
            return [...prev, ...newItems.filter((c) => !ids.has(c.recipient))];
          });
        } else if (isSilent) {
          // Background merge: update existing, add brand-new — no reorder flicker
          setConversations((prev) => {
            const prevMap = new Map(prev.map((c) => [c.recipient, c]));

            const merged = prev.map((existing) => {
              const fresh = newItems.find((n) => n.recipient === existing.recipient);
              if (!fresh) return existing;
              return { ...existing, ...fresh, is_pinned: fresh.is_pinned ?? existing.is_pinned };
            });

            const brandNew = newItems.filter((n) => !prevMap.has(n.recipient));
            if (!brandNew.length) return sortConversations(merged);

            const pinned   = merged.filter((c) => c.is_pinned);
            const unpinned = merged.filter((c) => !c.is_pinned);
            return [...pinned, ...brandNew, ...unpinned];
          });
          setNewMessagesCount(0);
        } else {
          // Full load (initial / filter change)
          setConversations(newItems);
          setNewMessagesCount(0);
        }

        setHasMore(hasNext);
        hasMoreRef.current = hasNext;
        currentCacheRef.current.lastFetchTime = Date.now();
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          toast.error("Failed to fetch chats");
        }
      } finally {
        isLoadingRef.current = false;
        setIsLoadingMore(false);
        setIsInitialLoad(false);
      }
    },
    [token, activeFilter]
  );

  // Stable ref so the scroll handler (set up once) can call the latest version
  const fetchChatListInternalRef = useRef(fetchChatListInternal);
  useEffect(() => { fetchChatListInternalRef.current = fetchChatListInternal; }, [fetchChatListInternal]);

  // ── SEARCH ─────────────────────────────────────────────────────────────────
  const debouncedSetSearch = useMemo(() => debounce((val) => setDebouncedSearch(val), 400), []);
  const handleSearchChange = useCallback((e) => { setSearchQuery(e.target.value); debouncedSetSearch(e.target.value); }, [debouncedSetSearch]);
  useEffect(() => () => debouncedSetSearch.cancel(), [debouncedSetSearch]);

  // ── INITIAL / FILTER LOAD ──────────────────────────────────────────────────
  // Uniform for ALL filters — checks the per-filter cache slot first.
  //
  // Cache HIT  (slot has data + age < TTL):
  //   → Restore conversations, page, hasMore from the slot.
  //   → Restore this filter's scrollTop via requestAnimationFrame.
  //   → No API call, no spinner, no scroll reset.
  //
  // Cache MISS (slot empty or stale):
  //   → Clear list, reset scroll, fetch page 1 from API.
  //
  // OLD bug: `activeFilter !== "all"` always cleared + refetched,
  // so unread/expired/pinned behaved like a remount every time.
  useEffect(() => {
    if (!token) return;

    const slot     = getFilterCache(activeFilter, debouncedSearch, selectedTags);
    const cacheAge = Date.now() - slot.lastFetchTime;

    if (slot.conversations.length > 0 && cacheAge < CACHE_TTL) {
      // ── CACHE HIT ──────────────────────────────────────────────────────
      setConversations(slot.conversations);
      setPage(slot.page);       pageRef.current    = slot.page;
      setHasMore(slot.hasMore); hasMoreRef.current = slot.hasMore;
      setIsInitialLoad(false);
      // Restore this filter's scroll position on the next paint
      requestAnimationFrame(() => {
        if (listContainerRef.current) {
          listContainerRef.current.scrollTop = slot.scrollTop;
          setScrollTop(slot.scrollTop);
        }
      });
      return;
    }

    // ── CACHE MISS ─────────────────────────────────────────────────────
    setPage(1); pageRef.current    = 1;
    setHasMore(true); hasMoreRef.current = true;
    setConversations([]);
    if (listContainerRef.current) listContainerRef.current.scrollTop = 0;
    fetchChatListInternal(1, debouncedSearch, selectedTags, false, false);
  }, [token, debouncedSearch, selectedTags, activeFilter]); // eslint-disable-line

  // ── WEBSOCKET ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    let ws; let pingInterval; let isMounted = true; let reconnectTimeout;
    const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    const backendHost = API_BASE_URL.replace(/^https?:\/\//, "");
    const wsUrl = `${wsProtocol}${backendHost}/ws/chatlist/?token=${token}`;

    const connect = () => {
      if (!isMounted) return;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "pong" }));
        }, 20000);
      };

      ws.onmessage = (e) => {
        if (!isMounted) return;
        try {
          const data    = JSON.parse(e.data || "{}");
          if (data.type === "ping") { ws.send(JSON.stringify({ type: "pong" })); return; }

          const action  = data.message?.action;
          const payload = data.message?.data;

          // ── new_message: INCREMENTAL UPDATE only — no refetch ─────────────
          if (action === "new_message") {
            handleIncrementalUpdate(payload);
            if (!document.hasFocus() || document.visibilityState !== "visible") {
              setNewMessagesCount((c) => c + 1);
            }
          }
          // ── mark_read: zero unread in-place ──────────────────────────────
          else if (action === "mark_read" && payload) {
            setConversations((prev) =>
              prev.map((c) => c.recipient === payload.recipient ? { ...c, unread_count: 0 } : c)
            );
          }
          // ── contact_updated: name change in-place, no reorder ────────────
          else if (action === "contact_updated" && payload) {
            setConversations((prev) =>
              prev.map((c) => c.recipient === payload.recipient ? { ...c, user_name: payload.user_name } : c)
            );
          }
          // ── pin_changed: update + sort ────────────────────────────────────
          else if (action === "pin_changed" && payload) {
            setConversations((prev) =>
              sortConversations(prev.map((c) => c.recipient === payload.recipient ? { ...c, is_pinned: payload.is_pinned } : c))
            );
          }
          // ── refresh_chatlist: silent background merge ────────────────────
          else if (action === "refresh_chatlist") {
            currentCacheRef.current.lastFetchTime = 0;
            setTimeout(() => fetchChatListInternalRef.current?.(1, searchRef.current, tagsRef.current, false, true), 500);
          }
          // ── batch_update ──────────────────────────────────────────────────
          else if (action === "batch_update" && payload?.batch) {
            let needRefresh = false;
            payload.batch.forEach(({ action: a, data: p }) => {
              if (a === "new_message")    handleIncrementalUpdate(p);
              if (a === "mark_read" && p)
                setConversations((prev) => prev.map((c) => c.recipient === p.recipient ? { ...c, unread_count: 0 } : c));
              if (a === "contact_updated" && p)
                setConversations((prev) => prev.map((c) => c.recipient === p.recipient ? { ...c, user_name: p.user_name } : c));
              if (a === "pin_changed" && p)
                setConversations((prev) => sortConversations(prev.map((c) => c.recipient === p.recipient ? { ...c, is_pinned: p.is_pinned } : c)));
              if (a === "broadcast_result" || a === "refresh_chatlist") needRefresh = true;
            });
            if (needRefresh) {
              currentCacheRef.current.lastFetchTime = 0;
              setTimeout(() => fetchChatListInternalRef.current?.(1, searchRef.current, tagsRef.current, false, true), 500);
            }
          }
        } catch (err) { console.error("WS parse error:", err); }
      };

      ws.onclose = () => { if (isMounted) reconnectTimeout = setTimeout(connect, 2000); };
      ws.onerror = () => ws.close();
    };

    connect();
    return () => { isMounted = false; if (pingInterval) clearInterval(pingInterval); if (reconnectTimeout) clearTimeout(reconnectTimeout); if (ws) ws.close(); };
  }, [token, handleIncrementalUpdate]); // fetchChatListInternal accessed via ref

  // ── VISIBILITY CHANGE ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible" && Date.now() - currentCacheRef.current.lastFetchTime > CACHE_TTL) {
        fetchChatListInternalRef.current?.(1, searchRef.current, tagsRef.current, false, true);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  // ── CHAT SELECT ────────────────────────────────────────────────────────────
  const saveScrollPosition = useCallback(() => {
    if (listContainerRef.current) {
      currentCacheRef.current.scrollTop = listContainerRef.current.scrollTop;
    }
  }, []);

  const handleSelect = useCallback((recipient) => {
    // Optimistic: zero out unread immediately
    setConversations((prev) =>
      prev.map((c) => c.recipient === recipient ? { ...c, unread_count: 0 } : c)
    );
    saveScrollPosition();
    onSelectConversation(recipient);
  }, [onSelectConversation, saveScrollPosition]);

  // ── TAGS ───────────────────────────────────────────────────────────────────
  const handleTagChange = useCallback((tag) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }, []);

  useEffect(() => {
    if (!token) return;
    axios.get(`${API_BASE_URL}/api/contacts/tags/`, { headers: { Authorization: `Token ${token}` } })
      .then((res) => setAvailableTags(res.data.tags.map((t) => ({ name: t.tag, count: t.count }))))
      .catch(() => {});
  }, [token]);

  // ── MODALS ─────────────────────────────────────────────────────────────────
  const handleOpenModal  = useCallback((contact) => {
    setSelectedContact(contact);
    setPurchaseForm({ full_name: contact.user_name || "", amount: "", location: "", tags: contact.tags || [], tagInput: "" });
    setShowPurchaseModal(true);
  }, []);
  const handleCloseModal = useCallback(() => { setShowPurchaseModal(false); setSelectedContact(null); }, []);

  // ── UTILS ──────────────────────────────────────────────────────────────────
  const formatTimestamp = useCallback((ts) => {
    if (!ts) return "";
    const d = new Date(ts); const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const yest = new Date(now); yest.setDate(now.getDate() - 1);
    if (d.toDateString() === yest.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, []);

  const scrollToTop  = useCallback(() => { listContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" }); setNewMessagesCount(0); }, []);
  const clearFilters = useCallback(() => { setSearchQuery(""); setDebouncedSearch(""); setSelectedTags([]); setActiveFilter("all"); }, []);

  const isScrolledDown = scrollTop > 200;

  const filterCounts = useMemo(() => ({
    all:     conversations.length,
    unread:  conversations.filter((c) => c.unread_count > 0).length,
    expired: conversations.filter((c) => c.is_expired).length,
    pinned:  conversations.filter((c) => c.is_pinned).length,
  }), [conversations]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative">

      {/* Selection header */}
      {isSelectionMode && (
        <div className="sticky top-0 z-30 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <button onClick={clearSelection} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"><XMarkIcon className="w-5 h-5" /></button>
            <span className="font-semibold">{selectedCount} selected</span>
          </div>
          <button
            onClick={() => { if (!selectedCount) { toast.error("Select at least one conversation"); return; } setShowBroadcastComposer(true); }}
            disabled={!selectedCount}
            className="flex items-center gap-2 px-4 py-1.5 bg-white text-emerald-700 font-semibold text-sm rounded-full hover:bg-emerald-50 disabled:opacity-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            Broadcast
          </button>
        </div>
      )}

      {/* Normal header */}
      {!isSelectionMode && (
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
          <div className="p-3 space-y-2.5">
            <div className="relative flex items-center">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text" value={searchQuery} onChange={handleSearchChange}
                placeholder="Search conversations…"
                className="w-full pl-9 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 border border-transparent focus:outline-none focus:border-emerald-300 dark:focus:border-emerald-700 focus:bg-white dark:focus:bg-gray-700 transition-all"
              />
              <button onClick={() => setShowTags((p) => !p)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-colors ${showTags ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                <Bars3Icon className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {FILTERS.map((f) => {
                const count    = filterCounts[f.key];
                const isActive = activeFilter === f.key;
                return (
                  <button key={f.key} onClick={() => setActiveFilter(f.key)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${isActive
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                    {f.label}
                    {count > 0 && f.key !== "all" && (
                      <span className={`ml-1 text-[10px] font-bold ${isActive ? "text-white/80" : "text-gray-400"}`}>{count}</span>
                    )}
                  </button>
                );
              })}
              <button onClick={() => setIsSelectionMode(true)} className="ml-auto p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Select chats">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
            </div>

            {showTags && availableTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {availableTags.map((t) => (
                  <button key={t.name} onClick={() => handleTagChange(t.name)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${selectedTags.includes(t.name) ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                    {t.name} <span className="opacity-60">({t.count})</span>
                  </button>
                ))}
              </div>
            )}

            {(selectedTags.length > 0 || debouncedSearch) && (
              <div className="flex items-center gap-1.5 text-xs flex-wrap">
                {debouncedSearch && <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">"{debouncedSearch}"</span>}
                {selectedTags.map((tag) => <span key={tag} className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-full">{tag}</span>)}
                <button onClick={clearFilters} className="ml-auto text-red-500 hover:text-red-600 font-medium">Clear</button>
              </div>
            )}
          </div>
        </div>
      )}

      {newMessagesCount > 0 && isScrolledDown && (
        <button onClick={scrollToTop} className="absolute top-[5.5rem] left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg hover:bg-emerald-600 flex items-center gap-1.5">
          <ChevronUpIcon className="w-3.5 h-3.5" />
          {newMessagesCount} new
        </button>
      )}

      {/* Virtualized list */}
      <div ref={listContainerRef} className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
        {isInitialLoad && (
          <div className="space-y-0">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 animate-pulse border-b border-gray-50 dark:border-gray-800/50">
                <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-full w-2/5" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-3/5" />
                </div>
                <div className="h-3 w-8 bg-gray-100 dark:bg-gray-800 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {!isInitialLoad && filteredConversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              {activeFilter === "pinned" ? <PinIcon className="w-8 h-8 text-gray-400" /> : (
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {activeFilter === "unread" ? "No unread conversations" : activeFilter === "expired" ? "No expired conversations" : activeFilter === "pinned" ? "No pinned chats" : "No conversations"}
            </p>
            {activeFilter === "pinned" && <p className="text-xs text-gray-400 mt-1">Long-press a chat to pin it</p>}
            {(debouncedSearch || selectedTags.length > 0 || activeFilter !== "all") && (
              <button onClick={clearFilters} className="mt-3 px-4 py-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 rounded-full font-medium hover:bg-emerald-100 transition-colors">
                Clear filters
              </button>
            )}
          </div>
        )}

        {!isInitialLoad && filteredConversations.length > 0 && (
          <div style={{ height: totalHeight, position: "relative" }}>
            {visibleItems.map(({ conv, style }) => (
              <VirtualChatItem
                key={conv.recipient} conv={conv} style={style}
                onSelect={handleSelect} onMarkPurchase={handleOpenModal}
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
          <div className="flex items-center justify-center py-4 gap-2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-400 dark:text-gray-500">Loading more…</span>
          </div>
        )}
        {!hasMore && conversations.length > 10 && (
          <p className="text-center py-5 text-[11px] text-gray-300 dark:text-gray-700">— End of conversations —</p>
        )}
      </div>

      {isScrolledDown && newMessagesCount === 0 && (
        <button onClick={scrollToTop} className="absolute bottom-4 right-4 z-30 w-9 h-9 bg-gray-900/80 dark:bg-gray-100/80 text-white dark:text-gray-900 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-900 dark:hover:bg-white transition-colors backdrop-blur-sm">
          <ChevronUpIcon className="w-4 h-4" />
        </button>
      )}

      <ChatContextMenu isOpen={contextMenu.isOpen} position={contextMenu.position} conv={contextMenu.conv} onClose={closeContextMenu} onPin={togglePin} onSelect={handleSelect} isPinning={isPinning} />

      {showBroadcastComposer && (
        <BroadcastComposer recipientCount={selectedCount} onSend={handleBroadcastSend} onCancel={() => setShowBroadcastComposer(false)} isSending={isBroadcasting} />
      )}

      <MarkPurchaseModal
        show={showPurchaseModal} onClose={handleCloseModal} contact={selectedContact}
        purchaseForm={purchaseForm} setPurchaseForm={setPurchaseForm} availableTags={availableTags}
        fetchChatList={() => { currentCacheRef.current.lastFetchTime = 0; fetchChatListInternalRef.current?.(1, debouncedSearch, selectedTags, false, true); }}
        token={token} loading={isLoadingMore} setLoading={setIsLoadingMore}
      />
    </div>
  );
};

export default ChatListVirtualized;