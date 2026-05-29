import {
  type BoardLayout,
  getBallRadius,
  getPegPosition,
  getPegRadius,
  type BallPosition,
} from "@/widgets/plinko-board/lib/animation";

type CanvasSize = {
  height: number;
  width: number;
};

export type BallFrame = {
  ballPosition?: BallPosition;
  impactPosition?: BallPosition;
  impactProgress?: number;
};

type SceneParams = CanvasSize & {
  layout?: BoardLayout;
  rows: number;
};

type BallLayerParams = SceneParams & {
  ballFrames?: BallFrame[];
};

export function configureCanvas(canvas: HTMLCanvasElement, size: CanvasSize) {
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = size.width * pixelRatio;
  canvas.height = size.height * pixelRatio;
  canvas.style.width = `${size.width}px`;
  canvas.style.height = `${size.height}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  return context;
}

function drawPeg(
  context: CanvasRenderingContext2D,
  position: BallPosition,
  radius: number,
) {
  context.save();
  context.shadowBlur = 10;
  context.shadowColor = "rgba(150, 163, 181, 0.35)";
  context.fillStyle = "#96A3B5";
  context.beginPath();
  context.arc(position.x, position.y, radius, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

type BallSprite = {
  canvas: HTMLCanvasElement;
  half: number;
};

const ballSpriteCache = new Map<string, BallSprite>();

function paintBall(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
) {
  const gradient = context.createRadialGradient(
    centerX - radius * 0.38,
    centerY - radius * 0.5,
    Math.max(1, radius * 0.12),
    centerX,
    centerY,
    radius * 1.12,
  );

  gradient.addColorStop(0, "#B9FFE1");
  gradient.addColorStop(0.45, "#00E783");
  gradient.addColorStop(1, "#009B58");

  context.save();
  context.shadowBlur = radius * 2.25;
  context.shadowColor = "rgba(0, 231, 131, 0.75)";
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

// The ball gradient + shadow are expensive, and the ball only changes size
// with board geometry. Render it once per radius/DPR to an offscreen sprite
// and blit that each frame instead of repainting the glow.
function getBallSprite(radius: number, pixelRatio: number): BallSprite | null {
  const key = `${radius.toFixed(2)}:${pixelRatio}`;
  const cached = ballSpriteCache.get(key);

  if (cached) {
    return cached;
  }

  const half = Math.ceil(radius * 3.4) + 2;
  const size = half * 2;
  const canvas = document.createElement("canvas");

  canvas.width = size * pixelRatio;
  canvas.height = size * pixelRatio;

  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  paintBall(context, half, half, radius);

  const sprite: BallSprite = { canvas, half };
  ballSpriteCache.set(key, sprite);

  return sprite;
}

function drawBall(
  context: CanvasRenderingContext2D,
  position: BallPosition,
  radius: number,
  pixelRatio: number,
) {
  const sprite = getBallSprite(radius, pixelRatio);

  if (!sprite) {
    return;
  }

  const size = sprite.half * 2;
  context.drawImage(
    sprite.canvas,
    position.x - sprite.half,
    position.y - sprite.half,
    size,
    size,
  );
}

function drawImpact(
  context: CanvasRenderingContext2D,
  position: BallPosition,
  progress: number,
  ballRadius: number,
) {
  const radius = ballRadius * 0.75 + progress * ballRadius * 1.25;

  context.save();
  context.globalAlpha = 1 - progress;
  context.strokeStyle = "#00E783";
  context.lineWidth = 1.5;
  context.beginPath();
  context.arc(position.x, position.y, radius, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

// Static layer: pegs never move, so this is drawn once per board geometry
// change rather than on every animation frame.
export function drawPegLayer(
  context: CanvasRenderingContext2D,
  { height, layout = "regular", rows, width }: SceneParams,
) {
  context.clearRect(0, 0, width, height);

  const pegRadius = getPegRadius(rows, layout);

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    for (let pegIndex = 0; pegIndex < rowIndex + 3; pegIndex += 1) {
      drawPeg(
        context,
        getPegPosition(rowIndex, pegIndex, rows, layout),
        pegRadius,
      );
    }
  }
}

// Dynamic layer: cleared and redrawn each frame with only the balls/impacts.
export function drawBallLayer(
  context: CanvasRenderingContext2D,
  { ballFrames = [], height, layout = "regular", rows, width }: BallLayerParams,
) {
  context.clearRect(0, 0, width, height);

  const ballRadius = getBallRadius(rows, layout);
  const pixelRatio = window.devicePixelRatio || 1;

  ballFrames.forEach(({ impactPosition, impactProgress = 1 }) => {
    if (impactPosition && impactProgress < 1) {
      drawImpact(context, impactPosition, impactProgress, ballRadius);
    }
  });

  ballFrames.forEach(({ ballPosition }) => {
    if (ballPosition) {
      drawBall(context, ballPosition, ballRadius, pixelRatio);
    }
  });
}
