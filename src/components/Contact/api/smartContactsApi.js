// ═══════════════════════════════════════════════════════════════════════════════
// contacts/api/smartContactsApi.js
// API layer for Smart Contact Management features
// Follows the exact same pattern as contactsApi.js
// ═══════════════════════════════════════════════════════════════════════════════

import axios from "axios";
import API_BASE_URL from "../../../config";

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
// STATS
// ─────────────────────────────────────────────────────────────────────────────

export const smartContactsApi = {
  /**
   * GET /api/contacts/stats/
   * Returns { total, new, exported, saved, added_today }
   */
  getStats: async (token) => {
    const client = createAuthClient(token);
    const response = await client.get("/api/contacts/stats/");
    return response.data;
  },

  /**
   * GET /api/contacts/smart/
   * Enhanced contact list with status filtering
   */
  getSmartContacts: async (
    token,
    { page = 1, search = "", status = "", date_from = "", date_to = "", page_size = 20 },
    signal
  ) => {
    const client = createAuthClient(token);
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("page_size", page_size.toString());
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    if (date_from) params.append("date_from", date_from);
    if (date_to) params.append("date_to", date_to);

    const response = await client.get(`/api/contacts/smart/?${params}`, { signal });
    return response.data;
  },

  /**
   * POST /api/contacts/export-vcf/
   * Returns VCF file as blob
   */
  exportVCF: async (token, { export_type, contact_ids, search, tags, date_from, date_to, export_status }) => {
    const client = createAuthClient(token);
    const payload = { export_type };

    if (contact_ids?.length) payload.contact_ids = contact_ids;
    if (search) payload.search = search;
    if (tags?.length) payload.tags = tags;
    if (date_from) payload.date_from = date_from;
    if (date_to) payload.date_to = date_to;
    if (export_status) payload.export_status = export_status;

    const response = await client.post("/api/contacts/export-vcf/", payload, {
      responseType: "blob",
    });

    // Extract metadata from headers
    const exportId = response.headers["x-export-id"];
    const contactCount = response.headers["x-contact-count"];
    const disposition = response.headers["content-disposition"] || "";
    const filenameMatch = disposition.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : "contacts.vcf";

    return {
      blob: response.data,
      filename,
      exportId,
      contactCount: parseInt(contactCount) || 0,
    };
  },

  /**
   * GET /api/contacts/export-history/
   */
  getExportHistory: async (token) => {
    const client = createAuthClient(token);
    const response = await client.get("/api/contacts/export-history/");
    return response.data;
  },

  /**
   * GET /api/contacts/export-history/:id/download/
   * Returns VCF file as blob
   */
  downloadExport: async (token, exportId) => {
    const client = createAuthClient(token);
    const response = await client.get(
      `/api/contacts/export-history/${exportId}/download/`,
      { responseType: "blob" }
    );

    const disposition = response.headers["content-disposition"] || "";
    const filenameMatch = disposition.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : `export_${exportId}.vcf`;

    return { blob: response.data, filename };
  },

  /**
   * PATCH /api/contacts/bulk-status/
   */
  bulkUpdateStatus: async (token, contactIds, newStatus) => {
    const client = createAuthClient(token);
    const response = await client.patch("/api/contacts/bulk-status/", {
      contact_ids: contactIds,
      status: newStatus,
    });
    return response.data;
  },

  /**
   * PATCH /api/contacts/bulk-tags/
   */
  bulkUpdateTags: async (token, contactIds, action, tags) => {
    const client = createAuthClient(token);
    const response = await client.patch("/api/contacts/bulk-tags/", {
      contact_ids: contactIds,
      action,
      tags,
    });
    return response.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD HELPER (triggers browser file download from blob)
// ─────────────────────────────────────────────────────────────────────────────

export const triggerFileDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default smartContactsApi;