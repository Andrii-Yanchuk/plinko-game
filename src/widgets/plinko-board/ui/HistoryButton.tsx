import Image from "next/image";
import Link from "next/link";

export function HistoryButton() {
  return (
    <Link
      className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] px-4 text-[16px] font-medium text-[#D1D5DC] transition-colors hover:bg-[#222A3D]"
      href="/history"
    >
      <Image src="./history-icon.svg" alt="" width={16} height={16} />
      History
    </Link>
  );
}
