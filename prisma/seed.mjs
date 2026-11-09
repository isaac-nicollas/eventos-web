// Cria o usuário administrador do painel web (e alguns eventos de exemplo).
// Uso: npm run db:seed
import "dotenv/config";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const adminEmail = process.env.ADMIN_EMAIL ?? "admin@eventos.com";
const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";

async function main() {
  const password = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { isAdmin: true },
    create: { name: "Administrador", email: adminEmail, password, isAdmin: true },
  });
  console.log(`Admin pronto: ${adminEmail}`);

  if ((await prisma.event.count()) === 0) {
    await prisma.event.createMany({
      data: [
        {
          title: "Semana de Tecnologia IFMA",
          description: "Palestras e oficinas sobre desenvolvimento web e mobile.",
          date: new Date("2026-11-20T00:00:00.000Z"),
          time: "14:00",
          location: "IFMA Campus Timon",
          image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        },
        {
          title: "Hackathon de Inovação",
          description: "Maratona de programação em equipes com mentoria.",
          date: new Date("2026-12-05T00:00:00.000Z"),
          time: "09:00",
          location: "Auditório Central",
          image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
        },
      ],
    });
    console.log("Eventos de exemplo criados.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
