"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useFullscreen<TElement extends HTMLElement>() {
  const elementRef = useRef<TElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === elementRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
      return;
    }

    void elementRef.current?.requestFullscreen().catch(() => undefined);
  }, []);

  return {
    elementRef,
    isFullscreen,
    toggleFullscreen,
  };
}
