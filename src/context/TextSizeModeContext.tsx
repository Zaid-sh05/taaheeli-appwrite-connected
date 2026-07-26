import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { TextSizeMode } from "@/tokens/a11y";

interface TextSizeModeValue {
  mode: TextSizeMode;
  setMode: (mode: TextSizeMode) => void;
}

const TextSizeModeContext = createContext<TextSizeModeValue | undefined>(undefined);
const STORAGE_KEY = "taaheeli-text-size";

export function TextSizeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<TextSizeMode>(() => {
    if (typeof window === "undefined") return "standard";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "large" || stored === "xl" ? stored : "standard";
  });

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-text-size", mode);
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo<TextSizeModeValue>(
    () => ({ mode, setMode: setModeState }),
    [mode],
  );

  return <TextSizeModeContext.Provider value={value}>{children}</TextSizeModeContext.Provider>;
}

export function useTextSizeMode(): TextSizeModeValue {
  const ctx = useContext(TextSizeModeContext);
  if (!ctx) throw new Error("useTextSizeMode must be used within TextSizeModeProvider");
  return ctx;
}
