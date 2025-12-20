// ═══════════════════════════════════════════════════════════════════════════════
// contacts/components/ContactList.jsx
// Contact list with infinite scroll
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useRef, useEffect, useCallback, memo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT LIST ITEM (Memoized)
// ─────────────────────────────────────────────────────────────────────────────

const ContactListItem = memo(
  ({ contact, isSelected, onSelect, onView }) => {
    const handleCheckboxClick = (e) => {
      e.stopPropagation();
      onSelect(contact.id);
    };

    return (
      <div
        className={`flex space-x-2 hover:bg-gray-50 cursor-pointer items-center px-4 py-3 border-b border-slate-200 transition-colors ${
          isSelected ? "bg-blue-50" : ""
        }`}
        onClick={() => onView(contact)}
      >
        {/* Checkbox */}
        <div className="flex items-center justify-center">
          <label
            htmlFor={`contact_${contact.id}`}
            className="cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              id={`contact_${contact.id}`}
              checked={isSelected}
              onChange={handleCheckboxClick}
              className="w-4 h-4 rounded-full accent-blue-600"
            />
          </label>
        </div>

        {/* Avatar */}
        <div className="w-[15%]">
          <div className="rounded-full bg-blue-600/10 text-blue-600 flex justify-center items-center h-12 w-12 font-medium">
            {contact.initial_name || contact.full_name?.[0]?.toUpperCase() || "?"}
          </div>
        </div>

        {/* Info */}
        <div className="w-[75%] min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{contact.full_name}</h3>
          <p className="text-slate-500 text-xs truncate">{contact.phone_number}</p>
          
          {/* Tags */}
          {contact.tags?.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {contact.tags.slice(0, 2).map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                >
                  {tag}
                </span>
              ))}
              {contact.tags.length > 2 && (
                <span className="text-[10px] text-gray-400">
                  +{contact.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.contact.id === next.contact.id &&
    prev.isSelected === next.isSelected &&
    prev.contact.full_name === next.contact.full_name &&
    prev.contact.phone_number === next.contact.phone_number
);

ContactListItem.displayName = "ContactListItem";

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT LIST (with Infinite Scroll)
// ─────────────────────────────────────────────────────────────────────────────

const ContactList = ({
  contacts,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  selectedIds,
  onSelect,
  onView,
  emptyMessage = "No contacts found",
}) => {
  const listContainerRef = useRef(null);
  const loadMoreTriggerRef = useRef(null);
  const isLoadingRef = useRef(false);

  // Track loading state in ref
  useEffect(() => {
    isLoadingRef.current = isLoading || isLoadingMore;
  }, [isLoading, isLoadingMore]);

  // ═══════════════════════════════════════════════════════════════════════════
  // INFINITE SCROLL (IntersectionObserver)
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const trigger = loadMoreTriggerRef.current;
    const container = listContainerRef.current;
    if (!trigger || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting && hasMore && !isLoadingRef.current) {
          console.log("📜 Trigger visible, loading more...");
          onLoadMore();
        }
      },
      {
        root: container,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(trigger);

    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // Initial loading
  if (isLoading && contacts.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading contacts...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && contacts.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center py-12">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={listContainerRef}
      className="flex-grow overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 300px)" }}
    >
      {/* Contact Items */}
      {contacts.map((contact) => (
        <ContactListItem
          key={contact.id}
          contact={contact}
          isSelected={selectedIds.includes(contact.id)}
          onSelect={onSelect}
          onView={onView}
        />
      ))}

      {/* Infinite Scroll Trigger */}
      <div ref={loadMoreTriggerRef} className="h-4 w-full" aria-hidden="true" />

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-4 gap-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading more...</span>
        </div>
      )}

      {/* End of List */}
      {!hasMore && contacts.length > 10 && (
        <div className="text-center py-4 text-xs text-gray-400">
          — End of contacts —
        </div>
      )}
    </div>
  );
};

export default ContactList;