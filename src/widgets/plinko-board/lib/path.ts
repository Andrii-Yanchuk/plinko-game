type PlinkoDirection = "L" | "R";

export function parsePlinkoPath(path: string, rows: number) {
  return path
    .toUpperCase()
    .split("")
    .filter((direction): direction is PlinkoDirection =>
      direction === "L" || direction === "R",
    )
    .slice(0, rows);
}
