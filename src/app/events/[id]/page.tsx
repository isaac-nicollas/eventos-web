"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { api, type EventDTO } from "@/lib/client-api";
import { formatDate } from "@/lib/format";

export default function EventDetailsPage() {
  return (
    <AdminShell>
      <EventDetails />
    </AdminShell>
  );
}

function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    api<EventDTO>(`/events/${id}`)
      .then((data) => {
        if (active) setEvent(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar o evento.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  function retry() {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }

  async function handleDelete() {
    if (!event || !confirm(`Excluir o evento "${event.title}"?`)) return;
    try {
      await api(`/events/${event.id}`, { method: "DELETE" });
      router.replace("/");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir evento.");
    }
  }

  return (
    <>
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Voltar
      </Link>

      {loading && <p className="mt-4 text-zinc-500">Carregando...</p>}

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-red-700">
          <p>{error}</p>
          <button onClick={retry} className="mt-2 font-semibold underline">
            Tentar novamente
          </button>
        </div>
      )}

      {event && (
        <article className="mt-4 overflow-hidden rounded-lg bg-white shadow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.image} alt={event.title} className="h-64 w-full object-cover" />
          <div className="space-y-3 p-6">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <p className="text-zinc-600">📅 {formatDate(event.date)} às {event.time}</p>
            <p className="text-zinc-600">📍 {event.location}</p>
            <p className="whitespace-pre-line pt-2 text-zinc-800">{event.description}</p>
            <div className="flex gap-3 pt-4">
              <Link
                href={`/events/${event.id}/edit`}
                className="rounded-md bg-amber-500 px-4 py-2 font-semibold text-white hover:bg-amber-600"
              >
                Editar
              </Link>
              <button
                onClick={handleDelete}
                className="rounded-md bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
              >
                Excluir
              </button>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
