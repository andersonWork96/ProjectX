"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_SERVER_URL } from "../../../lib/constants";
import { useAuth } from "./hooks/use-auth";
import styles from "../../page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register" | "changePassword">(
    "login"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const {
    token,
    loading,
    message,
    signIn,
    signUp,
    testToken,
    signOut,
    updatePassword,
  } = useAuth();

  useEffect(() => {
    if (token) {
      router.push("/dashboard/home");
    }
  }, [router, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register") {
      const ok = await signUp(name, email, password);
      if (ok) router.push("/dashboard/home");
      return;
    }
    if (mode === "changePassword") {
      await updatePassword(email, password, newPassword);
      return;
    }
    const ok = await signIn(email, password);
    if (ok) router.push("/dashboard/home");
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>ProjectX - Login</h1>
        <p>API: {AUTH_SERVER_URL}</p>

        <div className={styles.switch}>
          <button
            className={mode === "login" ? styles.active : ""}
            onClick={() => setMode("login")}
            type="button"
          >
            Entrar
          </button>
          <button
            className={mode === "register" ? styles.active : ""}
            onClick={() => setMode("register")}
            type="button"
          >
            Criar conta
          </button>
          <button
            className={mode === "changePassword" ? styles.active : ""}
            onClick={() => setMode("changePassword")}
            type="button"
          >
            Mudar senha
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Nome
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              required
            />
          </label>

          <label>
            {mode === "changePassword" ? "Senha atual" : "Senha"}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                mode === "changePassword" ? "Sua senha atual" : "Sua senha"
              }
              required
            />
          </label>

          {mode === "changePassword" && (
            <label>
              Nova senha
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Sua nova senha"
                required
              />
            </label>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? "Aguarde..."
              : mode === "login"
                ? "Entrar"
                : mode === "register"
                  ? "Criar conta"
                  : "Atualizar senha"}
          </button>
        </form>

        <div className={styles.actions}>
          <button type="button" onClick={testToken} disabled={!token}>
            Testar endpoint protegido
          </button>
          <button type="button" onClick={signOut} disabled={!token}>
            Sair
          </button>
        </div>

        {message && <p className={styles.message}>{message}</p>}
      </main>
    </div>
  );
}
