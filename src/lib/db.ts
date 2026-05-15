import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Parse the DATABASE_URL manually so the pg Pool never has to URL-decode
// a percent-encoded password (which some pg versions mishandle).
function buildPool() {
  const raw = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/kv_web_starter";
  try {
    const u = new URL(raw);
    return new Pool({
      user: u.username,
      password: decodeURIComponent(u.password),
      host: u.hostname,
      port: u.port ? parseInt(u.port, 10) : 5432,
      database: u.pathname.replace(/^\//, ""),
      ssl: u.hostname.includes("supabase.com") ? { rejectUnauthorized: false } : undefined,
      max: 3,
      idleTimeoutMillis: 10000,
    });
  } catch {
    return new Pool({ connectionString: raw });
  }
}

const pool = buildPool();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
