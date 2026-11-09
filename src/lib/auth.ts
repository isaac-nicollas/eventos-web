import jwt from "jsonwebtoken";

export type AuthPayload = { userId: string; isAdmin: boolean };

/** Erro com status HTTP, usado para responder 401/403 de forma padronizada. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  // Só permitimos o valor de desenvolvimento fora de produção.
  if (process.env.NODE_ENV !== "production") {
    return "chave_super_secreta_eventos";
  }
  throw new Error("JWT_SECRET não configurado.");
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

/** Lê o header `Authorization: Bearer <token>` e devolve os dados do usuário. */
export function getAuth(request: Request): AuthPayload {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw new HttpError(401, "Não autorizado.");
  }

  try {
    const decoded = jwt.verify(header.split(" ")[1], getSecret()) as Partial<AuthPayload>;
    if (!decoded.userId) throw new Error("sem userId");
    return { userId: decoded.userId, isAdmin: Boolean(decoded.isAdmin) };
  } catch {
    // Token inválido ou expirado: sempre 401 (o app usa isso para deslogar).
    throw new HttpError(401, "Token inválido ou expirado.");
  }
}

/** Igual a getAuth, mas exige que o usuário seja administrador. */
export function requireAdmin(request: Request): AuthPayload {
  const auth = getAuth(request);
  if (!auth.isAdmin) {
    throw new HttpError(403, "Apenas administradores podem executar esta ação.");
  }
  return auth;
}
