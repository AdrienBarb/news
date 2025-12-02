"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import useApi from "@/lib/hooks/useApi";
import toast from "react-hot-toast";

export default function SubscriptionCard() {
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const { usePost } = useApi();

  const { mutate: createCheckoutSession } = usePost(
    "/checkout/create-session",
    {
      onSuccess: (data: { url: string }) => {
        if (data.url) {
          window.location.href = data.url;
        }
      },
      onError: (error: unknown) => {
        const errorMessage =
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response &&
          error.response.data &&
          typeof error.response.data === "object" &&
          "error" in error.response.data
            ? String(error.response.data.error)
            : undefined;
        toast.error(errorMessage || "Failed to create checkout session");
        setIsCreatingCheckout(false);
      },
    }
  );

  const handleActivateTrial = async () => {
    setIsCreatingCheckout(true);
    createCheckoutSession({});
  };

  return (
    <div className="w-full h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="aspect-[4/5] w-full rounded-lg bg-background overflow-hidden flex flex-col items-center gap-2">
          <div className="flex-1 flex flex-col items-center justify-center border rounded-lg p-6">
            <div className="text-center space-y-6 w-full">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-primary font-playfair-display">
                  Subscribe to use the app
                </h2>
                <p className="text-base font-bold font-archivo text-muted-foreground">
                  Get access to personalized tech news and start your free
                  trial today.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold mb-1">
                    €4.99 per month
                  </div>
                  <p className="text-sm text-muted-foreground">
                    (billed annually)
                  </p>
                </div>
              </div>

              <Button
                onClick={handleActivateTrial}
                size="lg"
                disabled={isCreatingCheckout}
                className="w-full font-extrabold text-xl text-white"
              >
                {isCreatingCheckout
                  ? "Redirecting to checkout..."
                  : "Activate free trial"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

