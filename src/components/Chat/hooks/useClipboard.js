// ═══════════════════════════════════════════════════════════════════════════════
// src/hooks/useClipboard.js — Clipboard Hook
// ═══════════════════════════════════════════════════════════════════════════════
//
// Custom hook for clipboard operations:
// ✅ Fetch clipboard items
// ✅ Add new items
// ✅ Delete items
// ✅ Save messages to clipboard
// ✅ Optimistic updates
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "../../../config";

const useClipboard = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("authToken");
  const isMountedRef = useRef(true);

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH ITEMS
  // ═══════════════════════════════════════════════════════════════════════════

  const fetchItems = useCallback(
    async (options = {}) => {
      if (!token) return;

      const { type, category, search } = options;

      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (type) params.append("type", type);
        if (category) params.append("category", category);
        if (search) params.append("search", search);

        const response = await axios.get(
          `${API_BASE_URL}/api/clipboard/?${params.toString()}`,
          { headers: { Authorization: `Token ${token}` } }
        );

        if (isMountedRef.current && response.data.success) {
          setItems(response.data.items || []);
          setCategories(response.data.categories || []);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err.response?.data?.error || "Failed to fetch clipboard");
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [token]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD ITEM
  // ═══════════════════════════════════════════════════════════════════════════

  const addItem = useCallback(
    async ({ type = "text", content = "", file = null, category = "" }) => {
      if (!token) return { success: false, error: "Not authenticated" };

      try {
        const formData = new FormData();
        formData.append("item_type", type);
        formData.append("content", content);
        formData.append("category", category);

        if (file) {
          formData.append("file", file);
          formData.append("original_filename", file.name);
        }

        const response = await axios.post(
          `${API_BASE_URL}/api/clipboard/`,
          formData,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          // Optimistic update
          setItems((prev) => [response.data.item, ...prev]);

          // Add category if new
          if (category && !categories.includes(category)) {
            setCategories((prev) => [...prev, category]);
          }

          return { success: true, item: response.data.item };
        }

        return { success: false, error: "Unknown error" };
      } catch (err) {
        return {
          success: false,
          error: err.response?.data?.error || "Failed to add item",
        };
      }
    },
    [token, categories]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE ITEM
  // ═══════════════════════════════════════════════════════════════════════════

  const deleteItem = useCallback(
    async (itemId) => {
      if (!token) return { success: false, error: "Not authenticated" };

      try {
        // Optimistic update
        setItems((prev) => prev.filter((item) => item.id !== itemId));

        await axios.delete(`${API_BASE_URL}/api/clipboard/${itemId}/`, {
          headers: { Authorization: `Token ${token}` },
        });

        return { success: true };
      } catch (err) {
        // Revert on error
        fetchItems();
        return {
          success: false,
          error: err.response?.data?.error || "Failed to delete item",
        };
      }
    },
    [token, fetchItems]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE MESSAGE TO CLIPBOARD
  // ═══════════════════════════════════════════════════════════════════════════

  const saveMessage = useCallback(
    async (message, category = "") => {
      if (!token) return { success: false, error: "Not authenticated" };

      try {
        const payload = {
          text_content: message.text_content || "",
          media_url: message.media_url || "",
          media_type: message.media_type || "text",
          message_id: message.id || message.message_id,
          category,
        };

        const response = await axios.post(
          `${API_BASE_URL}/api/clipboard/save-message/`,
          payload,
          { headers: { Authorization: `Token ${token}` } }
        );

        if (response.data.success) {
          // Optimistic update
          setItems((prev) => [response.data.item, ...prev]);
          return { success: true, item: response.data.item };
        }

        return { success: false, error: "Unknown error" };
      } catch (err) {
        return {
          success: false,
          error: err.response?.data?.error || "Failed to save message",
        };
      }
    },
    [token]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // MARK AS USED
  // ═══════════════════════════════════════════════════════════════════════════

  const markAsUsed = useCallback(
    async (itemId) => {
      if (!token) return;

      try {
        await axios.post(
          `${API_BASE_URL}/api/clipboard/${itemId}/use/`,
          {},
          { headers: { Authorization: `Token ${token}` } }
        );

        // Update local state
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, use_count: (item.use_count || 0) + 1, last_used_at: new Date().toISOString() }
              : item
          )
        );
      } catch (err) {
        console.error("Failed to mark as used:", err);
      }
    },
    [token]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // BULK DELETE
  // ═══════════════════════════════════════════════════════════════════════════

  const bulkDelete = useCallback(
    async (itemIds) => {
      if (!token) return { success: false, error: "Not authenticated" };

      try {
        // Optimistic update
        setItems((prev) => prev.filter((item) => !itemIds.includes(item.id)));

        await axios.post(
          `${API_BASE_URL}/api/clipboard/bulk-delete/`,
          { ids: itemIds },
          { headers: { Authorization: `Token ${token}` } }
        );

        return { success: true };
      } catch (err) {
        // Revert on error
        fetchItems();
        return {
          success: false,
          error: err.response?.data?.error || "Failed to delete items",
        };
      }
    },
    [token, fetchItems]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    items,
    categories,
    isLoading,
    error,
    fetchItems,
    addItem,
    deleteItem,
    saveMessage,
    markAsUsed,
    bulkDelete,
  };
};

export default useClipboard;


// ═══════════════════════════════════════════════════════════════════════════════
// USAGE EXAMPLE
// ═══════════════════════════════════════════════════════════════════════════════
//
// const MyComponent = () => {
//   const {
//     items,
//     isLoading,
//     fetchItems,
//     addItem,
//     deleteItem,
//     saveMessage
//   } = useClipboard();
//
//   useEffect(() => {
//     fetchItems();
//   }, []);
//
//   const handleSaveMessage = async (msg) => {
//     const result = await saveMessage(msg);
//     if (result.success) {
//       toast.success("Saved!");
//     } else {
//       toast.error(result.error);
//     }
//   };
//
//   return (
//     <div>
//       {items.map(item => (
//         <ClipboardItem key={item.id} item={item} />
//       ))}
//     </div>
//   );
// };