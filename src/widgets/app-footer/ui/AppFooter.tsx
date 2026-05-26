"use client";

import { History, House, Trophy, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/game", icon: House, label: "Game" },
  { href: "/progress", icon: Trophy, label: "Progress" },
  { href: "/history", icon: History, label: "History" },
  { href: "/profile", icon: User, label: "Profile" },
] as const;

export function AppFooter() {
  const pathname = usePathname();

  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-[#252D3E] bg-[#151A29]/95 px-4 backdrop-blur">
      <nav
        aria-label="Primary"
        className="container flex h-16 items-stretch justify-between gap-2"
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "relative flex w-fit min-w-12 flex-col items-center justify-center gap-1 px-2 pt-2 pb-1 text-[11px] leading-none font-medium transition-colors",
                isActive
                  ? "text-[#00C950] before:absolute before:inset-x-0 before:top-0 before:h-1 before:rounded-b-full before:bg-[#00C950] before:content-['']"
                  : "text-[#8B93A7] hover:text-[#F4F7FB]",
              ].join(" ")}
              href={item.href}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
