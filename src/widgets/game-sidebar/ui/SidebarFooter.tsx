import { Maximize2, Settings } from "lucide-react";
import { useCallback, useState } from "react";
import { SettingsModal } from "./SettingsModal";

type SidebarFooterProps = {
  animationsEnabled: boolean;
  isAnimationToggleDisabled: boolean;
  isFullscreen: boolean;
  onAnimationsChange: (enabled: boolean) => void;
  onFullscreenClick: () => void;
  onSoundChange: (enabled: boolean) => void;
  soundEnabled: boolean;
};

export function SidebarFooter({
  animationsEnabled,
  isAnimationToggleDisabled,
  isFullscreen,
  onAnimationsChange,
  onFullscreenClick,
  onSoundChange,
  soundEnabled,
}: SidebarFooterProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  return (
    <>
      <div className="mt-auto -mx-4 flex h-17.5 items-center justify-between border-t border-[#2A2F3E] px-4">
        <button
          aria-label="Fullscreen"
          aria-pressed={isFullscreen}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-[#2626264D]"
          onClick={onFullscreenClick}
          type="button"
        >
          <Maximize2 aria-hidden="true" className="h-5 w-5 text-[#99A1AF]" />
        </button>
        <button
          aria-label="Settings"
          aria-expanded={isSettingsOpen}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-[#2626264D]"
          onClick={() => setIsSettingsOpen(true)}
          type="button"
        >
          <Settings aria-hidden="true" className="h-5 w-5 text-[#99A1AF]" />
        </button>
      </div>

      {isSettingsOpen ? (
        <SettingsModal
          animationsEnabled={animationsEnabled}
          isAnimationToggleDisabled={isAnimationToggleDisabled}
          onAnimationsChange={onAnimationsChange}
          onClose={closeSettings}
          onSoundChange={onSoundChange}
          soundEnabled={soundEnabled}
        />
      ) : null}
    </>
  );
}
