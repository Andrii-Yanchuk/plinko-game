import Image from "next/image";

type SettingsToggleProps = {
  checked: boolean;
  description: string;
  disabled: boolean;
  iconSrc: string;
  label: string;
  onChange: (checked: boolean) => void;
};

export function SettingsToggle({
  checked,
  description,
  disabled,
  iconSrc,
  label,
  onChange,
}: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between gap-5">
      <div className="flex min-w-0 items-center gap-3">
        <Image src={iconSrc} alt="" width={20} height={20} />
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
