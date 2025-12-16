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
import { TIMEZONES } from "@/lib/constants/settings";

export function GeneralContent() {
  const { useGet, usePut } = useApi();
  const { data: session } = useSession();
  const [timezone, setTimezone] = useState<string>("");

  const { data: timezoneData, isLoading: isLoadingTimezone } = useGet(
    "/user/timezone",
    {},
    {
      enabled: !!session?.user?.id,
    }
  );

  const updateTimezoneMutation = usePut("/user/timezone", {
    onSuccess: () => {
      toast.success("Timezone updated successfully");
    },
    onError: () => {
      toast.error("Failed to update timezone");
    },
  });

  useEffect(() => {
    if (timezoneData?.timezone) {
      setTimezone(timezoneData.timezone);
    }
  }, [timezoneData]);

  const handleTimezoneChange = (value: string) => {
    setTimezone(value);
    updateTimezoneMutation.mutate({ timezone: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="text-sm font-medium">Timezone</label>
          <p className="text-sm text-muted-foreground mt-1">
            Select your timezone
          </p>
        </div>
        <Select
          value={timezone || undefined}
          onValueChange={handleTimezoneChange}
          disabled={isLoadingTimezone || updateTimezoneMutation.isPending}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
