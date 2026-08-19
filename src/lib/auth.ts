import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { and, eq, sql } from "drizzle-orm"
import { db } from "./db"
import * as schema from "./db/schema"
import { invites, user as userTable } from "./db/schema"

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
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      disabled: !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const invite = await db
            .select({ id: invites.id })
            .from(invites)
            .where(
              and(
                eq(invites.email, user.email.toLowerCase()),
                eq(invites.status, "pending"),
              ),
            )
            .get()
          if (invite) return

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