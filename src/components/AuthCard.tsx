"use client";

import {
  type ChangeEvent,
  type SyntheticEvent,
  useCallback,
  useState,
} from "react";
import { useLogin } from "@/features/auth/login/model/useLogin";
import {
  AuthBrand,
  AuthErrorMessage,
  AuthField,
  AuthSubmitButton,
  AuthSwitchLink,
  AuthTermsText,
} from "./AuthFormParts";

export function AuthCard() {
  const { error, isLoading, submit } = useLogin();
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
        <AuthBrand subtitle="Welcome back!" />

        <form className="mt-8 flex flex-col" onSubmit={handleSubmit}>
          <AuthField
            autoComplete="email"
            id="email"
            label="Email"
            onChange={handleEmailChange}
            placeholder="your@email.com"
            type="email"
            value={email}
          />

          <div className="mt-4">
            <AuthField
              autoComplete="current-password"
              id="password"
              label="Password"
              onChange={handlePasswordChange}
              placeholder="Enter password"
              type="password"
              value={password}
            />
          </div>

          <AuthErrorMessage error={error} />
          <AuthSubmitButton
            idleLabel="Sign in"
            isLoading={isLoading}
            loadingLabel="Signing in..."
          />
          <AuthSwitchLink
            href="/register"
            linkLabel="Sign Up"
            text="Don't have an account?"
          />
        </form>
      </section>
      <AuthTermsText />
    </div>
  );
}
