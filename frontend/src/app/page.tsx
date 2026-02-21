import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>ProjectX</h1>
        <p>Bem-vindo ao sistema.</p>
        <Link className={styles.primary} href="/dashboard/login">
          Ir para Login
        </Link>
      </main>
    </div>
  );
}
