"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ExternalLinkIcon, QuoteIcon } from "lucide-react";
import type { PainType } from "@prisma/client";

interface Evidence {
  id: string;
  quote: string;
  sourceUrl: string;
  painStatement: {
    statement: string;
    painType: PainType;
    confidence: number;
  };
}

interface EvidenceListProps {
  evidence: Evidence[];
}

export function EvidenceList({ evidence }: EvidenceListProps) {
  if (evidence.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No evidence collected yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {evidence.map((item) => (
        <Card key={item.id} className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <QuoteIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm italic mb-2">&ldquo;{item.quote}&rdquo;</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">
                    Confidence: {Math.round(item.painStatement.confidence * 100)}%
                  </span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline shrink-0"
                  >
                    View source
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

