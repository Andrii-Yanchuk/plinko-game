"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearAuthSession, logout } from "@/lib/auth-api";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    try {
      await logout();
    } finally {
      clearAuthSession();
      router.push("/login");
    }
  }

  return (
    <button
      className="h-10 cursor-pointer rounded-lg border border-[#2A2F3E] px-4 text-sm font-medium text-[#D1D5DC] transition-colors hover:bg-[#2A2F3E] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isLoading}
      onClick={handleLogout}
      type="button"
    >
      {isLoading ? "Signing out..." : "Logout"}
    </button>
  );
}
