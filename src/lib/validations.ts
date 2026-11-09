import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "O nome deve ter ao menos 2 caracteres."),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
});

export const eventSchema = z.object({
  title: z.string().trim().min(3, "O título deve ter ao menos 3 caracteres."),
  description: z.string().trim().min(5, "A descrição deve ter ao menos 5 caracteres."),
  // Aceita "2026-11-20" ou uma data ISO completa.
  date: z
    .string()
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Data inválida."),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário deve estar no formato HH:mm."),
  location: z.string().trim().min(2, "Informe o local."),
  image: z.string().trim().url("A imagem deve ser uma URL válida."),
});

export type EventInput = z.infer<typeof eventSchema>;
