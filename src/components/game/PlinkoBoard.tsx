import { LogoutButton } from "@/components/LogoutButton";
import type { GameConfig } from "@/lib/game-api";
import { HistoryButton } from "./HistoryButton";
import { UserBalance } from "../UserBalance";
import type { Risk } from "./types";

type PlinkoBoardProps = {
  config?: GameConfig;
  risk: Risk;
  rows: number;
};

function getMultiplierTone(index: number, length: number) {
  const center = (length - 1) / 2;
  const distanceFromCenter = Math.abs(index - center);

  if (distanceFromCenter <= 1) {
    return "border-[#00C950] bg-[#06351E] text-[#00E783]";
  }

  if (index === 0 || index === length - 1) {
    return "border-[#F59E0B] bg-[#3B220A] text-[#F6A11A]";
  }

  return "border-[#D7A61E] bg-[#372B0D] text-[#F7C948]";
}

export function PlinkoBoard({ config, risk, rows }: PlinkoBoardProps) {
  const multiplierSlots = config?.payoutTables[risk]?.[rows] ?? [];

  return (
    <div className="relative flex min-h-140 flex-1 flex-col overflow-hidden bg-[#101725]">
      <header className="flex h-14 items-center justify-between border-b border-[#222A3B]/80 px-5">
        <div className="flex items-center gap-5">
          <h1 className="text-2xl font-bold text-white">Plinko</h1>
          <UserBalance />
        </div>
        <div className="flex items-center gap-3">
          <HistoryButton />
          <LogoutButton />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-start px-4 pt-24">
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-11">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <div className="flex justify-center gap-8" key={rowIndex}>
                {Array.from({ length: rowIndex + 2 }, (_, pegIndex) => (
                  <span
                    className="h-2 w-2 rounded-full bg-[#96A3B5] shadow-[0_0_10px_rgba(150,163,181,0.35)]"
                    key={`${rowIndex}-${pegIndex}`}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="flex max-w-full flex-wrap justify-center gap-1.5">
            {multiplierSlots.map((slot, index) => {
              return (
                <div
                  className={`flex h-8 min-w-12 items-center justify-center rounded-lg border px-2 text-xs font-bold ${getMultiplierTone(index, multiplierSlots.length)}`}
                  key={`${slot}-${index}`}
                >
                  {slot}x
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
