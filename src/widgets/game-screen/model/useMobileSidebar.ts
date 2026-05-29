"use client";

import { useCallback, useState } from "react";

export function useMobileSidebar() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleMobileClose = useCallback(
    () => setIsMobileSidebarOpen(false),
    [],
  );
  const handleMobileOpen = useCallback(() => setIsMobileSidebarOpen(true), []);

  return {
    isMobileSidebarOpen,
    handleMobileClose,
    handleMobileOpen,
  };
}
