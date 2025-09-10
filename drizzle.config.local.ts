import type { Config } from "drizzle-kit";

export default {
  schema: "./drizzle/migrations/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // 로컬 DB 연결
    url: "postgresql://commerce@localhost:5432/commerce_nextjs",
  },
} satisfies Config;