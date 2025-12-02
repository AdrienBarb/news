import { postHogClient } from "@/lib/tracking/postHogClient";
import { isProduction } from "@/lib/utils/environments";

interface SendPostHogEventParams {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}

export const sendPostHogEvent = ({
  distinctId,
  event,
  properties,
}: SendPostHogEventParams) => {
  try {
    if (isProduction) {
      postHogClient.capture({
        distinctId,
        event,
        properties,
      });
    }
  } catch (error) {
    console.error(error);
  }
};
