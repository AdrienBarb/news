export function getStartedUrl(isAuthenticated: boolean): string {
  return isAuthenticated ? "/news" : "/onboarding";
}
