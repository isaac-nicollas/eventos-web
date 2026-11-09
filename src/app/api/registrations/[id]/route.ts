import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { errorResponse, handleError } from "@/lib/http";

type Context = { params: Promise<{ id: string }> };

// DELETE /api/registrations/:id - Cancelar inscrição (somente a do próprio usuário)
export async function DELETE(request: Request, { params }: Context) {
  try {
    const { userId } = getAuth(request);
    const { id } = await params;

    // Filtrar também por userId garante que ninguém cancele a inscrição de outra pessoa.
    const { count } = await prisma.registration.deleteMany({ where: { id, userId } });
    if (count === 0) return errorResponse("Inscrição não encontrada.", 404);

    return NextResponse.json({ message: "Inscrição cancelada com sucesso." });
  } catch (error) {
    return handleError(error, "Erro ao cancelar inscrição.");
  }
}
