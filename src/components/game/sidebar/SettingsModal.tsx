import Image from "next/image";
import { useEffect } from "react";
import { SettingsToggle } from "./SettingsToggle";

type SettingsModalProps = {
  animationsEnabled: boolean;
  onAnimationsChange: (enabled: boolean) => void;
  onClose: () => void;
  onSoundChange: (enabled: boolean) => void;
  soundEnabled: boolean;
};

export function SettingsModal({
  animationsEnabled,
  onAnimationsChange,
  onClose,
  onSoundChange,
  soundEnabled,
}: SettingsModalProps) {
  const settings = [
    {
      checked: soundEnabled,
      description: "Play sound effects during gameplay",
      iconSrc: "./sound-icon.svg",
      label: "Sound Effects",
      onChange: onSoundChange,
    },
    {
      checked: animationsEnabled,
      description: "Enable smooth ball animations",
      iconSrc: "./light-icon.svg",
      label: "Animations",
      onChange: onAnimationsChange,
    },
  ];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
      onMouseDown={onClose}
    >
      <div
        aria-modal="true"
        className="w-full max-w-107 rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] p-5 text-[#F4F7FB] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <p className="mt-2 text-sm text-[#99A1AF]">
              Customize your gaming experience
            </p>
          </div>

          <button
            aria-label="Close settings"
            className="-mt-4 -mr-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-[#2626264D]"
            onClick={onClose}
            type="button"
          >
            <Image src="./close-icon.svg" alt="" width={16} height={16} />
          </button>
        </div>

        <div className="mt-7 space-y-5">
          {settings.map((setting) => (
            <SettingsToggle key={setting.label} {...setting} />
          ))}
        </div>

        <div className="flex flex-col gap-1 mt-6 border-t border-[#2A2F3E] pt-4 text-sm leading-6 text-[#D4D8E1]">
          <span className="font-medium text-sm text-[#D1D5DC]">
            Version: <span className="text-[#99A1AF]">0.0.1</span>
          </span>
          <span>
            Mode: <span className="text-[#99A1AF]">Demo</span>
          </span>
        </div>
      </div>
    </div>
  );
}
