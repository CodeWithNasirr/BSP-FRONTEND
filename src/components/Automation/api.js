import axios from "axios";
import API_BASE_URL from "../../config";

// All automation endpoints (Phases 2–6), Token-authenticated like the rest of the app.
const authHeader = () => ({
  Authorization: `Token ${localStorage.getItem("authToken")}`,
});

const base = API_BASE_URL;

export const automationApi = {
  // Monitoring
  overview: () => axios.get(`${base}/api/automation/overview/`, { headers: authHeader() }),
  alerts: (unreadOnly = false) =>
    axios.get(`${base}/api/automation/alerts/${unreadOnly ? "?unread=1" : ""}`, {
      headers: authHeader(),
    }),
  markAlertRead: (id) =>
    axios.post(`${base}/api/automation/alerts/${id}/read/`, {}, { headers: authHeader() }),
  markAllAlertsRead: () =>
    axios.post(`${base}/api/automation/alerts/read-all/`, {}, { headers: authHeader() }),

  // Per-campaign control
  status: (cid) =>
    axios.get(`${base}/api/campaigns/${cid}/automation/status/`, { headers: authHeader() }),
  getConfig: (cid) =>
    axios.get(`${base}/api/campaigns/${cid}/automation/config/`, { headers: authHeader() }),
  updateConfig: (cid, body) =>
    axios.put(`${base}/api/campaigns/${cid}/automation/config/`, body, { headers: authHeader() }),
  control: (cid, action) =>
    axios.post(`${base}/api/campaigns/${cid}/automation/control/`, { action }, { headers: authHeader() }),
  batch: (cid) =>
    axios.get(`${base}/api/campaigns/${cid}/automation/batch/`, { headers: authHeader() }),
  audit: (cid, limit = 100) =>
    axios.get(`${base}/api/campaigns/${cid}/automation/audit/?limit=${limit}`, {
      headers: authHeader(),
    }),

  // Create + start an automated campaign from a contact pool
  createCampaign: (body) =>
    axios.post(`${base}/api/automation/campaigns/`, body, { headers: authHeader() }),
  poolPreview: (params) =>
    axios.get(`${base}/api/automation/pool-preview/`, { params, headers: authHeader() }),

  // Upload header media (image/video/document) for a media template → returns a URL
  uploadMedia: (file) => {
    const fd = new FormData();
    fd.append("media_file", file);
    return axios.post(`${base}/api/automation/upload-media/`, fd, { headers: authHeader() });
  },

  // Supporting data
  templates: () =>
    axios.get(`${base}/api/whatsapp/templates/`, { headers: authHeader() }),
  segments: () =>
    axios.get(`${base}/api/segments/`, { headers: authHeader() }),
  groups: () =>
    axios.get(`${base}/api/add-group/`, { headers: authHeader() }),
  overrideContact: (contactId, override, reason = "") =>
    axios.post(
      `${base}/api/contacts/${contactId}/intelligence/override/`,
      { override, reason },
      { headers: authHeader() }
    ),
};

export default automationApi;
