"use client";

import {
  type ChangeEvent,
  type SyntheticEvent,
  useCallback,
  useState,
} from "react";
import { useRegister } from "@/features/auth/register/model/useRegister";
import {
  AuthBrand,
  AuthErrorMessage,
  AuthField,
  AuthSubmitButton,
  AuthSwitchLink,
  AuthTermsText,
} from "./AuthFormParts";

export function RegisterCard() {
  const { error, isLoading, submit } = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }, []);
  const handlePasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
    },
    [],
  );
  const handleSubmit = useCallback(async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submit({ email, password });
  }, [email, password, submit]);

  return (
    <div className="flex flex-col items-center">
      <section className="flex w-md max-w-[calc(100vw-32px)] flex-col rounded-2xl border border-[#2A2F3E] bg-[#1A1F2E]/80 p-8 text-[#F4F7FB] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <AuthBrand subtitle="Create your account" />

        <form className="mt-8 flex flex-col" onSubmit={handleSubmit}>
          <AuthField
            autoComplete="email"
            id="register-email"
            label="Email"
            onChange={handleEmailChange}
            placeholder="your@email.com"
            type="email"
            value={email}
          />

          <div className="mt-4">
            <AuthField
              autoComplete="new-password"
              helpText="At least 8 characters with a letter and digit"
              id="register-password"
              label="Password"
              minLength={8}
              onChange={handlePasswordChange}
              placeholder="Enter password"
              type="password"
              value={password}
            />
          </div>

          <AuthErrorMessage error={error} />
          <AuthSubmitButton
            idleLabel="Create account"
            isLoading={isLoading}
            loadingLabel="Creating account..."
          />
          <AuthSwitchLink
            href="/login"
            linkLabel="Sign In"
            text="Already have an account?"
          />
        </form>
      </section>
      <AuthTermsText />
    </div>
  );
}
