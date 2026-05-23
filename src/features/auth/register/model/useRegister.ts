import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/features/auth/api/authApi";

type AuthFormPayload = {
  email: string;
  password: string;
};

export function useRegister() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(payload: AuthFormPayload) {
    setError("");
    setIsLoading(true);

    try {
      await register(payload);
      router.push("/game");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to create account",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return {
    error,
    isLoading,
    submit,
  };
}
