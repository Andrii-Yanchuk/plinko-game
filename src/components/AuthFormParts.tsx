import { CircleDot } from "lucide-react";
import Link from "next/link";
import { memo, type ChangeEventHandler } from "react";

type AuthBrandProps = {
  subtitle: string;
};

type AuthFieldProps = {
  autoComplete: string;
  helpText?: string;
  id: string;
  label: string;
  minLength?: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  type: "email" | "password";
  value: string;
};

type AuthErrorMessageProps = {
  error: string;
};

type AuthSubmitButtonProps = {
  idleLabel: string;
  isLoading: boolean;
  loadingLabel: string;
};

type AuthSwitchLinkProps = {
  href: string;
  linkLabel: string;
  text: string;
};

export const AuthBrand = memo(function AuthBrand({ subtitle }: AuthBrandProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-r from-[#00C950] to-[#009966]">
        <CircleDot aria-hidden="true" className="h-8 w-8 text-white" />
      </div>
      <h1 className="mb-2 text-3xl font-bold">Plinko</h1>
      <p className="text-[16px] font-medium text-[#99A1AF]">{subtitle}</p>
    </div>
  );
});

export const AuthField = memo(function AuthField({
  autoComplete,
  helpText,
  id,
  label,
  minLength,
  onChange,
  placeholder,
  type,
  value,
}: AuthFieldProps) {
  return (
    <div className="space-y-2">
      <label
        className="block w-fit text-sm font-medium text-[#D1D5DC]"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        autoComplete={autoComplete}
        className="h-12 w-full rounded-xl border border-[#2A2F3E] bg-[#141922] px-4 text-base text-[#F4F7FB] outline-none transition-colors placeholder:text-[#5E687B] focus:border-[#52627D]"
        id={id}
        minLength={minLength}
        onChange={onChange}
        placeholder={placeholder}
        required
        type={type}
        value={value}
      />
      {helpText ? <span className="text-xs text-[#8D96A8]">{helpText}</span> : null}
    </div>
  );
});

export const AuthErrorMessage = memo(function AuthErrorMessage({
  error,
}: AuthErrorMessageProps) {
  if (!error) {
    return null;
  }

  return (
    <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
      {error}
    </p>
  );
});

export const AuthSubmitButton = memo(function AuthSubmitButton({
  idleLabel,
  isLoading,
  loadingLabel,
}: AuthSubmitButtonProps) {
  return (
    <button
      className={`mt-4 h-11 cursor-pointer rounded-lg bg-linear-to-r from-[#00C950] to-[#009966] text-[14px] text-[#F4F7FB] transition-[box-shadow,opacity] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${
        isLoading
          ? "shadow-[0_4px_6px_-4px_rgba(0,0,0,0.1),0_10px_15px_-3px_rgba(0,0,0,0.1)]"
          : ""
      }`}
      disabled={isLoading}
      type="submit"
    >
      {isLoading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          {loadingLabel}
        </span>
      ) : (
        idleLabel
      )}
    </button>
  );
});

export const AuthSwitchLink = memo(function AuthSwitchLink({
  href,
  linkLabel,
  text,
}: AuthSwitchLinkProps) {
  return (
    <p className="mt-5 text-center text-sm text-[#8D96A8]">
      {text}{" "}
      <Link className="font-medium text-[#00C950]" href={href}>
        {linkLabel}
      </Link>
    </p>
  );
});

export const AuthTermsText = memo(function AuthTermsText() {
  return (
    <p className="mt-6 text-center text-sm text-[#6A7282]">
      By continuing, you agree to our Terms and Privacy Policy
    </p>
  );
});
