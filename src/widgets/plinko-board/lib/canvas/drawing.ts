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

type DrawSceneParams = CanvasSize & {
  ballFrames?: BallFrame[];
  layout?: BoardLayout;
  rows: number;
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

function drawBall(
  context: CanvasRenderingContext2D,
  position: BallPosition,
  radius: number,
) {
  const gradient = context.createRadialGradient(
    position.x - radius * 0.38,
    position.y - radius * 0.5,
    Math.max(1, radius * 0.12),
    position.x,
    position.y,
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
  context.arc(position.x, position.y, radius, 0, Math.PI * 2);
  context.fill();
  context.restore();
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

export function drawPlinkoScene(
  context: CanvasRenderingContext2D,
  {
    ballFrames = [],
    height,
    layout = "regular",
    rows,
    width,
  }: DrawSceneParams,
) {
  context.clearRect(0, 0, width, height);

  const pegRadius = getPegRadius(rows, layout);
  const ballRadius = getBallRadius(rows, layout);

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    for (let pegIndex = 0; pegIndex < rowIndex + 3; pegIndex += 1) {
      drawPeg(
        context,
        getPegPosition(rowIndex, pegIndex, rows, layout),
        pegRadius,
      );
    }
  }

  ballFrames.forEach(({ impactPosition, impactProgress = 1 }) => {
    if (impactPosition && impactProgress < 1) {
      drawImpact(context, impactPosition, impactProgress, ballRadius);
    }
  });

  ballFrames.forEach(({ ballPosition }) => {
    if (ballPosition) {
      drawBall(context, ballPosition, ballRadius);
    }
  });
}
