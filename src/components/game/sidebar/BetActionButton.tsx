import type { GameMode } from "../types";

type BetActionButtonProps = {
  autoProgress: {
    current: number;
    total: number;
  };
  isAutoPlaying: boolean;
  isManualPlaying: boolean;
  mode: GameMode;
  onClick: () => void;
};

function LoadingButtonContent({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      {children}
    </span>
  );
}

export function BetActionButton({
  autoProgress,
  isAutoPlaying,
  isManualPlaying,
  mode,
  onClick,
}: BetActionButtonProps) {
  const className = isAutoPlaying
    ? "mt-4 h-11 cursor-pointer rounded-lg bg-[#E7000B] text-[18px] font-bold text-[#F4F7FB] transition-[box-shadow,opacity] hover:opacity-90"
    : "mt-4 h-11 cursor-pointer rounded-lg bg-linear-to-r from-[#00C950] to-[#009966] text-[18px] font-bold text-[#F4F7FB] transition-[box-shadow,opacity] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button
      className={className}
      disabled={isManualPlaying}
      onClick={onClick}
      type="button"
    >
      {isAutoPlaying
        ? `STOP (${autoProgress.current}/${autoProgress.total})`
        : mode === "Auto"
          ? "Start Auto"
          : isManualPlaying
            ? (
                <LoadingButtonContent>Playing...</LoadingButtonContent>
              )
            : "Bet"}
    </button>
  );
}
