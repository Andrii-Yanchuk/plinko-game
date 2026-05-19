import type { BetControl, GameMode, Risk } from "./types";

export const betControls: BetControl[] = ["1/2", "2x", "MAX"];
export const modes: GameMode[] = ["Manual", "Auto"];
export const risks: Risk[] = ["LOW", "MEDIUM", "HIGH"];

export const riskStyles: Record<Risk, string> = {
  LOW: "border-[#00C950] bg-[#00C95033] text-[#00C950]",
  MEDIUM: "border-[#FACC15] bg-[#FACC1533] text-[#FACC15]",
  HIGH: "border-[#FB2C36] bg-[#FB2C3633] text-[#FB2C36]",
};

export const minRows = 8;
export const maxRows = 16;
export const maxBetAmount = 10000;
