import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { errorResponse, handleError, isPrismaError, parseBody } from "@/lib/http";
import { eventSchema } from "@/lib/validations";

type Context = { params: Promise<{ id: string }> };

// GET /api/events/:id - Consultar evento (público)
export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return errorResponse("Evento não encontrado.", 404);
    return NextResponse.json(event);
  } catch (error) {
    return handleError(error, "Erro ao buscar evento.");
  }
}

// PUT /api/events/:id - Atualizar evento (apenas administrador)
export async function PUT(request: Request, { params }: Context) {
  try {
    requireAdmin(request);
    const { id } = await params;
    const data = await parseBody(request, eventSchema);

    const event = await prisma.event.update({
      where: { id },
      data: { ...data, date: new Date(data.date) },
    });
    return NextResponse.json(event);
  } catch (error) {
    if (isPrismaError(error, "P2025")) return errorResponse("Evento não encontrado.", 404);
    return handleError(error, "Erro ao atualizar evento.");
  }
}

// DELETE /api/events/:id - Excluir evento (apenas administrador)
// As inscrições do evento são removidas junto (onDelete: Cascade no schema).
export async function DELETE(request: Request, { params }: Context) {
  try {
    requireAdmin(request);
    const { id } = await params;

    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ message: "Evento excluído com sucesso." });
  } catch (error) {
    if (isPrismaError(error, "P2025")) return errorResponse("Evento não encontrado.", 404);
    return handleError(error, "Erro ao excluir evento.");
  }
}
