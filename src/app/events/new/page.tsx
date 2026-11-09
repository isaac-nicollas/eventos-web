"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import EventForm from "@/components/EventForm";
import { api, type EventPayload } from "@/lib/client-api";

export default function NewEventPage() {
  const router = useRouter();

  async function handleCreate(data: EventPayload) {
    await api("/events", { method: "POST", body: JSON.stringify(data) });
    router.replace("/");
  }

  return (
    <AdminShell>
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Voltar
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">Novo evento</h1>
      <EventForm submitLabel="Cadastrar evento" onSubmit={handleCreate} />
    </AdminShell>
  );
}
