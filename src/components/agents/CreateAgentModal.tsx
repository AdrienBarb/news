"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateAgentForm from "./CreateAgentForm";

interface CreateAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateAgentModal({
  open,
  onOpenChange,
}: CreateAgentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Create AI Agent</DialogTitle>
        </DialogHeader>
        <CreateAgentForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

