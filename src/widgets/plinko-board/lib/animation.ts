import type { Bet } from "@/entities/bet/model/types";
import type { Risk } from "@/entities/game/model/types";
import { parsePlinkoPath } from "./path";

export type BallPosition = {
  x: number;
  y: number;
};

const boardWidth = 640;
const rowGap = 44;
const rowStartY = 24;
const pegRadius = 4;
const maxBucketWidth = 54;
const minBucketWidth = 32;
const bucketGap = 6;

export function getBoardWidth() {
  return boardWidth;
}

export function getBoardHeight(rows: number) {
  return rowStartY + rows * rowGap + 52;
}

export function getPegRadius(rows: number, boardRows = rows) {
  const density = boardRows <= 1 ? 0 : (rows - 1) / (boardRows - 1);

  return Math.max(3, pegRadius - density * 0.75);
}

export function getPegPosition(
  rowIndex: number,
  pegIndex: number,
  rows: number,
  boardRows = rows,
) {
  const pegCount = rowIndex + 2;
  const { bucketWidth } = getBucketLayout(rows);
  const pegGap = bucketWidth + bucketGap;
  const rowWidth = (pegCount - 1) * pegGap;
  const bottomPegY = rowStartY + (boardRows - 1) * rowGap;
  const currentRowGap = rows > 1 ? (bottomPegY - rowStartY) / (rows - 1) : 0;

  return {
    x: boardWidth / 2 - rowWidth / 2 + pegIndex * pegGap,
    y: rowStartY + rowIndex * currentRowGap,
  };
}

export function getBucketLayout(rows: number) {
  const bucketCount = rows + 1;
  const availableWidth = boardWidth - (bucketCount - 1) * bucketGap;
  const bucketWidth = Math.max(
    minBucketWidth,
    Math.min(maxBucketWidth, availableWidth / bucketCount),
  );
  const totalWidth = bucketCount * bucketWidth + (bucketCount - 1) * bucketGap;

  return {
    bucketGap,
    bucketWidth,
    totalWidth,
  };
}

export function getBallPath(
  bet: Bet | null,
  rows: number,
  risk: Risk,
  boardRows = rows,
) {
  if (!bet || bet.rows !== rows || bet.risk !== risk) {
    return [];
  }

  const directions = parsePlinkoPath(bet.path, rows);

  if (directions.length === 0) {
    return [];
  }

  const positions: BallPosition[] = [{ x: boardWidth / 2, y: 0 }];
  let bucketIndex = 0;

  directions.forEach((direction, rowIndex) => {
    if (direction === "R") {
      bucketIndex += 1;
    }

    positions.push(getPegPosition(rowIndex, bucketIndex, rows, boardRows));
  });

  const finalBucketIndex =
    directions.length === rows ? bet.bucketIndex : bucketIndex;
  const { bucketWidth, totalWidth } = getBucketLayout(rows);
  const firstBucketCenter =
    boardWidth / 2 - totalWidth / 2 + bucketWidth / 2;

  positions.push({
    x: firstBucketCenter + finalBucketIndex * (bucketWidth + bucketGap),
    y: getBoardHeight(boardRows) - 18,
  });

  return positions;
}
