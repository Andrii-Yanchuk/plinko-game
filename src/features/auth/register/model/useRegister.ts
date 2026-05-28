import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { register } from "@/features/auth/api/authApi";

type AuthFormPayload = {
  email: string;
  password: string;
};

export function useRegister() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = useCallback(async (payload: AuthFormPayload) => {
    setError("");
    setIsLoading(true);

    try {
      await register(payload);
      router.push("/game");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create account";

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    error,
    isLoading,
    submit,
  };
}
