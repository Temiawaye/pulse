"use client";

import { useEffect } from "react";

export function ThemeController() {
  useEffect(() => {
    const saved = localStorage.getItem("pulse-theme") ?? "system";
    const dark = saved === "dark" || (saved === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("light", !dark);
  }, []);
  return null;
}
