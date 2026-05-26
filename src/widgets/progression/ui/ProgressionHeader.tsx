import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ProgressionHeader() {
  return (
    <header className="flex h-16 min-w-0 items-center gap-2 border-b border-[#222A3B]/80 px-3 sm:gap-4 sm:px-4">
      <Link
        className="flex shrink-0 items-center gap-1 rounded-[8px] border border-[#2A2F3E] bg-[#1A1F2E] px-3 py-2 text-sm text-[#D1D5DC] transition-colors hover:bg-[#222A3D] sm:px-4 sm:text-[16px]"
        href="/game"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        <span className="sm:hidden">Back</span>
        <span className="hidden sm:inline">Back to Game</span>
      </Link>
      <h1 className="min-w-0 truncate text-xl font-bold sm:text-[24px]">
        Progression
      </h1>
    </header>
  );
}
