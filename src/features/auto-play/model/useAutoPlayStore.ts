import { create } from "zustand";

type AutoProgress = {
  current: number;
  total: number;
};

type AutoPlayState = {
  isPlaying: boolean;
  isStopping: boolean;
  stopRequested: boolean;
  progress: AutoProgress;
  setPlaying: (isPlaying: boolean) => void;
  setStopping: (isStopping: boolean) => void;
  setProgress: (progress: AutoProgress) => void;
  requestStop: () => void;
  clearStopRequest: () => void;
  reset: () => void;
};

const initialProgress: AutoProgress = {
  current: 0,
  total: 0,
};

export const useAutoPlayStore = create<AutoPlayState>((set) => ({
  isPlaying: false,
  isStopping: false,
  stopRequested: false,
  progress: initialProgress,
  setPlaying: (isPlaying) => set({ isPlaying }),
  setStopping: (isStopping) => set({ isStopping }),
  setProgress: (progress) => set({ progress }),
  requestStop: () => set({ stopRequested: true }),
  clearStopRequest: () => set({ stopRequested: false }),
  reset: () =>
    set({
      isPlaying: false,
      isStopping: false,
      stopRequested: false,
      progress: initialProgress,
    }),
}));
