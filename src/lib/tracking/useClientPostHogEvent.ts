"use client";

import { isProduction } from "@/lib/utils/environments";
import { usePostHog } from "posthog-js/react";
import { useRef } from "react";

interface SendPostHogEventParams {
  eventName: string;
  properties?: Record<string, unknown>;
}

export const useClientPostHogEvent = () => {
  const posthog = usePostHog();
  const sentEvents = useRef<Set<string>>(new Set());

  const sendEvent = ({ eventName, properties }: SendPostHogEventParams) => {
    if (isProduction) {
      posthog.capture(eventName, properties);
    } else {
      console.log("Client PostHog event:", eventName, properties);
    }
  };

  const sendEventOnce = ({ eventName, properties }: SendPostHogEventParams) => {
    const key = `${eventName}_${JSON.stringify(properties || {})}`;

    if (sentEvents.current.has(key)) {
      return;
    }

    sentEvents.current.add(key);
    sendEvent({ eventName, properties });
  };

  const identify = (distinctId: string) => {
    if (isProduction) {
      posthog.identify(distinctId);
    } else {
      console.log("Client PostHog identify:", distinctId);
    }
  };

  return { sendEvent, sendEventOnce, identify };
};
