"use client";

import { useEffect } from "react";
import { useClientPostHogEvent } from "@/lib/tracking/useClientPostHogEvent";
import { TRACKING_EVENTS } from "@/lib/constants/tracking";

export default function LandingPageTracker() {
  const { sendEventOnce } = useClientPostHogEvent();

  useEffect(() => {
    sendEventOnce({
      eventName: TRACKING_EVENTS.LANDING_PAGE_VIEWED,
    });
  }, [sendEventOnce]);

  return null;
}

