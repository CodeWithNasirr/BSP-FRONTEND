// ═══════════════════════════════════════════════════════════════════════════════
// contacts/api/contactsApi.js
// Centralized API layer - Single source of truth for all contact-related API calls
// ═══════════════════════════════════════════════════════════════════════════════

import axios from "axios";
import API_BASE_URL from "../../../config";

/**
 * Creates an axios instance with auth headers
 */
const createAuthClient = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTACTS API
// ─────────────────────────────────────────────────────────────────────────────

export const contactsApi = {
  /**
   * Fetch paginated contacts with filters
   */
  getContacts: async (token, { page = 1, search = "", segment = "", group = "" }, signal) => {
    const client = createAuthClient(token);
    const params = new URLSearchParams({
      page: page.toString(),
      search,
      segment,
      group,
    });
    
    const response = await client.get(`/api/contacts/?${params}`, { signal });
    return response.data;
  },

  /**
   * Create a new contact
   */
  createContact: async (token, contactData) => {
    const client = createAuthClient(token);
    
    // Normalize data
    const payload = {
      full_name: `${contactData.firstName} ${contactData.lastName}`.trim(),
      phone_number: contactData.phone_number,
      email: contactData.email || null,
      group_name: contactData.group_name || null,
      location: contactData.location || null,
      tags: contactData.tags || "",
      total_purchases: contactData.total_purchases || 0,
      total_spent: contactData.total_spent || 0,
    };

    // Filter out empty values
    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => 
        typeof value === "string" ? value.trim() !== "" : value != null
      )
    );

    const response = await client.post("/api/contacts/", filteredPayload);
    return response.data;
  },

  /**
   * Update an existing contact
   */
  updateContact: async (token, contactId, contactData) => {
    const client = createAuthClient(token);
    
    const payload = {
      full_name: `${contactData.firstName} ${contactData.lastName}`.trim(),
      phone_number: contactData.phone_number,
      email: contactData.email || null,
      group_name: contactData.group_name || null,
      location: contactData.location || null,
      tags: contactData.tags || "",
      total_purchases: contactData.total_purchases || 0,
      total_spent: contactData.total_spent || 0,
    };

    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => 
        typeof value === "string" ? value.trim() !== "" : value != null
      )
    );

    const response = await client.put(`/api/contacts/${contactId}/`, filteredPayload);
    return response.data;
  },

  /**
   * Delete contacts (supports bulk delete)
   */
  deleteContacts: async (token, contactIds) => {
    const client = createAuthClient(token);
    const response = await client.delete("/api/delete-contact/", {
      data: { contact_id: Array.isArray(contactIds) ? contactIds : [contactIds] },
    });
    return response.data;
  },

  /**
   * Add contact to a group
   */
  addToGroup: async (token, contactId, groupId) => {
    const client = createAuthClient(token);
    const response = await client.post("/api/add-contact-to-group/", {
      contact_id: contactId,
      group_id: groupId,
    });
    return response.data;
  },

  /**
   * Remove contact from a group
   */
  removeFromGroup: async (token, contactId, groupId) => {
    const client = createAuthClient(token);
    const response = await client.post("/api/remove-contact-from-group/", {
      contact_id: contactId,
      group_id: groupId,
    });
    return response.data;
  },

  /**
   * Get available tags
   */
  getTags: async (token) => {
    const client = createAuthClient(token);
    const response = await client.get("/api/contacts/tags/");
    return response.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// GROUPS API
// ─────────────────────────────────────────────────────────────────────────────

export const groupsApi = {
  /**
   * Get all groups
   */
  getGroups: async (token) => {
    const client = createAuthClient(token);
    const response = await client.get("/api/add-group/");
    return response.data;
  },

  /**
   * Create a new group
   */
  createGroup: async (token, groupName) => {
    const client = createAuthClient(token);
    const response = await client.post("/api/add-group/", { group_name: groupName });
    return response.data;
  },

  /**
   * Delete a group
   */
  deleteGroup: async (token, groupId) => {
    const client = createAuthClient(token);
    const response = await client.delete("/api/add-group/", {
      data: { group_id: groupId },
    });
    return response.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SEGMENTS API
// ─────────────────────────────────────────────────────────────────────────────

export const segmentsApi = {
  /**
   * Get all segments
   */
  getSegments: async (token) => {
    const client = createAuthClient(token);
    const response = await client.get("/api/segments/");
    return response.data;
  },
};

export default { contactsApi, groupsApi, segmentsApi };