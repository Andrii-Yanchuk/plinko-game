"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/features/auth/api/authApi";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    try {
      await logout();
    } finally {
      router.push("/login");
    }
  }

  return (
    <button
      className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] px-4 text-[16px] font-medium text-[#D1D5DC] transition-colors hover:bg-[#222A3D] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isLoading}
      onClick={handleLogout}
      type="button"
    >
      <Image src="./logout-icon.svg" alt="" width={16} height={16} />
      {isLoading ? "Signing out..." : "Logout"}
    </button>
  );
}
