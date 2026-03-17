// ═══════════════════════════════════════════════════════════════════════════════
// src/hooks/usePinChat.js — Pin Chat Hook
// ═══════════════════════════════════════════════════════════════════════════════
//
// Custom hook for pin/unpin operations with optimistic updates.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../../../config";


const usePinChat = (onPinChange) => {
  const [isPinning, setIsPinning] = useState(false);
  const token = localStorage.getItem("authToken");
  const pendingRef = useRef(new Set());

  /**
   * Toggle pin status for a recipient.
   * Uses optimistic updates for instant UI feedback.
   * 
   * @param {string} recipient - Phone number to pin/unpin
   * @param {boolean} currentlyPinned - Current pin status
   * @returns {Promise<{success: boolean, is_pinned: boolean}>}
   */
  const togglePin = useCallback(
    async (recipient, currentlyPinned) => {
      if (!token || !recipient) {
        return { success: false, error: "Invalid request" };
      }

      // Prevent duplicate requests for same recipient
      if (pendingRef.current.has(recipient)) {
        return { success: false, error: "Request in progress" };
      }

      pendingRef.current.add(recipient);
      setIsPinning(true);

      // Optimistic update - notify parent immediately
      const newPinStatus = !currentlyPinned;
      onPinChange?.(recipient, newPinStatus, true); // isOptimistic = true

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/chats/pin/`,
          { recipient },
          { headers: { Authorization: `Token ${token}` } }
        );

        if (response.data.success) {
          // Confirm the change
          onPinChange?.(recipient, response.data.is_pinned, false);
          
          toast.success(
            response.data.is_pinned ? "Chat pinned 📌" : "Chat unpinned",
            { autoClose: 1500 }
          );

          return {
            success: true,
            is_pinned: response.data.is_pinned,
          };
        } else {
          // Revert optimistic update
          onPinChange?.(recipient, currentlyPinned, false);
          toast.error(response.data.error || "Failed to update pin");
          return { success: false, error: response.data.error };
        }
      } catch (error) {
        // Revert optimistic update
        onPinChange?.(recipient, currentlyPinned, false);

        const errorMsg = error.response?.data?.error || "Failed to toggle pin";
        toast.error(errorMsg);

        return { success: false, error: errorMsg };
      } finally {
        pendingRef.current.delete(recipient);
        setIsPinning(false);
      }
    },
    [token, onPinChange]
  );

  /**
   * Fetch list of all pinned recipients.
   * 
   * @returns {Promise<string[]>} Array of pinned recipient phone numbers
   */
  const fetchPinnedList = useCallback(async () => {
    if (!token) return [];

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/chats/pinned/`,
        { headers: { Authorization: `Token ${token}` } }
      );

      if (response.data.success) {
        return response.data.pinned || [];
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch pinned list:", error);
      return [];
    }
  }, [token]);

  return {
    togglePin,
    fetchPinnedList,
    isPinning,
  };
};

export default usePinChat;