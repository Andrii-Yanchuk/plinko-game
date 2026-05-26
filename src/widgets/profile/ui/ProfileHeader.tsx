import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ProfileHeader() {
  return (
    <header className="border-b border-[#222A3B]/80 bg-[#1A1F2EF2]">
      <div className="mx-auto flex h-16 w-full max-w-[990px] min-w-0 items-center gap-3 px-4">
        <Link
          aria-label="Back to game"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-[#D1D5DC] transition-colors hover:bg-[#222A3D]"
          href="/game"
        >
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </Link>
        <h1 className="min-w-0 truncate text-xl font-bold sm:text-[24px]">
          Profile
        </h1>
      </div>
    </header>
  );
}
