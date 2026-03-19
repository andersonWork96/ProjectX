import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProjectX",
  description: "Plataforma social para acompanhantes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div id="app-shell" className="mx-auto w-full max-w-[430px] h-dvh flex flex-col overflow-hidden bg-background relative border-x border-white/[0.03] shadow-[0_0_80px_rgba(147,51,234,0.05)]">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
