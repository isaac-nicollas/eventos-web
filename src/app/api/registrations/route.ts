import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { handleError } from "@/lib/http";

// GET /api/registrations - Listar as inscrições do usuário autenticado (com os dados do evento)
export async function GET(request: Request) {
  try {
    const { userId } = getAuth(request);

    const registrations = await prisma.registration.findMany({
      where: { userId },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(registrations);
  } catch (error) {
    return handleError(error, "Erro ao buscar inscrições.");
  }
}
