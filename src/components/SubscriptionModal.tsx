"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import SubscriptionPaymentContent from "@/components/SubscriptionPaymentContent";

export default function SubscriptionModal() {
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
