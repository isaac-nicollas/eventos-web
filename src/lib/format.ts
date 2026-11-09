/**
 * Formata a data de um evento (ISO, ex.: "2026-11-20T00:00:00.000Z") como dd/mm/aaaa.
 * Usamos a parte da string, e não `new Date()`, para o fuso horário local
 * não "voltar" a data em um dia (meia-noite UTC vira dia anterior no Brasil).
 */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

/** Valor para o <input type="date"> (aaaa-mm-dd). */
export function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}
