import type { Bet } from "@/entities/bet/model/types";
import type { Risk } from "@/entities/game/model/types";
import { parsePlinkoPath } from "./path";

export type BallPosition = {
  x: number;
  y: number;
};

export type BoardLayout = "regular" | "tablet" | "compact";

const boardWidthByLayout: Record<BoardLayout, number> = {
  compact: 360,
  regular: 640,
  tablet: 460,
};
const rowStartYByLayout: Record<BoardLayout, number> = {
  compact: 20,
  regular: 24,
  tablet: 22,
};
const pyramidHeightByLayout: Record<BoardLayout, number> = {
  compact: 190,
  regular: 460,
  tablet: 260,
};
const pyramidWidthByLayout: Record<BoardLayout, number> = {
  compact: 340,
  regular: 540,
  tablet: 430,
};
const bucketOffsetByLayout: Record<BoardLayout, number> = {
  compact: 16,
  regular: 18,
  tablet: 17,
};
const boardBottomPaddingByLayout: Record<BoardLayout, number> = {
  compact: 46,
  regular: 52,
  tablet: 48,
};
const bucketGapByLayout: Record<BoardLayout, number> = {
  compact: 2,
  regular: 6,
  tablet: 4,
};
const minRowsForPegScale = 8;
const maxRowsForPegScale = 16;
const pegRadiusByLayout: Record<
  BoardLayout,
  { maxRowsRadius: number; minRowsRadius: number }
> = {
  compact: {
    maxRowsRadius: 2.6,
    minRowsRadius: 4,
  },
  regular: {
    maxRowsRadius: 3,
    minRowsRadius: 5,
  },
  tablet: {
    maxRowsRadius: 2.8,
    minRowsRadius: 4.5,
  },
};

export function getBoardWidth(layout: BoardLayout = "regular") {
  return boardWidthByLayout[layout];
}

export function getBoardHeight(_rows: number, layout: BoardLayout = "regular") {
  return (
    rowStartYByLayout[layout] +
    pyramidHeightByLayout[layout] +
    boardBottomPaddingByLayout[layout]
  );
}

export function getPegRadius(rows: number, layout: BoardLayout = "regular") {
  const density = Math.min(
    1,
    Math.max(
      0,
      (rows - minRowsForPegScale) / (maxRowsForPegScale - minRowsForPegScale),
    ),
  );
  const { maxRowsRadius, minRowsRadius } = pegRadiusByLayout[layout];

  return minRowsRadius - density * (minRowsRadius - maxRowsRadius);
}

export function getBallRadius(rows: number, layout: BoardLayout = "regular") {
  return getPegRadius(rows, layout) * 1.75;
}

export function getPegPosition(
  rowIndex: number,
  pegIndex: number,
  rows: number,
  layout: BoardLayout = "regular",
) {
  const pegCount = rowIndex + 3;
  const pegGap = pyramidWidthByLayout[layout] / (rows + 1);
  const rowWidth = (pegCount - 1) * pegGap;
  const rowStartY = rowStartYByLayout[layout];
  const currentRowGap =
    rows > 1 ? pyramidHeightByLayout[layout] / (rows - 1) : 0;

  return {
    x: boardWidthByLayout[layout] / 2 - rowWidth / 2 + pegIndex * pegGap,
    y: rowStartY + rowIndex * currentRowGap,
  };
}

export function getBucketLayout(rows: number, layout: BoardLayout = "regular") {
  const bucketCount = rows + 1;
  const bucketGap = bucketGapByLayout[layout];
  const pegGap = pyramidWidthByLayout[layout] / bucketCount;
  const bucketWidth = Math.max(0, pegGap - bucketGap);
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
  layout: BoardLayout = "regular",
) {
  if (!bet || bet.rows !== rows || bet.risk !== risk) {
    return [];
  }

  const directions = parsePlinkoPath(bet.path, rows);

  if (directions.length === 0) {
    return [];
  }

  const positions: BallPosition[] = [
    { x: boardWidthByLayout[layout] / 2, y: 0 },
  ];
  let bucketIndex = 0;

  directions.forEach((direction, rowIndex) => {
    positions.push(getPegPosition(rowIndex, bucketIndex + 1, rows, layout));

    if (direction === "R") {
      bucketIndex += 1;
    }
  });

  const finalBucketIndex =
    directions.length === rows ? bet.bucketIndex : bucketIndex;
  const { bucketGap, bucketWidth, totalWidth } = getBucketLayout(rows, layout);
  const firstBucketCenter =
    boardWidthByLayout[layout] / 2 - totalWidth / 2 + bucketWidth / 2;

  positions.push({
    x: firstBucketCenter + finalBucketIndex * (bucketWidth + bucketGap),
    y: getBoardHeight(rows, layout) - bucketOffsetByLayout[layout],
  });

  return positions;
}
