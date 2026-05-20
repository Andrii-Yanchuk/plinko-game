import { LogoutButton } from "@/components/LogoutButton";
import { multiplierSlots } from "./constants";
import { HistoryButton } from "./HistoryButton";
import { UserBalance } from "../UserBalance";

type PlinkoBoardProps = {
  balance?: string;
};

export function PlinkoBoard({ balance }: PlinkoBoardProps) {
  return (
    <div className="relative flex min-h-140 flex-1 flex-col overflow-hidden bg-[#101725]">
      <header className="flex h-14 items-center justify-between border-b border-[#222A3B]/80 px-5">
        <div className="flex items-center gap-5">
          <h1 className="text-2xl font-bold text-white">Plinko</h1>
          <UserBalance balance={balance} />
        </div>
        <div className="flex items-center gap-3">
          <HistoryButton />
          <LogoutButton />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-start px-4 pt-24">
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-11">
            {Array.from({ length: 8 }, (_, rowIndex) => (
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

          <div className="flex gap-1.5">
            {multiplierSlots.map((slot, index) => {
              const isCenter = index === 4;
              const isEdge =
                index === 0 || index === multiplierSlots.length - 1;

              return (
                <div
                  className={`flex h-8 w-12 items-center justify-center rounded-lg border text-xs font-bold ${
                    isCenter
                      ? "border-[#00C950] bg-[#06351E] text-[#00E783]"
                      : isEdge
                        ? "border-[#F59E0B] bg-[#3B220A] text-[#F6A11A]"
                        : "border-[#D7A61E] bg-[#372B0D] text-[#F7C948]"
                  }`}
                  key={`${slot}-${index}`}
                >
                  {slot}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
