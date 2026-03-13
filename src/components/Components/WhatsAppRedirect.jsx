/**
 * WhatsAppRedirect.jsx — v2 (In-App Browser Compatible)
 * ═════════════════════════════════════════════════════════
 *
 * WHY THE OLD VERSION FAILED IN META IN-APP BROWSERS:
 * ────────────────────────────────────────────────────
 * Old: React → window.location = Django URL → Django 302 → wa.me → WhatsApp
 *      = 3 hops. Meta WebView kills chains after 1-2 redirects.
 *
 * NEW ARCHITECTURE:
 * ────────────────
 * 1. React fetches JSON from /w/:slug/ (phone + message + deep link)
 * 2. React fires whatsapp:// deep link directly from the page
 * 3. Single hop: page → WhatsApp. No 302 chain.
 *
 * DEEP LINK STRATEGY (browser-aware):
 * ────────────────────────────────────
 * Instagram/Facebook in-app → whatsapp://send (deep link)
 * Android Chrome             → intent://send#Intent;scheme=whatsapp (Android Intent)
 * iOS Safari                 → whatsapp://send, fallback to wa.me universal link
 * Desktop                    → wa.me universal link (WhatsApp Web/Desktop)
 *
 * META ADS COMPLIANCE:
 * ────────────────────
 * Page shows visible UI (heading, business name, button) so Meta's
 * crawler sees real content. A blank page that just redirects = ad rejected.
 *
 * ROUTE:
 *   <Route path="/c/:slug" element={<WhatsAppRedirect />} />
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import API_BASE_URL from "../../config";

// ═══════════════════════════════════════════════════════════════════════════
// BROWSER DETECTION — determines which link strategy to use
// ═══════════════════════════════════════════════════════════════════════════

function detectEnvironment() {
  const ua = navigator.userAgent || "";
  const uaLower = ua.toLowerCase();

  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  // Meta in-app browsers inject these strings into the UA
  const isFacebookApp = /fban|fbav/i.test(ua);
  const isInstagramApp = /instagram/i.test(ua);
  const isMetaInApp = isFacebookApp || isInstagramApp;

  // Other in-app browsers
  const isLineApp = /\bline\b/i.test(ua);
  const isTelegramApp = /telegram/i.test(uaLower);

  const isMobile = isAndroid || isIOS;
  const isDesktop = !isMobile;

  return {
    isAndroid,
    isIOS,
    isMobile,
    isDesktop,
    isMetaInApp,
    isFacebookApp,
    isInstagramApp,
    isLineApp,
    isTelegramApp,
    isInAppBrowser: isMetaInApp || isLineApp || isTelegramApp,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEEP LINK LAUNCHER — fires the right link for each browser
// ═══════════════════════════════════════════════════════════════════════════

function launchWhatsApp(linkData, env) {
  const { deep_link, fallback_link, intent_link } = linkData;

  /**
   * STRATEGY BY BROWSER:
   *
   * Meta in-app (iOS):
   *   whatsapp://send → iOS handles this as a universal link scheme.
   *   In-app browsers DO support custom URL schemes for installed apps.
   *   If WhatsApp isn't installed, nothing happens → user sees fallback button.
   *
   * Meta in-app (Android):
   *   intent://send#Intent;scheme=whatsapp;package=com.whatsapp;end;
   *   Android Intent URLs work inside all WebViews including Meta's.
   *   Falls back gracefully if WhatsApp isn't installed.
   *
   * Regular mobile browser (Chrome/Safari):
   *   whatsapp://send → works natively.
   *   If it doesn't open in 1.5s, swap to wa.me universal link.
   *
   * Desktop:
   *   wa.me universal link → opens WhatsApp Web or Desktop app.
   *   Deep links don't work on desktop browsers.
   */

  if (env.isDesktop) {
    // Desktop: universal link is the only reliable option
    window.location.href = fallback_link;
    return { method: "universal_link" };
  }

  // if (env.isMetaInApp && env.isAndroid) {
  //   // Android + Meta in-app: intent:// is the most reliable
  //   window.location.href = intent_link;
  //   return { method: "android_intent" };
  // }

   // Android devices
  if (env.isAndroid) {

    // Instagram / Facebook in-app browser
    if (env.isMetaInApp) {
      window.location.href = intent_link;

      // Fallback if intent fails
      setTimeout(() => {
        window.location.href = fallback_link;
      }, 1200);

      return { method: "android_meta_intent" };
    }

    // Regular Android browser
    window.location.href = intent_link;

    setTimeout(() => {
      window.location.href = fallback_link;
    }, 1200);

    return { method: "android_intent" };
  }

  // if (env.isMetaInApp && env.isIOS) {
  //   // iOS + Meta in-app: deep link scheme
  //   window.location.href = deep_link;
  //   return { method: "ios_deep_link" };
  // }

  // if (env.isAndroid) {
  //   // Regular Android browser: intent:// with fallback
  //   window.location.href = intent_link;
  //   return { method: "android_intent" };
  // }

  // // iOS regular browser or other: try deep link
  // window.location.href = deep_link;
  // return { method: "deep_link" };
  // iOS devices
  if (env.isIOS) {

    window.location.href = deep_link;

    setTimeout(() => {
      window.location.href = fallback_link;
    }, 1200);

    return { method: "ios_deep_link" };
  }

  // Final fallback
  window.location.href = fallback_link;
  return { method: "universal_link" };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function WhatsAppRedirect() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const customMsg = searchParams.get("msg") || "";

  // ── State ──────────────────────────────────────────────────────────
  const [status, setStatus] = useState("loading");
  // loading → connecting → launched → fallback → error
  const [linkData, setLinkData] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [env] = useState(() => detectEnvironment());

  const launchAttempted = useRef(false);
  const fallbackTimer = useRef(null);

  // ── Fetch link data from JSON API ──────────────────────────────────
  useEffect(() => {
    if (!slug) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        const msgParam = customMsg ? `?msg=${encodeURIComponent(customMsg)}` : "";
        const res = await fetch(`${API_BASE_URL}/w/${slug}/${msgParam}`);

        if (cancelled) return;

        if (!res.ok) {
          setStatus("error");
          return;
        }

        const data = await res.json();

        if (data.error) {
          setStatus("error");
          return;
        }

        setLinkData(data);
        setBusinessName(data.business_name || "");
        setStatus("connecting");
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [slug, customMsg]);

  // ── Auto-launch deep link once data is ready ───────────────────────
  useEffect(() => {
    if (status !== "connecting" || !linkData || launchAttempted.current) return;

    // Small delay for UI to render (Meta crawler needs to see content)
    const launchDelay = setTimeout(() => {
      if (launchAttempted.current) return;
      launchAttempted.current = true;

      launchWhatsApp(linkData, env);
      setStatus("launched");

      // If we're still on this page after 2.5s, show fallback button
      // (means WhatsApp didn't open — not installed, or blocked)
      fallbackTimer.current = setTimeout(() => {
        setStatus("fallback");
      }, 2500);
    }, 300); // 300ms — enough for Meta's crawler to parse content

    return () => {
      clearTimeout(launchDelay);
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, [status, linkData, env]);

  // ── Cleanup on unmount (navigating away = success) ─────────────────
  useEffect(() => {
    return () => {
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, []);

  // ── Manual button click ────────────────────────────────────────────
  const handleManualOpen = useCallback(() => {
    if (!linkData) return;

    // On manual tap, try deep link first, then immediate fallback
    const result = launchWhatsApp(linkData, env);

    // Also set a faster fallback for manual clicks
    setTimeout(() => {
      // If still here, try the universal link
      window.location.href = linkData.fallback_link;
    }, 1500);
  }, [linkData, env]);

  // ── Open in external browser (escapes in-app browser) ──────────────
  const handleOpenExternal = useCallback(() => {
    if (!linkData) return;
    // This forces the system browser to open, escaping the WebView
    // window.open(linkData.fallback_link, "_system");
      window.location.href = linkData.fallback_link;
  }, [linkData]);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <>
      <link rel="preconnect" href={API_BASE_URL} />
      <style>{styles}</style>

      <div className="wr-page">
        <div className="wr-bg" aria-hidden="true" />

        <div className="wr-card">
          {/* ── WhatsApp Icon ── */}
          <div className={`wr-icon ${status === "fallback" || status === "error" ? "" : "wr-icon-pulse"}`}>
            {status === "error" ? (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            )}
          </div>

          {/* ── Business name badge ── */}
          {businessName && status !== "error" && (
            <div className="wr-badge">{businessName}</div>
          )}

          {/* ── Status content ── */}
          {status === "loading" && (
            <div className="wr-content wr-fade">
              <h1 className="wr-title">Loading…</h1>
              <p className="wr-sub">Preparing your WhatsApp chat</p>
              <Spinner />
            </div>
          )}

          {status === "connecting" && (
            <div className="wr-content wr-fade">
              <h1 className="wr-title">Connecting to WhatsApp</h1>
              <p className="wr-sub">Opening chat{businessName ? ` with ${businessName}` : ""}…</p>
              <Spinner />
            </div>
          )}

          {status === "launched" && (
            <div className="wr-content wr-fade">
              <h1 className="wr-title">Opening WhatsApp</h1>
              <p className="wr-sub">If nothing happens, tap the button below</p>
              <Spinner />
            </div>
          )}

          {status === "fallback" && (
            <div className="wr-content wr-fade">
              <h1 className="wr-title">Almost there!</h1>
              <p className="wr-sub">Tap the button below to start chatting</p>
            </div>
          )}

          {status === "error" && (
            <div className="wr-content wr-fade">
              <h1 className="wr-title">Link Unavailable</h1>
              <p className="wr-sub">This chat link is currently inactive</p>
            </div>
          )}

          {/* ── Primary CTA button ── */}
          {linkData && status !== "error" && (
            <button className="wr-btn wr-btn-primary" onClick={handleManualOpen}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Open WhatsApp
            </button>
          )}

          {/* ── Secondary: open in external browser (Meta in-app only) ── */}
          {linkData && env.isInAppBrowser && (status === "fallback" || status === "launched") && (
            <button className="wr-btn wr-btn-secondary" onClick={handleOpenExternal}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open in browser instead
            </button>
          )}

          {/* ── Trust signal ── */}
          <div className="wr-trust">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Secure · End-to-end encrypted
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="wr-footer">
          Powered by <strong>WhatsAppGPTX</strong>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SPINNER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function Spinner() {
  return (
    <div className="wr-spinner" aria-label="Loading">
      <div className="wr-dot" />
      <div className="wr-dot" />
      <div className="wr-dot" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES — embedded (zero external CSS request)
// ═══════════════════════════════════════════════════════════════════════════

const styles = `
  .wr-page *, .wr-page *::before, .wr-page *::after {
    margin: 0; padding: 0; box-sizing: border-box;
  }

  .wr-page {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #E8ECF0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }

  .wr-bg {
    position: absolute;
    inset: 0;
    opacity: 0.02;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23075E54'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }

  /* ── Card ── */
  .wr-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 92%;
    max-width: 380px;
    padding: 36px 24px 28px;
    background: white;
    border-radius: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.08);
    animation: wr-enter 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes wr-enter {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ── Icon ── */
  .wr-icon {
    width: 84px;
    height: 84px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: linear-gradient(145deg, #E8FFF3, #D4F5E2);
    margin-bottom: 20px;
    position: relative;
  }

  .wr-icon-pulse {
    animation: wr-pulse 2s ease-in-out infinite;
  }

  .wr-icon-pulse::after {
    content: '';
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    border: 2px solid #25D366;
    opacity: 0;
    animation: wr-ring 2s ease-out infinite;
  }

  @keyframes wr-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  }

  @keyframes wr-ring {
    0% { transform: scale(0.96); opacity: 0.5; }
    100% { transform: scale(1.12); opacity: 0; }
  }

  /* ── Badge (business name) ── */
  .wr-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    margin-bottom: 16px;
    background: #F0F2F5;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 600;
    color: #075E54;
    letter-spacing: 0.2px;
  }

  /* ── Content ── */
  .wr-content { text-align: center; margin-bottom: 4px; }

  .wr-title {
    font-size: 19px;
    font-weight: 700;
    color: #1A1A1A;
    letter-spacing: -0.3px;
    line-height: 1.3;
    margin-bottom: 4px;
  }

  .wr-sub {
    font-size: 13.5px;
    color: #8696A0;
    line-height: 1.45;
  }

  .wr-fade {
    animation: wr-fadein 0.35s ease both;
  }

  @keyframes wr-fadein {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Spinner ── */
  .wr-spinner {
    display: flex;
    gap: 5px;
    justify-content: center;
    padding: 14px 0 4px;
  }

  .wr-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #25D366;
    animation: wr-bounce 1.4s ease-in-out infinite both;
  }

  .wr-dot:nth-child(1) { animation-delay: -0.32s; }
  .wr-dot:nth-child(2) { animation-delay: -0.16s; }
  .wr-dot:nth-child(3) { animation-delay: 0s; }

  @keyframes wr-bounce {
    0%, 80%, 100% { transform: scale(0.5); opacity: 0.35; }
    40% { transform: scale(1); opacity: 1; }
  }

  /* ── Buttons ── */
  .wr-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    border: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.15s ease;
    font-family: inherit;
  }

  .wr-btn-primary {
    padding: 14px 24px;
    margin-top: 18px;
    background: #25D366;
    color: white;
    font-size: 15.5px;
    font-weight: 600;
    letter-spacing: 0.2px;
    border-radius: 14px;
    box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);
  }

  .wr-btn-primary:hover {
    background: #22C35E;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(37, 211, 102, 0.35);
  }

  .wr-btn-primary:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(37, 211, 102, 0.25);
  }

  .wr-btn-secondary {
    padding: 10px 16px;
    margin-top: 10px;
    background: transparent;
    color: #8696A0;
    font-size: 12.5px;
    font-weight: 500;
    border-radius: 10px;
  }

  .wr-btn-secondary:hover {
    background: #F0F2F5;
    color: #667781;
  }

  /* ── Trust ── */
  .wr-trust {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 14px;
    font-size: 10.5px;
    color: #8696A0;
    letter-spacing: 0.3px;
  }

  .wr-trust svg { color: #25D366; }

  /* ── Footer ── */
  .wr-footer {
    position: absolute;
    bottom: 18px;
    font-size: 10.5px;
    color: #8696A0;
  }

  .wr-footer strong {
    color: #128C7E;
    font-weight: 600;
  }

  /* ── Responsive ── */
  @media (max-width: 380px) {
    .wr-card { padding: 28px 18px 24px; border-radius: 20px; }
    .wr-title { font-size: 17px; }
    .wr-icon { width: 72px; height: 72px; margin-bottom: 16px; }
    .wr-icon svg { width: 40px; height: 40px; }
  }

  @media (min-width: 600px) {
    .wr-card { padding: 44px 32px 32px; max-width: 420px; }
    .wr-title { font-size: 21px; }
    .wr-sub { font-size: 14.5px; }
  }
`;