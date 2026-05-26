import { AppFooterNav } from "./AppFooterNav";

export function AppFooter() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-[#252D3E] bg-[#151A29]/95 px-4 backdrop-blur">
      <AppFooterNav />
    </footer>
  );
}
