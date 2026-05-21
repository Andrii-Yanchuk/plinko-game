import Image from "next/image";
import { useCallback, useState } from "react";
import { SettingsModal } from "./SettingsModal";

type SidebarFooterProps = {
  isFullscreen: boolean;
  onFullscreenClick: () => void;
};

export function SidebarFooter({
  isFullscreen,
  onFullscreenClick,
}: SidebarFooterProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  return (
    <>
      <div className="mt-auto -mx-4 -mb-4 flex h-17.5 items-center justify-between border-t border-[#2A2F3E] px-4">
        <button
          aria-label="Fullscreen"
          aria-pressed={isFullscreen}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-[#2626264D]"
          onClick={onFullscreenClick}
          type="button"
        >
          <Image src="./all-display-icon.svg" alt="" width={20} height={20} />
        </button>
        <button
          aria-label="Settings"
          aria-expanded={isSettingsOpen}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-[#2626264D]"
          onClick={() => setIsSettingsOpen(true)}
          type="button"
        >
          <Image src="./setings-icon.svg" alt="" width={20} height={20} />
        </button>
      </div>

      {isSettingsOpen ? (
        <SettingsModal
          animationsEnabled={animationsEnabled}
          onAnimationsChange={setAnimationsEnabled}
          onClose={closeSettings}
          onSoundChange={setSoundEnabled}
          soundEnabled={soundEnabled}
        />
      ) : null}
    </>
  );
}
