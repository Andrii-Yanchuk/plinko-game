export function isBlockedNumberInputKey(key: string) {
  return ["e", "E", "+", "-"].includes(key);
}
