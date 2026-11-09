"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { clearSession, getSessionUser, getToken } from "@/lib/client-api";

/**
 * Cabeçalho do painel + proteção de rota: só renderiza o conteúdo se existir
 * um token e o usuário for administrador. Caso contrário, redireciona para /login.
 */
type SessionStatus = "loading" | "in" | "out";

const subscribe = () => () => {};
// No cliente: lê o localStorage. No servidor (e na hidratação): "loading".
const getStatus = (): SessionStatus => (getToken() && getSessionUser()?.isAdmin ? "in" : "out");
const getServerStatus = (): SessionStatus => "loading";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useSyncExternalStore(subscribe, getStatus, getServerStatus);

  useEffect(() => {
    if (status === "out") router.replace("/login");
  }, [status, router]);

  function handleLogout() {
    clearSession();
    router.replace("/login");
  }

  if (status !== "in") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-600">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold text-blue-700">
            Plataforma de Eventos
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
