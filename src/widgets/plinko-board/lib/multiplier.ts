export function getMultiplierTone(
  index: number,
  length: number,
  isActive: boolean,
) {
  if (isActive) {
    return "scale-110 border-[#F4F7FB] bg-[#00C950] text-[#07130B] shadow-[0_0_18px_rgba(0,201,80,0.75)]";
  }

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
