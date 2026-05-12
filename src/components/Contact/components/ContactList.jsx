// // ═══════════════════════════════════════════════════════════════════════════════
// // contacts/components/ContactList.jsx
// // Contact list with infinite scroll
// // ═══════════════════════════════════════════════════════════════════════════════

// import React, { useRef, useEffect, useCallback, memo } from "react";

// // ─────────────────────────────────────────────────────────────────────────────
// // CONTACT LIST ITEM (Memoized)
// // ─────────────────────────────────────────────────────────────────────────────

// const ContactListItem = memo(
//   ({ contact, isSelected, onSelect, onView }) => {
//     const handleCheckboxClick = (e) => {
//       e.stopPropagation();
//       onSelect(contact.id);
//     };

//     return (
//       <div
//         className={`flex space-x-2 hover:bg-gray-50 cursor-pointer items-center px-4 py-3 border-b border-slate-200 transition-colors ${
//           isSelected ? "bg-blue-50" : ""
//         }`}
//         onClick={() => onView(contact)}
//       >
//         {/* Checkbox */}
//         <div className="flex items-center justify-center">
//           <label
//             htmlFor={`contact_${contact.id}`}
//             className="cursor-pointer"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <input
//               type="checkbox"
//               id={`contact_${contact.id}`}
//               checked={isSelected}
//               onChange={handleCheckboxClick}
//               className="w-4 h-4 rounded-full accent-blue-600"
//             />
//           </label>
//         </div>

//         {/* Avatar */}
//         <div className="w-[15%]">
//           <div className="rounded-full bg-blue-600/10 text-blue-600 flex justify-center items-center h-12 w-12 font-medium">
//             {contact.initial_name || contact.full_name?.[0]?.toUpperCase() || "?"}
//           </div>
//         </div>

//         {/* Info */}
//         <div className="w-[75%] min-w-0">
//           <h3 className="font-medium text-gray-900 truncate">{contact.full_name}</h3>
//           <p className="text-slate-500 text-xs truncate">{contact.phone_number}</p>
          
//           {/* Tags */}
//           {contact.tags?.length > 0 && (
//             <div className="flex gap-1 mt-1 flex-wrap">
//               {contact.tags.slice(0, 2).map((tag, i) => (
//                 <span
//                   key={i}
//                   className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
//                 >
//                   {tag}
//                 </span>
//               ))}
//               {contact.tags.length > 2 && (
//                 <span className="text-[10px] text-gray-400">
//                   +{contact.tags.length - 2}
//                 </span>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   },
//   (prev, next) =>
//     prev.contact.id === next.contact.id &&
//     prev.isSelected === next.isSelected &&
//     prev.contact.full_name === next.contact.full_name &&
//     prev.contact.phone_number === next.contact.phone_number
// );

// ContactListItem.displayName = "ContactListItem";

// // ─────────────────────────────────────────────────────────────────────────────
// // CONTACT LIST (with Infinite Scroll)
// // ─────────────────────────────────────────────────────────────────────────────

// const ContactList = ({
//   contacts,
//   isLoading,
//   isLoadingMore,
//   hasMore,
//   onLoadMore,
//   selectedIds,
//   onSelect,
//   onView,
//   emptyMessage = "No contacts found",
// }) => {
//   const listContainerRef = useRef(null);
//   const loadMoreTriggerRef = useRef(null);
//   const isLoadingRef = useRef(false);

//   // Track loading state in ref
//   useEffect(() => {
//     isLoadingRef.current = isLoading || isLoadingMore;
//   }, [isLoading, isLoadingMore]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // INFINITE SCROLL (IntersectionObserver)
//   // ═══════════════════════════════════════════════════════════════════════════
//   useEffect(() => {
//     const trigger = loadMoreTriggerRef.current;
//     const container = listContainerRef.current;
//     if (!trigger || !container) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         const [entry] = entries;

//         if (entry.isIntersecting && hasMore && !isLoadingRef.current) {
//           console.log("📜 Trigger visible, loading more...");
//           onLoadMore();
//         }
//       },
//       {
//         root: container,
//         rootMargin: "200px",
//         threshold: 0,
//       }
//     );

//     observer.observe(trigger);

//     return () => observer.disconnect();
//   }, [hasMore, onLoadMore]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // RENDER
//   // ═══════════════════════════════════════════════════════════════════════════

//   // Initial loading
//   if (isLoading && contacts.length === 0) {
//     return (
//       <div className="flex-grow flex items-center justify-center py-12">
//         <div className="text-center">
//           <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
//           <p className="mt-3 text-sm text-gray-500">Loading contacts...</p>
//         </div>
//       </div>
//     );
//   }

//   // Empty state
//   if (!isLoading && contacts.length === 0) {
//     return (
//       <div className="flex-grow flex items-center justify-center py-12">
//         <div className="text-center px-4">
//           <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <svg
//               className="w-8 h-8 text-gray-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={1.5}
//                 d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//               />
//             </svg>
//           </div>
//           <p className="text-gray-600">{emptyMessage}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       ref={listContainerRef}
//       className="flex-grow overflow-y-auto"
//       style={{ maxHeight: "calc(100vh - 300px)" }}
//     >
//       {/* Contact Items */}
//       {contacts.map((contact) => (
//         <ContactListItem
//           key={contact.id}
//           contact={contact}
//           isSelected={selectedIds.includes(contact.id)}
//           onSelect={onSelect}
//           onView={onView}
//         />
//       ))}

