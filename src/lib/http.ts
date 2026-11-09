import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { HttpError } from "./auth";

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Lê o JSON do corpo e valida com o schema do zod.
 * Lança HttpError(400) se o JSON for inválido ou os dados não passarem na validação.
 */
export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new HttpError(400, "Corpo da requisição inválido (JSON esperado).");
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new HttpError(400, result.error.issues[0]?.message ?? "Dados inválidos.");
  }
  return result.data;
}

/** Converte qualquer erro lançado dentro de uma rota em uma resposta JSON. */
export function handleError(error: unknown, fallbackMessage: string) {
  if (error instanceof HttpError) return errorResponse(error.message, error.status);
  console.error(fallbackMessage, error);
  return errorResponse(fallbackMessage, 500);
}

/** Verifica o código de erro conhecido do Prisma (ex.: P2002 = violação de unique, P2025 = não encontrado). */
export function isPrismaError(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === code;
}

/** Remove o campo `password` de um usuário antes de devolvê-lo na resposta. */
export function publicUser<T extends { password: string }>(user: T): Omit<T, "password"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user;
  return rest;
}
