/**
 * Utility function to get the appropriate "Get Started" URL
 * This can be used in server components or outside React hooks
 * @param isAuthenticated - Whether the user is authenticated
 * @returns "/news" if authenticated, "/setup" if not authenticated
 */
export function getStartedUrl(isAuthenticated: boolean): string {
  return isAuthenticated ? "/news" : "/setup";
}
