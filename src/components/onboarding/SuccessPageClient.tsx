"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useApi from "@/lib/hooks/useApi";
import { Loader2, Globe, Search, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusResponse {
  hasAccess: boolean;
  market: {
    id: string;
    status: string;
    isReady: boolean;
  } | null;
}

const LOADING_MESSAGES = [
  { icon: Globe, text: "Analyzing your website...", delay: 0 },
  { icon: Search, text: "Scanning Reddit for opportunities...", delay: 3000 },
  { icon: Sparkles, text: "Finding high-intent leads...", delay: 6000 },
];

export default function SuccessPageClient() {
  const router = useRouter();
  const { useGet } = useApi();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { data, refetch } = useGet<StatusResponse>(
    "/onboarding/status",
    {},
    {
      refetchInterval: 5000, // Poll every 5 seconds
      refetchIntervalInBackground: true,
    }
  );

  // Cycle through loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Redirect when market is ready
  useEffect(() => {
    if (data?.market?.isReady && !isRedirecting) {
      setIsRedirecting(true);
      router.push(`/markets/${data.market.id}`);
    }
  }, [data, router, isRedirecting]);

  // Redirect to onboarding if no access
  useEffect(() => {
    if (data && !data.hasAccess) {
      router.push("/onboarding");
    }
  }, [data, router]);

  const currentMessage = LOADING_MESSAGES[currentMessageIndex];
  const Icon = currentMessage.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/50 p-8 md:p-12">
          {/* Success checkmark */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 text-center mb-8">
            We&apos;re setting up your lead discovery...
          </p>

          {/* Loading animation */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="absolute -bottom-1 -right-1">
                  <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{currentMessage.text}</p>
                <p className="text-sm text-gray-500">This may take a moment...</p>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-6">
              {LOADING_MESSAGES.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentMessageIndex
                      ? "bg-orange-500 w-6"
                      : index < currentMessageIndex
                      ? "bg-orange-300"
                      : "bg-gray-200"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Status indicator */}
          <div className="text-center">
            <p className="text-sm text-gray-400">
              {data?.market ? (
                <>Status: {data.market.status}</>
              ) : (
                <>Waiting for setup to complete...</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

