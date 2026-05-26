import { Sparkles } from "lucide-react";
import Image from "next/image";

type RewardPillProps = {
  children: React.ReactNode;
  label: string;
};

export function RewardPill({ children, label }: RewardPillProps) {
  const isXp = label === "XP";

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md bg-[#101725]/70 px-2.5 py-2 text-sm sm:px-3">
      {isXp ? (
        <Sparkles aria-hidden="true" className="h-4 w-4 shrink-0 text-[#60A5FA]" />
      ) : (
        <Image
          src="/balance-icon.svg"
          alt=""
          width={16}
          height={16}
          aria-hidden="true"
          className="shrink-0"
        />
      )}
      <span className="shrink-0 text-[#8D96A8]">{label}</span>
      <span className="min-w-0 truncate font-bold text-[#F4F7FB]">
        {children}
      </span>
    </div>
  );
}
