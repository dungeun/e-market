import type { Config } from "drizzle-kit";

export default {
  schema: "./drizzle/migrations/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // 서버 DB 연결 (Podman PostgreSQL)
    url: "postgresql://commerce:secure_password@141.164.60.51:5432/commerce_db",
  },
} satisfies Config;