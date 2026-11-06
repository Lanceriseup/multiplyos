"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemeChoice = "system" | "light" | "dark";
const KEY = "mos_admin_theme";

/**
 * Light/dark choice for the admin pages. Light is the default for everyone,
 * whatever the computer's own setting; "dark" and "system" (follow the OS) are
 * opt-in. Only the theme is kept in the browser; no report data is.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeChoice>("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "dark" || saved === "system") setThemeState(saved);
    } catch {
      // storage blocked: stay light
    }
  }, []);

  const setTheme = useCallback((next: ThemeChoice) => {
    setThemeState(next);
    try {
      if (next === "light") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      // not remembered, still applied
    }
  }, []);

  /** Cycles light → dark → system → light. */
  const cycleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
  }, [theme, setTheme]);

  return {
    theme,
    setTheme,
    cycleTheme,
    themeAttr: theme === "system" ? undefined : theme,
  };
}
