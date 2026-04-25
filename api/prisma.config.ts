// api/prisma.config.ts
import dotenv from 'dotenv';
import { defineConfig } from "prisma/config";

// Force dotenv to override any existing system environment variables
dotenv.config({ override: true });

// Debugging log to see exactly what URL Prisma is about to use
console.log("🚀 URL INJECTED INTO PRISMA:", process.env.DATABASE_URL);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  }
});