import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db/prisma";
import { resendClient } from "@/lib/resend/resendClient";
import { ResetPasswordEmail } from "@/lib/emails/ResetPasswordEmail";
import config from "@/lib/config";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resendClient.emails.send({
        from: config.contact.email,
        to: user.email,
        subject: "Reset your password",
        react: ResetPasswordEmail({ resetUrl: url }),
      });
    },
  },
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000",
  secret:
    process.env.BETTER_AUTH_SECRET || "change-this-secret-key-in-production",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000",
  ],
});
