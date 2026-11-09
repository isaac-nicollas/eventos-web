import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleError, parseBody } from "@/lib/http";
import { eventSchema } from "@/lib/validations";

// GET /api/events - Listar eventos (público)
export async function GET() {
  try {
    const events = await prisma.event.findMany({ orderBy: { date: "asc" } });
    return NextResponse.json(events);
  } catch (error) {
    return handleError(error, "Erro ao listar eventos.");
  }
}

// POST /api/events - Criar evento (apenas administrador)
export async function POST(request: Request) {
  try {
    requireAdmin(request);
    const data = await parseBody(request, eventSchema);

    const event = await prisma.event.create({
      data: { ...data, date: new Date(data.date) },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return handleError(error, "Erro ao criar evento.");
  }
}
