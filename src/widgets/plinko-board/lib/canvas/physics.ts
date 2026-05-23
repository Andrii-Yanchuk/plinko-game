import type { BallPosition } from "@/widgets/plinko-board/lib/animation";

export const stepDurationMs = 150;

const bounceLift = 14;
const horizontalOvershoot = 7;

function easeInQuad(progress: number) {
  return progress * progress;
}

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

function easeInOutSine(progress: number) {
  return -(Math.cos(Math.PI * progress) - 1) / 2;
}

function getPhysicsPosition(
  from: BallPosition,
  to: BallPosition,
  progress: number,
) {
  const horizontalDirection = Math.sign(to.x - from.x);
  const sidePush =
    horizontalDirection * Math.sin(Math.PI * progress) * horizontalOvershoot;

  return {
    x: from.x + (to.x - from.x) * easeInOutSine(progress) + sidePush,
    y:
      from.y +
      (to.y - from.y) * easeInQuad(progress) -
      Math.sin(Math.PI * progress) * bounceLift,
  };
}

export function getBallFrame(path: BallPosition[], elapsedMs: number) {
  const segmentIndex = Math.min(
    Math.floor(elapsedMs / stepDurationMs),
    path.length - 2,
  );
  const progress = Math.min(
    (elapsedMs - segmentIndex * stepDurationMs) / stepDurationMs,
    1,
  );

  return {
    ballPosition: getPhysicsPosition(
      path[segmentIndex],
      path[segmentIndex + 1],
      progress,
    ),
    impactPosition: path[segmentIndex],
    impactProgress: progress < 0.3 ? easeOutCubic(progress / 0.3) : 1,
    isComplete: segmentIndex >= path.length - 2 && progress >= 1,
  };
}
