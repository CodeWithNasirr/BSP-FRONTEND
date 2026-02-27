import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config";

// ═══════════════════════════════════════════════════════════════════════════════
// useReferral Hook
// ═══════════════════════════════════════════════════════════════════════════════
//
// Reads ?ref=CLIENT_ID from URL → fetches branding from API → caches in
// localStorage so the referral persists across page navigations and even
// browser refreshes (90-day TTL matching your affiliate cookie window).
//
// USAGE:
//   const { client, refCode, isLoading, isReferred } = useReferral();
//
// RETURNS:
//   client      — { name, phone, logo, theme_color, ... } or null
//   refCode     — the raw ref string ("shopEasy") or null
//   isLoading   — true while fetching
//   isReferred  — shorthand for !!client
//   clearRef    — call to manually clear stored referral
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = "nlk_referral";
const STORAGE_TTL = 90 * 24 * 60 * 60 * 1000; // 90 days in ms

// ── localStorage helpers ────────────────────────────────────────────────────

const saveToStorage = (refCode, clientData) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        refCode,
        client: clientData,
        savedAt: Date.now(),
      })
    );
  } catch {
    // localStorage full or blocked — fail silently
  }
};

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Expired?
    if (Date.now() - parsed.savedAt > STORAGE_TTL) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

// ── Hook ────────────────────────────────────────────────────────────────────

const useReferral = () => {
  const [searchParams] = useSearchParams();
  const urlRef = searchParams.get("ref");

  const [refCode, setRefCode] = useState(null);
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      // ── Priority 1: Fresh ref from URL ──────────────────────────────────
      if (urlRef) {
        setRefCode(urlRef);
        setIsLoading(true);

        try {
          const res = await axios.get(
            `${API_BASE_URL}/api/referral/${encodeURIComponent(urlRef)}/`
          );

          if (!cancelled && res.data) {
            const data = normalizeClient(res.data);
            setClient(data);
            saveToStorage(urlRef, data);
          }
        } catch (err) {
          console.warn("Referral fetch failed, trying fallback:", err.message);

          // Fallback: maybe we have it cached from a previous visit
          const cached = loadFromStorage();
          if (!cancelled && cached?.refCode === urlRef) {
            setClient(cached.client);
          }
        } finally {
          if (!cancelled) setIsLoading(false);
        }
        return;
      }

      // ── Priority 2: Cached referral (no ?ref= in URL) ──────────────────
      const cached = loadFromStorage();
      if (cached) {
        setRefCode(cached.refCode);
        setClient(cached.client);
      }

      if (!cancelled) setIsLoading(false);
    };

    resolve();

    return () => {
      cancelled = true;
    };
  }, [urlRef]);

  const clearRef = useCallback(() => {
    clearStorage();
    setRefCode(null);
    setClient(null);
  }, []);

  return {
    client,
    refCode,
    isLoading,
    isReferred: !!client,
    clearRef,
  };
};

// ── Normalize whatever shape the API returns ────────────────────────────────

function normalizeClient(raw) {
  // Accept both flat and nested { data: { ... } } responses
  const d = raw.data || raw;

  return {
    id: d.id || d.affiliate_id || null,
    name: d.name || d.business_name || d.brand_name || "",
    phone: d.phone || d.whatsapp_number || d.contact_phone || "",
    logo: d.logo || d.logo_url || "",
    theme_color: d.theme_color || d.brand_color || "",
    tagline: d.tagline || d.description || "",
    website: d.website || "",
    // Keep the raw data in case components need extra fields
    _raw: d,
  };
}

export default useReferral;
export { STORAGE_KEY, clearStorage, loadFromStorage };