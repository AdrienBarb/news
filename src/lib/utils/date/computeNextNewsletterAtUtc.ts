import { addDays } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export type WeekdayName =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

const weekdayToIndex: Record<WeekdayName, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

function isValidHHmm(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

export function computeNextNewsletterAtUtc(params: {
  newsletterDay: WeekdayName;
  newsletterTime: string;
  timezone?: string | null;
  now?: Date;
}): Date {
  const { newsletterDay, newsletterTime, timezone, now } = params;

  if (!isValidHHmm(newsletterTime)) {
    throw new Error(
      `Invalid newsletterTime "${newsletterTime}". Expected "HH:mm" (e.g. "09:00").`
    );
  }

  const [hh, mm] = newsletterTime.split(":").map(Number);
  const zone = timezone ?? "UTC";

  let nowZoned: Date;
  try {
    nowZoned = toZonedTime(now ?? new Date(), zone);
  } catch {
    nowZoned = toZonedTime(now ?? new Date(), "UTC");
  }

  const wanted = weekdayToIndex[newsletterDay];
  const today = nowZoned.getDay();

  const candidateZoned = new Date(nowZoned);
  candidateZoned.setHours(hh, mm, 0, 0);

  let daysAhead = (wanted - today + 7) % 7;

  if (daysAhead === 0 && candidateZoned.getTime() <= nowZoned.getTime()) {
    daysAhead = 7;
  }

  const nextZoned = addDays(candidateZoned, daysAhead);

  try {
    return fromZonedTime(nextZoned, zone);
  } catch {
    return fromZonedTime(nextZoned, "UTC");
  }
}
