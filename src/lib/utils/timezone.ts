/**
 * Get the user's timezone from the browser
 * Returns IANA timezone identifier (e.g., "Europe/Paris", "America/New_York")
 */
export function getBrowserTimezone(): string {
  if (typeof window === "undefined") {
    return "UTC";
  }

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error("Failed to get timezone:", error);
    return "UTC";
  }
}
