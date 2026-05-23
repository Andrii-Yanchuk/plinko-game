"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import useSound from "use-sound";
import type { Bet } from "@/entities/bet/model/types";
import { getResultSound } from "@/features/game-sound/lib/soundEvents";

type PlaySound = () => void;

type GameSoundApi = {
  playBetStart: PlaySound;
  playBucketHit: PlaySound;
  playLoss: PlaySound;
  playPegHit: PlaySound;
  playResult: (bet: Bet) => void;
  playWin: PlaySound;
};

function useStableSound(play: PlaySound, soundEnabled: boolean) {
  const playRef = useRef(play);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  return useCallback(() => {
    if (!soundEnabledRef.current) {
      return;
    }

    playRef.current();
  }, []);
}

export function useGameSound(soundEnabled: boolean): GameSoundApi {
  const [playBetStart] = useSound("/sounds/bet-start.wav", {
    soundEnabled,
    volume: 0.45,
  });
  const [playPegHit] = useSound("/sounds/peg-hit.wav", {
    interrupt: true,
    soundEnabled,
    volume: 0.22,
  });
  const [playBucketHit] = useSound("/sounds/bucket-hit.wav", {
    soundEnabled,
    volume: 0.36,
  });
  const [playWin] = useSound("/sounds/win.wav", {
    soundEnabled,
    volume: 0.42,
  });
  const [playLoss] = useSound("/sounds/loss.wav", {
    soundEnabled,
    volume: 0.34,
  });

  const stablePlayBetStart = useStableSound(playBetStart, soundEnabled);
  const stablePlayPegHit = useStableSound(playPegHit, soundEnabled);
  const stablePlayBucketHit = useStableSound(playBucketHit, soundEnabled);
  const stablePlayWin = useStableSound(playWin, soundEnabled);
  const stablePlayLoss = useStableSound(playLoss, soundEnabled);

  const playResult = useCallback(
    (bet: Bet) => {
      const resultSound = getResultSound(bet);

      if (resultSound === "win") {
        stablePlayWin();
        return;
      }

      if (resultSound === "loss") {
        stablePlayLoss();
      }
    },
    [stablePlayLoss, stablePlayWin],
  );

  return useMemo(
    () => ({
      playBetStart: stablePlayBetStart,
      playBucketHit: stablePlayBucketHit,
      playLoss: stablePlayLoss,
      playPegHit: stablePlayPegHit,
      playResult,
      playWin: stablePlayWin,
    }),
    [
      playResult,
      stablePlayBetStart,
      stablePlayBucketHit,
      stablePlayLoss,
      stablePlayPegHit,
      stablePlayWin,
    ],
  );
}
