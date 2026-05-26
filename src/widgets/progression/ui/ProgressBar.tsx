import { clampPercent } from "@/widgets/progression/lib/progression";

type ProgressBarProps = {
  percent: number;
  trackClassName: string;
  valueClassName: string;
};

export function ProgressBar({
  percent,
  trackClassName,
  valueClassName,
}: ProgressBarProps) {
  const ariaValue = Math.round(clampPercent(percent));

  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={ariaValue}
      className={`h-2 overflow-hidden rounded-full ${trackClassName}`}
      role="progressbar"
    >
      <div
        className={`h-full rounded-full ${valueClassName}`}
        style={{ width: `${ariaValue}%` }}
      />
    </div>
  );
}
