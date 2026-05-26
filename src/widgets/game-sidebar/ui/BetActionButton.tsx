import type { GameMode } from "@/entities/game/model/types";

type BetActionButtonProps = {
  activeManualRoundCount: number;
  autoProgress: {
    current: number;
    total: number;
  };
  className?: string;
  isAutoPlaying: boolean;
  isAutoStopping: boolean;
  isManualBetDisabled: boolean;
  isManualRequestPending: boolean;
  manualRoundLimit: number;
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
  activeManualRoundCount,
  autoProgress,
  className = "",
  isAutoPlaying,
  isAutoStopping,
  isManualBetDisabled,
  isManualRequestPending,
  manualRoundLimit,
  mode,
  onClick,
}: BetActionButtonProps) {
  const baseClassName = isAutoPlaying
    ? "mt-4 h-11 cursor-pointer rounded-lg bg-[#E7000B] text-[18px] font-bold text-[#F4F7FB] transition-[box-shadow,opacity] hover:opacity-90"
    : "mt-4 h-11 cursor-pointer rounded-lg bg-linear-to-r from-[#00C950] to-[#009966] text-[18px] font-bold text-[#F4F7FB] transition-[box-shadow,opacity] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button
      className={`${baseClassName} ${className}`}
      disabled={mode === "Auto" ? isAutoStopping : isManualBetDisabled}
      onClick={onClick}
      type="button"
    >
      {isAutoPlaying ? (
        isAutoStopping ? (
          <LoadingButtonContent>Stopping...</LoadingButtonContent>
        ) : (
          `STOP (${autoProgress.current}/${autoProgress.total})`
        )
      )
        : mode === "Auto"
          ? "Start Auto"
          : isManualRequestPending
            ? (
                <LoadingButtonContent>Playing...</LoadingButtonContent>
              )
            : activeManualRoundCount > 0
              ? `Playing... (${activeManualRoundCount}/${manualRoundLimit})`
              : "Bet"}
    </button>
  );
}
