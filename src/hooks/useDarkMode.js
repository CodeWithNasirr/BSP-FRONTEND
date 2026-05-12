// ─────────────────────────────────────────────────────────────────────────────
// useDarkMode.js — Dark mode hook
// Place in: src/hooks/useDarkMode.js
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, setDark];
}

// ─────────────────────────────────────────────────────────────────────────────
// DarkModeToggle.jsx — Drop anywhere in your UI
// ─────────────────────────────────────────────────────────────────────────────
// import { useDarkMode } from "../../hooks/useDarkMode";
// const [dark, setDark] = useDarkMode();
// <button onClick={() => setDark(!dark)}>
//   {dark ? <Sun size={16} /> : <Moon size={16} />}
// </button>