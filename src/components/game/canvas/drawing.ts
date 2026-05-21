import {
  getPegPosition,
  getPegRadius,
  type BallPosition,
} from "../utils/animation";

type CanvasSize = {
  height: number;
  width: number;
};

type DrawSceneParams = CanvasSize & {
  ballPosition?: BallPosition;
  boardRows: number;
  impactPosition?: BallPosition;
  impactProgress?: number;
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

function drawBall(context: CanvasRenderingContext2D, position: BallPosition) {
  const gradient = context.createRadialGradient(
    position.x - 3,
    position.y - 4,
    1,
    position.x,
    position.y,
    9,
  );

  gradient.addColorStop(0, "#B9FFE1");
  gradient.addColorStop(0.45, "#00E783");
  gradient.addColorStop(1, "#009B58");

  context.save();
  context.shadowBlur = 18;
  context.shadowColor = "rgba(0, 231, 131, 0.75)";
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(position.x, position.y, 8, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawImpact(
  context: CanvasRenderingContext2D,
  position: BallPosition,
  progress: number,
) {
  const radius = 6 + progress * 10;

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
    ballPosition,
    boardRows,
    height,
    impactPosition,
    impactProgress = 1,
    rows,
    width,
  }: DrawSceneParams,
) {
  context.clearRect(0, 0, width, height);

  const pegRadius = getPegRadius(rows, boardRows);

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    for (let pegIndex = 0; pegIndex < rowIndex + 2; pegIndex += 1) {
      drawPeg(
        context,
        getPegPosition(rowIndex, pegIndex, rows, boardRows),
        pegRadius,
      );
    }
  }

  if (impactPosition && impactProgress < 1) {
    drawImpact(context, impactPosition, impactProgress);
  }

  if (ballPosition) {
    drawBall(context, ballPosition);
  }
}
