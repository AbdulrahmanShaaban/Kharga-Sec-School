import { PrismaClient, type Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

function createPrismaStub(): PrismaClient {
  const noop = (): never => {
    throw new Error("DATABASE_URL not configured");
  };

  const empty = <T>(value: T): Promise<T> => Promise.resolve(value);

  const handler: ProxyHandler<PrismaClient> = {
    get: (_target: PrismaClient, prop: string | symbol) => {
      if (typeof prop === "symbol") return undefined;
      const name = String(prop);

      // PrismaClient methods
      if (name === "$connect" || name === "$disconnect") return () => Promise.resolve();
      if (name === "$transaction") return noop;
      if (name === "$queryRaw" || name === "$executeRaw") return noop;
      if (name === "then" || name === "catch" || name === "toString" || name === "valueOf") return undefined;

      // Return a model delegate proxy
      return new Proxy(() => {}, {
        get: (_t: any, p: string | symbol) => {
          if (typeof p === "symbol") return undefined;
          const m = String(p);
          if (m === "then" || m === "catch" || m === "toString" || m === "valueOf") return undefined;

          const method = (..._args: unknown[]): Promise<unknown> => {
            const upper = m.toUpperCase();
            if (upper.includes("FIRST") || upper.includes("UNIQUE") || upper.includes("UPSERT") || upper.includes("FINDUNIQUE")) {
              return empty(null);
            }
            if (upper.includes("COUNT")) return empty(0);
            if (upper.includes("MANY") || upper.includes("FIND")) return empty([]);
            if (upper.includes("CREATE") || upper.includes("UPDATE") || upper.includes("DELETE") || upper.includes("DELETEMANY") || upper.includes("UPDATEMANY")) {
              return Promise.resolve(noop());
            }
            return empty({});
          };
          return method;
        },
      });
    },
  };

  // Create a bare object cast as PrismaClient — never call the real constructor
  return new Proxy({} as PrismaClient, handler);
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return createPrismaStub();
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;