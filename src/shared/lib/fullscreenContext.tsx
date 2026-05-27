"use client";

import { createContext, type ReactNode, useContext } from "react";
import { useFullscreen } from "@/shared/lib/useFullscreen";

type MainFullscreenContextValue = {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
};

const MainFullscreenContext =
  createContext<MainFullscreenContextValue | null>(null);

type MainFullscreenProviderProps = {
  children: ReactNode;
};

export function MainFullscreenProvider({
  children,
}: MainFullscreenProviderProps) {
  const { elementRef, isFullscreen, toggleFullscreen } =
    useFullscreen<HTMLDivElement>();

  return (
    <MainFullscreenContext.Provider value={{ isFullscreen, toggleFullscreen }}>
      <div ref={elementRef} className="min-h-screen bg-[#101725]">
        {children}
      </div>
    </MainFullscreenContext.Provider>
  );
}

export function useMainFullscreen() {
  const context = useContext(MainFullscreenContext);

  if (!context) {
    throw new Error("useMainFullscreen must be used within MainFullscreenProvider");
  }

  return context;
}
