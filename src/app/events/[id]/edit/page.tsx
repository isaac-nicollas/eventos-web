"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import EventForm from "@/components/EventForm";
import { api, type EventDTO, type EventPayload } from "@/lib/client-api";
import { toDateInput } from "@/lib/format";

export default function EditEventPage() {
  return (
    <AdminShell>
      <EditEvent />
    </AdminShell>
  );
}

function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [initial, setInitial] = useState<EventPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<EventDTO>(`/events/${id}`)
      .then((event) =>
        setInitial({
          title: event.title,
          description: event.description,
          date: toDateInput(event.date),
          time: event.time,
          location: event.location,
          image: event.image,
        }),
      )
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar o evento."));
  }, [id]);

  async function handleUpdate(data: EventPayload) {
    await api(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) });
    router.replace(`/events/${id}`);
  }

  return (
    <>
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Voltar
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">Editar evento</h1>

      {error && <p className="rounded-md bg-red-50 p-4 text-red-700">{error}</p>}
      {!initial && !error && <p className="text-zinc-500">Carregando...</p>}
      {initial && <EventForm initial={initial} submitLabel="Salvar alterações" onSubmit={handleUpdate} />}
    </>
  );
}
