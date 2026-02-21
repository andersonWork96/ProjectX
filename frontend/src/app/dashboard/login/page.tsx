"use client";

import { useState } from "react";
import { AUTH_SERVER_URL } from "../../../lib/constants";
import { useAuth } from "./hooks/use-auth";
import styles from "../../page.module.css";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { token, loading, message, signIn, signUp, testToken, signOut } =
    useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register") {
      await signUp(name, email, password);
      return;
    }
    await signIn(email, password);
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
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
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