//       {/* Infinite Scroll Trigger */}
//       <div ref={loadMoreTriggerRef} className="h-4 w-full" aria-hidden="true" />

//       {/* Loading More Indicator */}
//       {isLoadingMore && (
//         <div className="flex items-center justify-center py-4 gap-2">
//           <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//           <span className="text-sm text-gray-500">Loading more...</span>
//         </div>
//       )}

//       {/* End of List */}
//       {!hasMore && contacts.length > 10 && (
//         <div className="text-center py-4 text-xs text-gray-400">
//           — End of contacts —
//         </div>
//       )}
//     </div>
//   );
// };

// export default ContactList;

// ─────────────────────────────────────────────────────────────────────────────
// ContactList.jsx — Premium UI with full theme support
// src/components/Contact/components/ContactList.jsx
// All infinite scroll logic preserved
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useEffect, memo } from "react";

// ── AVATAR COLOR ──────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-purple-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-red-500",
  "from-cyan-400 to-blue-500",
];

const getAvatarColor = (name = "") => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ── CONTACT LIST ITEM ─────────────────────────────────────────────────────────
const ContactListItem = memo(({ contact, isSelected, onSelect, onView }) => {
  const handleCheckboxClick = (e) => { e.stopPropagation(); onSelect(contact.id); };
  const avatarColor = getAvatarColor(contact.full_name || "");
  const initial = contact.initial_name || contact.full_name?.[0]?.toUpperCase() || "?";

  return (
    <div
      className={`
        group flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all duration-200
        border-b border-gray-100 dark:border-white/5
        hover:bg-gray-50/80 dark:hover:bg-white/5
        ${isSelected 
          ? "bg-blue-50/80 dark:bg-blue-500/10 border-l-2 border-l-blue-500 dark:border-l-blue-400" 
          : "border-l-2 border-l-transparent"
        }
      `}
      onClick={() => onView(contact)}
    >
      {/* Checkbox */}
      <label 
        className="cursor-pointer shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" 
        onClick={(e) => e.stopPropagation()}
      >
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={handleCheckboxClick} 
          className="w-4 h-4 rounded accent-blue-600 cursor-pointer" 
        />
      </label>

      {/* Avatar */}
      <div className={`
        w-10 h-10 rounded-2xl bg-gradient-to-br ${avatarColor} 
        flex items-center justify-center text-white font-semibold text-sm shrink-0 
        shadow-sm ring-2 ring-white dark:ring-white/10
      `}>
        {initial}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {contact.full_name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
          {contact.phone_number}
        </p>
        {contact.tags?.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {contact.tags.slice(0, 2).map((tag, i) => (
              <span 
                key={i} 
                className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
            {contact.tags.length > 2 && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                +{contact.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chevron */}
      <svg 
        className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
      </svg>
    </div>
  );
}, (prev, next) =>
  prev.contact.id === next.contact.id &&
  prev.isSelected === next.isSelected &&
  prev.contact.full_name === next.contact.full_name
);
ContactListItem.displayName = "ContactListItem";

// ── SKELETON LOADER ───────────────────────────────────────────────────────────
const ContactSkeleton = () => (
  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-white/5 animate-pulse">
    <div className="w-4 h-4 rounded bg-gray-200 dark:bg-white/10 shrink-0" />
    <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-white/10 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 bg-gray-200 dark:bg-white/10 rounded-lg w-2/3" />
      <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-lg w-1/2" />
    </div>
  </div>
);

// ── CONTACT LIST ──────────────────────────────────────────────────────────────
const ContactList = ({ 
  contacts, 
  isLoading, 
  isLoadingMore, 
  hasMore, 
  onLoadMore, 
  selectedIds, 
  onSelect, 
  onView, 
  emptyMessage = "No contacts found" 
}) => {
  const listContainerRef = useRef(null);
  const loadMoreTriggerRef = useRef(null);
  const isLoadingRef = useRef(false);

  useEffect(() => { isLoadingRef.current = isLoading || isLoadingMore; }, [isLoading, isLoadingMore]);

  useEffect(() => {
    const trigger = loadMoreTriggerRef.current;
    const container = listContainerRef.current;
    if (!trigger || !container) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore && !isLoadingRef.current) onLoadMore(); },
      { root: container, rootMargin: "200px", threshold: 0 }
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (isLoading && contacts.length === 0) {
    return (
      <div className="flex-grow overflow-hidden bg-white dark:bg-[#0b1120]">
        {[...Array(7)].map((_, i) => (
          <ContactSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!isLoading && contacts.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center py-16 bg-white dark:bg-[#0b1120]">
        <div className="text-center px-6">
          <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{emptyMessage}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add your first contact to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={listContainerRef} 
      className="flex-grow overflow-y-auto scrollbar-thin bg-white dark:bg-[#0b1120]"
      style={{ maxHeight: "calc(100vh - 300px)" }}
    >
      {contacts.map((contact) => (
        <ContactListItem
          key={contact.id}
          contact={contact}
          isSelected={selectedIds.includes(contact.id)}
          onSelect={onSelect}
          onView={onView}
        />
      ))}
      <div ref={loadMoreTriggerRef} className="h-4 w-full" aria-hidden="true" />
      
      {isLoadingMore && (
        <div className="flex items-center justify-center py-5 gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Loading more…</span>
        </div>
      )}
      
      {!hasMore && contacts.length > 10 && (
        <p className="text-center py-5 text-[11px] text-gray-300 dark:text-gray-700 font-medium tracking-wide">
          — End of contacts —
        </p>
      )}
    </div>
  );
};

export default ContactList;