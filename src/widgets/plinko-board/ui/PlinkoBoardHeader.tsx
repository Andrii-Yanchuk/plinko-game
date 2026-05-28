import { memo } from "react";
import { Menu } from "lucide-react";
import { LogoutButton } from "@/features/auth/logout/ui/LogoutButton";
import { UserBalance } from "@/entities/user/ui/UserBalance";

type PlinkoBoardHeaderProps = {
  onMobileMenuClick?: () => void;
};

export const PlinkoBoardHeader = memo(function PlinkoBoardHeader({
  onMobileMenuClick,
}: PlinkoBoardHeaderProps) {
  return (
    <header className="flex h-12 items-center justify-between border-b border-[#222A3B]/80 px-3 md:h-14 md:px-5">
      <div className="flex min-w-0 items-center gap-3 md:gap-5">
        <button
          aria-label="Open bet controls"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#D1D5DC] transition-colors hover:bg-[#222A3D] md:hidden"
          onClick={onMobileMenuClick}
          type="button"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-white md:text-2xl">Plinko</h1>
        <UserBalance />
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <LogoutButton />
      </div>
    </header>
  );
});
