"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, type CurrentUser } from "@/lib/auth-api";

export function UserBalance() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [error, setError] = useState("");
  console.log("UserBalance rendered, user:", user);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const accessToken = sessionStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error("Missing access token");
      }

      return getCurrentUser(accessToken);
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

  return (
    <div className="rounded-lg border border-[#2A2F3E] bg-[#141922] px-4 py-2 text-sm">
      <span className="text-[#8D96A8]">Balance</span>{" "}
      <span className="font-semibold text-[#F4F7FB]">
        {user ? user.balance : error || "Loading..."}
      </span>
    </div>
  );
}
