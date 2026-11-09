"use client";

import { useState } from "react";
import type { EventPayload } from "@/lib/client-api";

type Props = {
  initial?: EventPayload;
  submitLabel: string;
  onSubmit: (data: EventPayload) => Promise<void>;
};

const empty: EventPayload = {
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  image: "",
};

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-blue-500";

export default function EventForm({ initial = empty, submitLabel, onSubmit }: Props) {
  const [form, setForm] = useState<EventPayload>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update(field: keyof EventPayload, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar o evento.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Título</span>
        <input
          className={inputClass}
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Descrição</span>
        <textarea
          className={inputClass}
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          required
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Data</span>
          <input
            type="date"
            className={inputClass}
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Horário</span>
          <input
            type="time"
            className={inputClass}
            value={form.time}
            onChange={(e) => update("time", e.target.value)}
            required
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Local</span>
        <input
          className={inputClass}
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">URL da imagem</span>
        <input
          type="url"
          className={inputClass}
          placeholder="https://..."
          value={form.image}
          onChange={(e) => update("image", e.target.value)}
          required
        />
      </label>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-md bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {saving ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
