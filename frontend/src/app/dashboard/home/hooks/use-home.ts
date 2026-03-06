import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toErrorMessage } from "../../../../lib/errors";
import type { MeResponse } from "../../../../lib/types/auth";
import { getCurrentUser } from "../service/home.service";

export function useHome() {
  const router = useRouter();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem("projectx_token") ?? "";
      if (!token) {
        router.push("/dashboard/login");
        return;
      }

      try {
        const data = await getCurrentUser(token);
        setUser(data);
      } catch (err) {
        setMessage(toErrorMessage(err));
      }
    };

    void run();
  }, [router]);

  const signOut = useCallback(() => {
    localStorage.removeItem("projectx_token");
    router.push("/dashboard/login");
  }, [router]);

  return {
    user,
    message,
    signOut,
  };
}
