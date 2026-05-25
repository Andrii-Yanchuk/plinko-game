import { AppFooter } from "@/widgets/app-footer/ui/AppFooter";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <AppFooter />
    </>
  );
}
