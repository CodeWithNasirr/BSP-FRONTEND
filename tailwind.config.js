// tailwind.config.js — Drop-in replacement
// Adds: darkMode: 'class', custom colors, animation extensions

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  
  // ── DARK MODE — controlled by 'dark' class on <html> ──────────────────────
  darkMode: "class",

  theme: {
    extend: {
      colors: {
        // WhatsApp brand palette
        whatsapp: {
          green: "#25D366",
          mid: "#128C7E",
          dark: "#075E54",
          light: "#DCF8C6",
        },
        // Extended gray scale
        gray: {
          925: "#0d1117",
          950: "#030712",
        },
      },
      fontFamily: {
        sans: ["Inter var", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        node: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
        sidebar: "2px 0 8px -2px rgba(0,0,0,0.1)",
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 24px -4px rgba(0,0,0,0.08)",
        "green-glow": "0 4px 14px -3px rgba(37,211,102,0.4)",
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        pageEnter: "pageEnter 0.2s ease-out",
        scaleIn: "scaleIn 0.15s ease-out forwards",
        slideUp: "slideUp 0.2s ease-out forwards",
        slideDown: "slideDown 0.2s ease-out forwards",
        fadeIn: "fadeIn 0.2s ease-out forwards",
        flashHighlight: "flashHighlight 2s ease-out forwards",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pageEnter: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%":   { opacity: "0", transform: "translateY(-100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        flashHighlight: {
          "0%":   { backgroundColor: "rgb(254, 249, 195)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
    },
  },
  plugins: [],
};