"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type SyntheticEvent, useState } from "react";
import { login } from "@/lib/auth-api";

export function AuthCard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
      router.push("/game");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <section className="flex w-md max-w-[calc(100vw-32px)] flex-col rounded-2xl border border-[#2A2F3E] bg-[#1A1F2E]/80 p-8 text-[#F4F7FB] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-16 w-16 mb-4 items-center justify-center rounded-full bg-linear-to-r from-[#00C950] to-[#009966]">
            <Image
              src="./plinko-icon.svg"
              alt="Plinko Logo"
              width={32}
              height={32}
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">Plinko</h1>
          <p className="text-[16px] font-medium text-[#99A1AF]">
            Welcome back!
          </p>
        </div>

        <form className="mt-8 flex flex-col" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              className="block w-fit text-sm font-medium text-[#D1D5DC]"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="h-12 w-full rounded-xl border border-[#2A2F3E] bg-[#141922] px-4 text-base text-[#F4F7FB] outline-none transition-colors placeholder:text-[#5E687B] focus:border-[#52627D]"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              value={email}
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mt-4 space-y-2">
            <label
              className="block w-fit text-sm font-medium text-[#D1D5DC]"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="h-12 w-full rounded-xl border border-[#2A2F3E] bg-[#141922] px-4 text-base text-[#F4F7FB] outline-none transition-colors placeholder:text-[#5E687B] focus:border-[#52627D]"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              value={password}
              type="password"
              placeholder="Enter password"
              required
            />
          </div>

          {error ? (
            <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

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
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>

          <p className="mt-5 text-center text-sm text-[#8D96A8]">
            Don&apos;t have an account?{" "}
            <Link className="font-medium text-[#00C950]" href="/register">
              Sign Up
            </Link>
          </p>
        </form>
      </section>
      <p className="text-center text-sm text-[#6A7282] mt-6">
        By continuing, you agree to our Terms and Privacy Policy
      </p>
    </div>
  );
}
