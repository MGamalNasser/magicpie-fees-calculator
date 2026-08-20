import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { sql } from "drizzle-orm"
import { db } from "./db"
import * as schema from "./db/schema"
import { user as userTable } from "./db/schema"

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  user: {
    additionalFields: {
      role: { type: "string", required: false, input: false },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async () => {
          const count = await db
            .select({ n: sql<number>`count(*)` })
            .from(userTable)
            .all()
          if (count.length === 0 || count[0].n === 0) return

          return false
        },
      },
    },
  },
  plugins: [nextCookies()],
})