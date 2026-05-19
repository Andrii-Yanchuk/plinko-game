"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, refreshAuth, type CurrentUser } from "@/lib/auth-api";
import Image from "next/image";

export function UserBalance() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        return await getCurrentUser();
      } catch {
        await refreshAuth();
        return getCurrentUser();
      }
    }

    loadUser()
      .then((nextUser) => {
        if (isMounted) {
          setUser(nextUser);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Unable to load balance");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const balance = user
    ? Number(user.balance).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : error || "Loading...";

  return (
    <div className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#2A2F3E] bg-[#1A1F2E] px-4 text-xs">
      <Image src="./balance-icon.svg" alt="bet-icon" width={20} height={20} />
      <span className="text-[#8D96A8]">Balance:</span>
      <span className="font-bold text-[#00E783]">{balance}</span>
    </div>
  );
}
