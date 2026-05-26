import Link from "next/link";

export function ProfileHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-[#273044] bg-[#1A1F2E] px-6">
      <Link
        aria-label="Back to game"
        className="flex h-9 w-9 items-center justify-center rounded-md text-[#C8D0DF] transition-colors hover:bg-[#252B3A] hover:text-white"
        href="/game"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M15 5.5 8.5 12l6.5 6.5M9 12h10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </Link>
      <h1 className="text-xl font-bold">Profile</h1>
    </header>
  );
}
