import { CirclePlus, Sparkles } from "lucide-react";

type RewardPillProps = {
  children: React.ReactNode;
  label: string;
};

export function RewardPill({ children, label }: RewardPillProps) {
  const Icon = label === "XP" ? Sparkles : CirclePlus;

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md bg-[#101725]/70 px-2.5 py-2 text-sm sm:px-3">
      <Icon
        aria-hidden="true"
        className={`h-4 w-4 shrink-0 ${
          label === "XP" ? "text-[#60A5FA]" : "text-[#00C950]"
        }`}
      />
      <span className="shrink-0 text-[#8D96A8]">{label}</span>
      <span className="min-w-0 truncate font-bold text-[#F4F7FB]">
        {children}
      </span>
    </div>
  );
}
