import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { handleError, errorResponse, parseBody, publicUser } from "@/lib/http";
import { registerSchema } from "@/lib/validations";

// POST /api/auth/register - Cadastrar usuário
export async function POST(request: Request) {
  try {
    const { name, email, password } = await parseBody(request, registerSchema);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return errorResponse("E-mail já cadastrado.", 409);

    const user = await prisma.user.create({
      data: { name, email, password: await bcrypt.hash(password, 10) },
    });

    return NextResponse.json(publicUser(user), { status: 201 });
  } catch (error) {
    return handleError(error, "Erro ao cadastrar.");
  }
}
