"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import SubscriptionPaymentContent from "@/components/SubscriptionPaymentContent";
import { useUser } from "@/lib/hooks/useUser";
import { useQueryState } from "nuqs";
import { hasActiveAccess } from "@/lib/utils/subscription";

export default function SubscriptionModal() {
  const { user, isLoading } = useUser();
  const [checkout] = useQueryState("checkout");

  // Don't show modal while loading user data
  if (isLoading) {
    return null;
  }

  // Don't show modal if checkout was successful (waiting for webhook)
  if (checkout === "success") {
    return null;
  }

  // Don't show modal if user has active access
  if (hasActiveAccess(user?.accessExpiresAt as Date | null | undefined)) {
    return null;
  }

  return (
    <Dialog
      open={true}
      onOpenChange={() => {
        // Prevent closing the dialog
      }}
    >
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        hideCloseButton
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <SubscriptionPaymentContent />
      </DialogContent>
    </Dialog>
  );
}
