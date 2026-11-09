import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { errorResponse, handleError, isPrismaError } from "@/lib/http";

type Context = { params: Promise<{ id: string }> };

// POST /api/events/:id/registrations - Inscrever o usuário autenticado no evento
export async function POST(request: Request, { params }: Context) {
  try {
    const { userId } = getAuth(request);
    const { id: eventId } = await params;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return errorResponse("Evento não encontrado.", 404);

    const registration = await prisma.registration.create({
      data: { eventId, userId },
    });
    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    // Violação da regra @@unique([userId, eventId]) do schema
    if (isPrismaError(error, "P2002")) {
      return errorResponse("Você já está inscrito neste evento.", 409);
    }
    return handleError(error, "Erro ao realizar inscrição.");
  }
}
