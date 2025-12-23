"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useClientPostHogEvent } from "@/lib/tracking/useClientPostHogEvent";
import { TRACKING_EVENTS } from "@/lib/constants/tracking";

interface HeroGetInsightsButtonProps {
  getStartedUrl: string;
}

export default function HeroGetInsightsButton({
  getStartedUrl,
}: HeroGetInsightsButtonProps) {
  const { sendEvent } = useClientPostHogEvent();

  const handleClick = () => {
    sendEvent({
      eventName: TRACKING_EVENTS.HERO_GET_INSIGHTS_CLICKED,
      properties: {
        url: getStartedUrl,
      },
    });
  };

  return (
    <Button
      asChild
      size="lg"
      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl md:rounded-full px-6 md:px-8 py-4 md:py-6 text-base md:text-lg flex items-center justify-center gap-2 shadow-xl w-full md:w-auto"
    >
      <Link href={getStartedUrl} onClick={handleClick}>
        Get insights
        <Sparkles className="w-5 h-5" />
      </Link>
    </Button>
  );
}
