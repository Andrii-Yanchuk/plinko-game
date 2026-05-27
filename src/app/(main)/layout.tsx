import { MainFullscreenShell } from "./MainFullscreenShell";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainFullscreenShell>{children}</MainFullscreenShell>;
}
