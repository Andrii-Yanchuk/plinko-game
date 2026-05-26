import type { LucideIcon } from "lucide-react";

type SettingsToggleProps = {
  checked: boolean;
  description: string;
  disabled: boolean;
  icon: LucideIcon;
  label: string;
  onChange: (checked: boolean) => void;
};

export function SettingsToggle({
  checked,
  description,
  disabled,
  icon: Icon,
  label,
  onChange,
}: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between gap-5">
      <div className="flex min-w-0 items-center gap-3">
        <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-[#00C950]" />
        <div className="min-w-0">
          <div className="text-sm font-medium text-[#F4F7FB]">{label}</div>
          <div className="mt-0.5 text-xs leading-5 text-[#8B94A7]">
            {description}
          </div>
        </div>
      </div>

      <button
        aria-label={label}
        aria-pressed={checked}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
          checked ? "bg-[#00C950]" : "bg-[#2A2F3E]"
        }`}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span
          className={`absolute top-0.75 h-3.5 w-3.5 rounded-full bg-white transition-[left] duration-200 ${
            checked ? "left-4.75" : "left-0.75"
          }`}
        />
      </button>
    </div>
  );
}
