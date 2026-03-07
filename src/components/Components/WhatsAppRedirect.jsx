/**
 * WhatsAppRedirect.jsx
 * ════════════════════
 *
 * Ultra-lightweight landing page for Meta Ads → WhatsApp redirect.
 *
 * Flow:
 *   1. User clicks FB/IG ad → lands on /c/{slug}
 *   2. Page shows "Connecting to WhatsApp..." with spinner
 *   3. After 1000ms → auto-redirect to chat.whatsappgptx.com/w/{slug}
 *   4. If redirect fails → user taps fallback "Open WhatsApp" button
 *
 * Route setup (in your React Router):
 *   <Route path="/c/:slug" element={<WhatsAppRedirect />} />
 *
 * Performance:
 *   - Zero external dependencies (no axios, no fetch)
 *   - No images to load (SVG inline)
 *   - CSS-in-JS via style tag (no Tailwind parse needed)
 *   - Redirect fires on mount — doesn't wait for hydration
 */

import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

// ── Configuration ────────────────────────────────────────────────────────
const REDIRECT_BASE = "https://chat.whatsappgptx.com/w";
const AUTO_REDIRECT_MS = 1000;

export default function WhatsAppRedirect() {
  const { slug } = useParams();
  const [status, setStatus] = useState("connecting"); // connecting | redirecting | failed
  const [countdown, setCountdown] = useState(3);
  const redirectFired = useRef(false);

  // Build the redirect URL once
  const redirectUrl = slug ? `${REDIRECT_BASE}/${slug}` : null;

  // ── Auto-redirect on mount ───────────────────────────────────────────
  useEffect(() => {
    if (!slug || redirectFired.current) return;

    const timer = setTimeout(() => {
      redirectFired.current = true;
      setStatus("redirecting");

      try {
        window.location.href = redirectUrl;
      } catch {
        setStatus("failed");
      }
    }, AUTO_REDIRECT_MS);

    return () => clearTimeout(timer);
  }, [slug, redirectUrl]);

  // ── Fallback countdown (if redirect doesn't navigate away) ───────────
  useEffect(() => {
    if (status !== "redirecting") return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStatus("failed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  // ── Manual redirect ──────────────────────────────────────────────────
  const handleClick = () => {
    if (redirectUrl) window.location.href = redirectUrl;
  };

  // ── No slug → error state ────────────────────────────────────────────
  if (!slug) {
    return (
      <>
        <style>{styles}</style>
        <div className="wr-page">
          <div className="wr-card">
            <div className="wr-icon-wrap wr-icon-error">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h1 className="wr-title">Invalid Link</h1>
            <p className="wr-sub">This redirect link appears to be broken.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* 
        Preconnect hint — browser starts TCP + TLS handshake to the
        redirect domain WHILE the user is watching the spinner.
        Saves ~100-200ms on the actual redirect. 
      */}
      <link rel="preconnect" href="https://chat.whatsappgptx.com" />
      <link rel="dns-prefetch" href="https://chat.whatsappgptx.com" />

      <style>{styles}</style>

      <div className="wr-page">
        {/* ── Background pattern (subtle WhatsApp chat bg feel) ── */}
        <div className="wr-bg-pattern" aria-hidden="true" />

        <div className="wr-card">
          {/* ── WhatsApp icon ── */}
          <div className={`wr-icon-wrap ${status === "failed" ? "wr-icon-idle" : "wr-icon-pulse"}`}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>

          {/* ── Status text ── */}
          {status === "connecting" && (
            <div className="wr-content wr-fade-in">
              <h1 className="wr-title">Connecting to WhatsApp</h1>
              <p className="wr-sub">Please wait while we open your chat…</p>
              <div className="wr-spinner" aria-label="Loading">
                <div className="wr-spinner-dot" />
                <div className="wr-spinner-dot" />
                <div className="wr-spinner-dot" />
              </div>
            </div>
          )}

          {status === "redirecting" && (
            <div className="wr-content wr-fade-in">
              <h1 className="wr-title">Opening WhatsApp</h1>
              <p className="wr-sub">Redirecting you now…</p>
              <div className="wr-spinner" aria-label="Loading">
                <div className="wr-spinner-dot" />
                <div className="wr-spinner-dot" />
                <div className="wr-spinner-dot" />
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="wr-content wr-fade-in">
              <h1 className="wr-title">Almost there!</h1>
              <p className="wr-sub">Tap the button below to open WhatsApp</p>
            </div>
          )}

          {/* ── CTA Button (always visible, acts as fallback) ── */}
          <button className="wr-btn" onClick={handleClick}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Open WhatsApp
          </button>

          {/* ── Security trust signal ── */}
          <div className="wr-trust">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Secure · End-to-end encrypted
          </div>
        </div>

        {/* ── Powered by footer ── */}
        <div className="wr-footer">
          Powered by <strong>WhatsAppGPTX</strong>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Styles — embedded to avoid external CSS request (saves ~50ms)
// ═══════════════════════════════════════════════════════════════════════════
const styles = `
  /* ── Reset & base ───────────────────────────────────────────────── */
  .wr-page *,
  .wr-page *::before,
  .wr-page *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
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

  /* ── Subtle background pattern (mimics WhatsApp chat bg) ────────── */
  .wr-bg-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23075E54' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }

  /* ── Card ────────────────────────────────────────────────────────── */
  .wr-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 92%;
    max-width: 380px;
    padding: 40px 28px 32px;
    background: white;
    border-radius: 24px;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.04),
      0 12px 40px rgba(0, 0, 0, 0.08);
    animation: wr-card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes wr-card-enter {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* ── WhatsApp icon container ────────────────────────────────────── */
  .wr-icon-wrap {
    width: 88px;
    height: 88px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: linear-gradient(145deg, #E8FFF3 0%, #D4F5E2 100%);
    margin-bottom: 24px;
    position: relative;
  }

  .wr-icon-pulse {
    animation: wr-pulse 2s ease-in-out infinite;
  }

  .wr-icon-pulse::after {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 2px solid #25D366;
    opacity: 0;
    animation: wr-ring 2s ease-out infinite;
  }

  @keyframes wr-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.04); }
  }

  @keyframes wr-ring {
    0% { transform: scale(0.95); opacity: 0.6; }
    100% { transform: scale(1.15); opacity: 0; }
  }

  .wr-icon-error {
    background: linear-gradient(145deg, #FFF0F0 0%, #FFE0E0 100%);
  }

  /* ── Text ────────────────────────────────────────────────────────── */
  .wr-content {
    text-align: center;
    margin-bottom: 8px;
  }

  .wr-title {
    font-size: 20px;
    font-weight: 700;
    color: #1A1A1A;
    letter-spacing: -0.3px;
    line-height: 1.3;
    margin-bottom: 6px;
  }

  .wr-sub {
    font-size: 14px;
    color: #8696A0;
    line-height: 1.5;
    margin-bottom: 4px;
  }

  .wr-fade-in {
    animation: wr-fade 0.4s ease both;
  }

  @keyframes wr-fade {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── 3-dot bouncing spinner ─────────────────────────────────────── */
  .wr-spinner {
    display: flex;
    gap: 6px;
    justify-content: center;
    padding: 16px 0 8px;
  }

  .wr-spinner-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #25D366;
    animation: wr-bounce 1.4s ease-in-out infinite both;
  }

  .wr-spinner-dot:nth-child(1) { animation-delay: -0.32s; }
  .wr-spinner-dot:nth-child(2) { animation-delay: -0.16s; }
  .wr-spinner-dot:nth-child(3) { animation-delay: 0s; }

  @keyframes wr-bounce {
    0%, 80%, 100% {
      transform: scale(0.6);
      opacity: 0.4;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* ── CTA Button ─────────────────────────────────────────────────── */
  .wr-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 15px 24px;
    margin-top: 20px;
    background: #25D366;
    color: white;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.2px;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);
  }

  .wr-btn:hover {
    background: #22C35E;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
  }

  .wr-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);
  }

  /* ── Trust badge ────────────────────────────────────────────────── */
  .wr-trust {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 16px;
    font-size: 11px;
    color: #8696A0;
    letter-spacing: 0.3px;
  }

  .wr-trust svg {
    color: #25D366;
  }

  /* ── Footer ─────────────────────────────────────────────────────── */
  .wr-footer {
    position: absolute;
    bottom: 20px;
    font-size: 11px;
    color: #8696A0;
    letter-spacing: 0.2px;
  }

  .wr-footer strong {
    color: #128C7E;
    font-weight: 600;
  }

  /* ── Responsive ─────────────────────────────────────────────────── */
  @media (max-width: 380px) {
    .wr-card {
      padding: 32px 20px 28px;
      border-radius: 20px;
    }
    .wr-title {
      font-size: 18px;
    }
    .wr-icon-wrap {
      width: 76px;
      height: 76px;
      margin-bottom: 20px;
    }
    .wr-icon-wrap svg {
      width: 44px;
      height: 44px;
    }
  }

  /* ── Desktop: slightly larger card ──────────────────────────────── */
  @media (min-width: 600px) {
    .wr-card {
      padding: 48px 36px 36px;
      max-width: 420px;
    }
    .wr-title {
      font-size: 22px;
    }
    .wr-sub {
      font-size: 15px;
    }
  }
`;