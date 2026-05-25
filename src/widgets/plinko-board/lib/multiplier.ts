export function multiplierColor(m: number): string {
  if (m >= 10) return "border-2 border-[#FF3B4F] bg-[#FF3B4F]/25 text-[#FF3B4F]";
  if (m >= 3) return "border-2 border-[#FF9F2E] bg-[#FF9F2E]/25 text-[#FF9F2E]";
  if (m >= 1) return "border-2 border-[#FFCC44] bg-[#FFCC44]/25 text-[#FFCC44]";
  if (m >= 0.5) return "border-2 border-[#2FDB72] bg-[#2FDB72]/25 text-[#2FDB72]";
  return "border-2 border-[#126D42] bg-[#126D42]/25 text-[#126D42]";
}

function normalizeMultiplier(multiplier: number | string) {
  const value = Number(multiplier);

  return Number.isFinite(value) ? value : 0;
}

export function getMultiplierTextTone(multiplier: number | string) {
  const value = normalizeMultiplier(multiplier);

  return multiplierColor(value)
    .split(" ")
    .find((className) => className.startsWith("text-")) ?? "text-[#075D37]";
}

export function getMultiplierTone(
  multiplier: number | string,
  isActive: boolean,
) {
  const value = normalizeMultiplier(multiplier);

  if (isActive) {
    return "border-2 border-[#2FDB72] bg-[#2FDB72] text-white";
  }

  return multiplierColor(value);
}
