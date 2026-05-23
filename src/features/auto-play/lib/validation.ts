export function parsePositiveInteger(value: string) {
  const number = Number(value);

  return Number.isFinite(number) && Number.isInteger(number) && number > 0
    ? number
    : null;
}

export function parseNonNegativeNumber(value: string) {
  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : null;
}
