import { User } from "@prisma/client";

export type LoggedInUser = Pick<
  User,
  "id" | "name" | "email" | "isSubscribed" | "stripeCustomerId" | "createdAt"
>;
