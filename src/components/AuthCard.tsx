import Image from "next/image";

export function AuthCard() {
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

        <form className="mt-8 flex flex-col">
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
              type="email"
              placeholder="your@email.com"
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
              type="password"
              placeholder="Enter password"
            />
          </div>

          <button
            className="mt-4 h-11 rounded-lg bg-linear-to-r from-[#00C950] to-[#009966] text-[14px] text-[#F4F7FB] transition-opacity hover:opacity-90 cursor-pointer"
            type="submit"
          >
            Sign in
          </button>

          <p className="mt-5 text-center text-sm text-[#8D96A8]">
            Don&apos;t have an account?{" "}
            <a className="font-medium text-[#00C950]" href="#">
              Sign Up
            </a>
          </p>
        </form>
      </section>
      <p className="text-center text-sm text-[#6A7282] mt-6">
        By continuing, you agree to our Terms and Privacy Policy.
      </p>
    </div>
  );
}
