import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { handleError, errorResponse, parseBody, publicUser } from "@/lib/http";
import { loginSchema } from "@/lib/validations";

// POST /api/auth/login - Autenticar usuário e devolver o token JWT
export async function POST(request: Request) {
  try {
    const { email, password } = await parseBody(request, loginSchema);

    const user = await prisma.user.findUnique({ where: { email } });
    // Mesma mensagem para e-mail inexistente e senha errada (não revela qual dos dois falhou).
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return errorResponse("Credenciais inválidas.", 401);
    }

    const token = signToken({ userId: user.id, isAdmin: user.isAdmin });

    return NextResponse.json({ user: publicUser(user), token });
  } catch (error) {
    return handleError(error, "Erro ao fazer login.");
  }
}
