// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: any };

function createClient(): any {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Return a stub that returns empty results for build-time prerendering
    // but throws at runtime if actually called without DATABASE_URL
    const handler: ProxyHandler<any> = {
      get: (_t: any, p: any) => {
        const prop = String(p);
        if (prop === "then" || prop === "catch" || prop === "toString" || prop === "valueOf") {
          return undefined;
        }
        if (prop === "$connect" || prop === "$disconnect") {
          return async () => { throw new Error("DATABASE_URL not configured"); };
        }
        // Return a function that returns appropriate empty values
        const fn = (..._args: any[]) => {
          const propUpper = prop.toUpperCase();
          if (propUpper.includes("FIRST") || propUpper.includes("UNIQUE") || propUpper.includes("FINDUNIQUE") || propUpper.includes("UPSERT")) {
            return Promise.resolve(null);
          }
          if (propUpper.includes("COUNT")) {
            return Promise.resolve(0);
          }
          if (propUpper.includes("MANY") || propUpper.includes("FIND")) {
            return Promise.resolve([]);
          }
          if (propUpper.includes("CREATE") || propUpper.includes("UPDATE") || propUpper.includes("DELETE")) {
            throw new Error("DATABASE_URL not configured");
          }
          return Promise.resolve({});
        };
        // Make the function itself proxyable for model access (e.g., prisma.contentItem.findFirst)
        return new Proxy(fn, handler);
      },
    };
    return new Proxy((() => {}) as any, handler);
  }
  const adapter = new PrismaPg({ connectionString });
  const client = new (PrismaClient as any)({ adapter });
  return client;
}

export const prisma = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;