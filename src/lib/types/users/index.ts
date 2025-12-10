import { User } from "@prisma/client";

export type LoggedInUser = Pick<
  User,
  "id" | "name" | "email" | "planType" | "accessExpiresAt" | "createdAt"
> & {
  portalUrl: string;
};
