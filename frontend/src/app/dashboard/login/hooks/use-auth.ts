import { useCallback, useState } from "react";
import { toErrorMessage } from "../../../../lib/errors";
import { login, me, register } from "../service/auth.service";

export function useAuth() {
  const [token, setToken] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("projectx_token") ?? "";
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const signIn = useCallback(async (email: string, password: string) => {
    setMessage(null);
    setLoading(true);
    try {
      const user = await login({ email, password });
      localStorage.setItem("projectx_token", user.token);
      setToken(user.token);
      setMessage(`Bem-vindo, ${user.name} (${user.email})`);
    } catch (err) {
      setMessage(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      setMessage(null);
      setLoading(true);
      try {
        const user = await register({ name, email, password });
        localStorage.setItem("projectx_token", user.token);
        setToken(user.token);
        setMessage(`Bem-vindo, ${user.name} (${user.email})`);
      } catch (err) {
        setMessage(toErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const testToken = useCallback(async () => {
    setMessage(null);
    try {
      const data = await me(token);
      setMessage(`Token OK: ${JSON.stringify(data)}`);
    } catch (err) {
      setMessage(toErrorMessage(err));
    }
  }, [token]);

  const signOut = useCallback(() => {
    localStorage.removeItem("projectx_token");
    setToken("");
    setMessage("Token removido.");
  }, []);

  return {
    token,
    loading,
    message,
    signIn,
    signUp,
    testToken,
    signOut,
    setMessage,
  };
}
