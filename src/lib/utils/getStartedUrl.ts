import { APP_ROUTER } from "@/lib/constants/appRouter";

export function getStartedUrl(isAuthenticated: boolean): string {
  return isAuthenticated ? APP_ROUTER.MARKETS : APP_ROUTER.SIGNUP;
}
