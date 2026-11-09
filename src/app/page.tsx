"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { api, type EventDTO } from "@/lib/client-api";
import { formatDate } from "@/lib/format";

export default function EventsPage() {
  return (
    <AdminShell>
      <EventList />
    </AdminShell>
  );
}

function EventList() {
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    api<EventDTO[]>("/events")
      .then((data) => {
        if (active) setEvents(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar eventos.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  function retry() {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }

  async function handleDelete(event: EventDTO) {
    if (!confirm(`Excluir o evento "${event.title}"? As inscrições também serão removidas.`)) return;
    try {
      await api(`/events/${event.id}`, { method: "DELETE" });
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir evento.");
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Eventos</h1>
        <Link
          href="/events/new"
          className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          + Novo evento
        </Link>
      </div>

      {loading && <p className="text-zinc-500">Carregando eventos...</p>}

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          <p>{error}</p>
          <button onClick={retry} className="mt-2 font-semibold underline">
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="text-zinc-500">Nenhum evento cadastrado ainda.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <article key={event.id} className="overflow-hidden rounded-lg bg-white shadow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.image} alt={event.title} className="h-40 w-full object-cover" />
            <div className="space-y-1 p-4">
              <h2 className="text-lg font-bold">{event.title}</h2>
              <p className="text-sm text-zinc-600">📅 {formatDate(event.date)} às {event.time}</p>
              <p className="text-sm text-zinc-600">📍 {event.location}</p>
              <div className="flex gap-2 pt-3">
                <Link
                  href={`/events/${event.id}`}
                  className="flex-1 rounded-md bg-emerald-500 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  Detalhes
                </Link>
                <Link
                  href={`/events/${event.id}/edit`}
                  className="flex-1 rounded-md bg-amber-500 py-2 text-center text-sm font-semibold text-white hover:bg-amber-600"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(event)}
                  className="flex-1 rounded-md bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600"
                >
                  Excluir
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
