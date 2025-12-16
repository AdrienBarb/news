"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useApi from "@/lib/hooks/useApi";
import { useSession } from "@/lib/better-auth/auth-client";
import toast from "react-hot-toast";
import { WEEKDAYS, TIMES } from "./constants";

export function EmailContent() {
  const { useGet, usePut } = useApi();
  const { data: session } = useSession();
  const [newsletterDay, setNewsletterDay] = useState<string>("Friday");
  const [newsletterTime, setNewsletterTime] = useState<string>("09:00");

  const { data: newsletterData, isLoading: isLoadingNewsletter } = useGet(
    "/user/newsletter-settings",
    {},
    {
      enabled: !!session?.user?.id,
    }
  );

  const updateNewsletterMutation = usePut("/user/newsletter-settings", {
    onSuccess: () => {
      toast.success("Newsletter settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update newsletter settings");
    },
  });

  useEffect(() => {
    if (newsletterData?.newsletterDay && newsletterData?.newsletterTime) {
      setNewsletterDay(newsletterData.newsletterDay);
      setNewsletterTime(newsletterData.newsletterTime);
    }
  }, [newsletterData]);

  const handleDayChange = (value: string) => {
    setNewsletterDay(value);
    updateNewsletterMutation.mutate({
      newsletterDay: value,
      newsletterTime: newsletterTime,
    });
  };

  const handleTimeChange = (value: string) => {
    setNewsletterTime(value);
    updateNewsletterMutation.mutate({
      newsletterDay: newsletterDay,
      newsletterTime: value,
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "pm" : "am";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="text-sm font-medium">Newsletter Day</label>
          <p className="text-sm text-muted-foreground mt-1">
            Choose which day of the week to receive your newsletter
          </p>
        </div>
        <Select
          value={newsletterDay || undefined}
          onValueChange={handleDayChange}
          disabled={isLoadingNewsletter || updateNewsletterMutation.isPending}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {WEEKDAYS.map((day) => (
              <SelectItem key={day} value={day}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="text-sm font-medium">Newsletter Time</label>
          <p className="text-sm text-muted-foreground mt-1">
            Choose what time to receive your newsletter
          </p>
        </div>
        <Select
          value={newsletterTime || undefined}
          onValueChange={handleTimeChange}
          disabled={isLoadingNewsletter || updateNewsletterMutation.isPending}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            {TIMES.map((time) => (
              <SelectItem key={time} value={time}>
                {formatTime(time)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
