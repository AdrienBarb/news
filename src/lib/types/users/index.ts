import { User } from "@prisma/client";

export type LoggedInUser = Pick<
  User,
  "id" | "name" | "email" | "subscriptionStatus" | "stripeCustomerId"
> & {
  portalUrl: string;
};
