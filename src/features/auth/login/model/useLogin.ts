import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { login } from "@/features/auth/api/authApi";

type AuthFormPayload = {
  email: string;
  password: string;
};

export function useLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(payload: AuthFormPayload) {
    setError("");
    setIsLoading(true);

    try {
      await login(payload);
      router.push("/game");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Please check your credentials.";

      setError(message);
      toast.error(message);
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
