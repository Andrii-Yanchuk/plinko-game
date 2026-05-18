"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type SyntheticEvent, useState } from "react";
import { register, saveAuthSession } from "@/lib/auth-api";

export function RegisterCard() {
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
      const auth = await register({ email, password });
      saveAuthSession(auth);
      router.push("/game");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to create account",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <section className="flex w-md max-w-[calc(100vw-32px)] flex-col rounded-2xl border border-[#2A2F3E] bg-[#1A1F2E]/80 p-8 text-[#F4F7FB] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-r from-[#00C950] to-[#009966]">
            <Image
              src="./plinko-icon.svg"
              alt="Plinko Logo"
              width={32}
              height={32}
            />
          </div>
          <h1 className="mb-2 text-3xl font-bold">Plinko</h1>
          <p className="text-[16px] font-medium text-[#99A1AF]">
            Create your account
          </p>
        </div>

        <form className="mt-8 flex flex-col" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              className="block w-fit text-sm font-medium text-[#D1D5DC]"
              htmlFor="register-email"
            >
              Email
            </label>
            <input
              className="h-12 w-full rounded-xl border border-[#2A2F3E] bg-[#141922] px-4 text-base text-[#F4F7FB] outline-none transition-colors placeholder:text-[#5E687B] focus:border-[#52627D]"
              id="register-email"
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
              htmlFor="register-password"
            >
              Password
            </label>
            <input
              className="h-12 w-full rounded-xl border border-[#2A2F3E] bg-[#141922] px-4 text-base text-[#F4F7FB] outline-none transition-colors placeholder:text-[#5E687B] focus:border-[#52627D]"
              id="register-password"
              onChange={(event) => setPassword(event.target.value)}
              value={password}
              type="password"
              placeholder="Enter password"
              minLength={8}
              required
            />
            <span className="text-xs text-[#8D96A8]">
              At least 8 characters with a letter and digit
            </span>
          </div>

          {error ? (
            <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            className="mt-4 h-11 cursor-pointer rounded-lg bg-linear-to-r from-[#00C950] to-[#009966] text-[14px] text-[#F4F7FB] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Creating..." : "Create account"}
          </button>

          <p className="mt-5 text-center text-sm text-[#8D96A8]">
            Already have an account?{" "}
            <Link className="font-medium text-[#00C950]" href="/login">
              Sign In
            </Link>
          </p>
        </form>
      </section>
      <p className="mt-6 text-center text-sm text-[#6A7282]">
        By continuing, you agree to our Terms and Privacy Policy
      </p>
    </div>
  );
}
