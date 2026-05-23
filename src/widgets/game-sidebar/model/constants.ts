import type { BetControl, GameMode, Risk } from "@/entities/game/model/types";

export const betControls: BetControl[] = ["1/2", "2x", "MAX"];
export const modes: GameMode[] = ["Manual", "Auto"];

export const riskStyles: Record<Risk, string> = {
  LOW: "border-[#00C950] bg-[#00C95033] text-[#00C950]",
  MEDIUM: "border-[#FACC15] bg-[#FACC1533] text-[#FACC15]",
  HIGH: "border-[#FB2C36] bg-[#FB2C3633] text-[#FB2C36]",
};
