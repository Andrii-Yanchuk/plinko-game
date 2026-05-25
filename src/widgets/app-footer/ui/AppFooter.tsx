"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type FooterIconProps = {
  className?: string;
};

const navItems = [
  { href: "/game", icon: HomeIcon, label: "Game" },
  { href: "/progress", icon: TrophyIcon, label: "Progress" },
  { href: "/history", icon: HistoryIcon, label: "History" },
  { href: "/profile", icon: ProfileIcon, label: "Profile" },
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

function HomeIcon({ className }: FooterIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M3.75 10.8 12 4.25l8.25 6.55v8.45a1 1 0 0 1-1 1h-4.5v-6.5h-5.5v6.5h-4.5a1 1 0 0 1-1-1V10.8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function TrophyIcon({ className }: FooterIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M8 4.75h8v3.5c0 2.75-1.8 5-4 5s-4-2.25-4-5v-3.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M8 7H5.25a2.25 2.25 0 0 0 2.25 3.5H8M16 7h2.75a2.25 2.25 0 0 1-2.25 3.5H16M12 13.25v3.25M8.75 20h6.5M10 16.5h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function HistoryIcon({ className }: FooterIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M6.25 7.75A7 7 0 1 1 5 12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M6.25 4.75v3h3M12 8.25v4l2.75 1.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ProfileIcon({ className }: FooterIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 12.25a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5ZM5.25 20.25a6.75 6.75 0 0 1 13.5 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
