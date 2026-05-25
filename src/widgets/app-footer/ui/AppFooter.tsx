"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/game", label: "Game" },
  { href: "/progress", label: "Progress" },
  { href: "/history", label: "History" },
  { href: "/profile", label: "Profile" },
] as const;

export function AppFooter() {
  const pathname = usePathname();

  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-[#252D3E] bg-[#101725]/95 px-4 backdrop-blur">
      <nav
        aria-label="Primary"
        className="container flex h-16 items-center justify-between gap-2"
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex min-w-0 flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-[#F4F7FB] text-[#101725]"
                  : "text-[#8B93A7] hover:bg-[#252D3E] hover:text-[#F4F7FB]",
              ].join(" ")}
              href={item.href}
            >
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
