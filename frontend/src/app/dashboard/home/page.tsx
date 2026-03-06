"use client";

import Link from "next/link";
import styles from "./home.module.css";
import { useHome } from "./hooks/use-home";

export default function DashboardHomePage() {
  const { user, message, signOut } = useHome();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>ProjectX</div>
        <nav className={styles.menu}>
          <Link href="/dashboard/home" className={`${styles.menuItem} ${styles.menuActive}`}>
            Home
          </Link>
          <Link href="/dashboard/relatorio" className={styles.menuItem}>
            Relatorio
          </Link>
        </nav>
        <button type="button" className={styles.signOut} onClick={signOut}>
          Sair
        </button>
      </aside>

      <main className={styles.content}>
        <header className={styles.header}>
          <p className={styles.kicker}>Painel administrativo</p>
          <h1>
            Bem-vindo{user?.name ? `, ${user.name}` : ""}.
          </h1>
          <p className={styles.subtitle}>
            Aqui voce acompanha sua conta e os acessos do sistema.
          </p>
        </header>

        <section className={styles.cards}>
          <article className={styles.card}>
            <h2>Email</h2>
            <p>{user?.email ?? "Carregando..."}</p>
          </article>
          <article className={styles.card}>
            <h2>Permissao</h2>
            <p>{user?.permission ?? "Carregando..."}</p>
          </article>
          <article className={styles.card}>
            <h2>Status</h2>
            <p>{user ? "Conectado" : "Validando token..."}</p>
          </article>
        </section>

        {message && <p className={styles.error}>{message}</p>}
      </main>
    </div>
  );
}
