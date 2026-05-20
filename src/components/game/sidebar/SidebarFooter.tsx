import Image from "next/image";

export function SidebarFooter() {
  return (
    <div className="mt-auto -mx-4 -mb-4 flex h-17.5 items-center justify-between border-t border-[#2A2F3E] px-4">
      <button
        aria-label="Fullscreen"
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-[#2626264D]"
        type="button"
      >
        <Image src="./all-display-icon.svg" alt="" width={20} height={20} />
      </button>
      <button
        aria-label="Settings"
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-[#2626264D]"
        type="button"
      >
        <Image src="./setings-icon.svg" alt="" width={20} height={20} />
      </button>
    </div>
  );
}
