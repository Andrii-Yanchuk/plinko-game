"use client";

import { AppFooter } from "@/widgets/app-footer/ui/AppFooter";
import { MainFullscreenProvider } from "@/shared/lib/fullscreenContext";

type MainFullscreenShellProps = {
  children: React.ReactNode;
};

export function MainFullscreenShell({ children }: MainFullscreenShellProps) {
  return (
    <MainFullscreenProvider>
      {children}
      <AppFooter />
    </MainFullscreenProvider>
  );
}
