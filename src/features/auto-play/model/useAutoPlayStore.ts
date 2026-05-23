import { create } from "zustand";

type AutoProgress = {
  current: number;
  total: number;
};

type AutoPlayState = {
  isPlaying: boolean;
  isStopping: boolean;
  progress: AutoProgress;
  setPlaying: (isPlaying: boolean) => void;
  setStopping: (isStopping: boolean) => void;
  setProgress: (progress: AutoProgress) => void;
  reset: () => void;
};

const initialProgress: AutoProgress = {
  current: 0,
  total: 0,
};

export const useAutoPlayStore = create<AutoPlayState>((set) => ({
  isPlaying: false,
  isStopping: false,
  progress: initialProgress,
  setPlaying: (isPlaying) => set({ isPlaying }),
  setStopping: (isStopping) => set({ isStopping }),
  setProgress: (progress) => set({ progress }),
  reset: () =>
    set({
      isPlaying: false,
      isStopping: false,
      progress: initialProgress,
    }),
}));
