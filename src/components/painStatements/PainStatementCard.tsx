"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PainTypeBadge } from "@/components/signals/PainTypeBadge";
import { ExternalLinkIcon, LinkIcon } from "lucide-react";
import type { PainType, SourceType } from "@prisma/client";

interface PainStatementCardProps {
  painStatement: {
    id: string;
    statement: string;
    painType: PainType;
    confidence: number;
    toolsMentioned: string[];
    switchingIntent: boolean;
    conversation: {
      id: string;
      title: string | null;
      url: string;
      source: SourceType;
    };
    signal: {
      id: string;
      title: string;
    } | null;
  };
  marketId: string;
}

const sourceLabels: Record<SourceType, string> = {
  reddit: "Reddit",
  hackernews: "Hacker News",
};

export function PainStatementCard({
  painStatement,
  marketId,
}: PainStatementCardProps) {
  const confidencePercent = Math.round(painStatement.confidence * 100);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-relaxed line-clamp-3">
            &quot;{painStatement.statement}&quot;
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Pain type and confidence */}
        <div className="flex items-center justify-between">
          <PainTypeBadge painType={painStatement.painType} />
          <span className="text-xs text-muted-foreground">
            {confidencePercent}% confidence
          </span>
        </div>

        {/* Tools mentioned */}
        {painStatement.toolsMentioned.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {painStatement.toolsMentioned.slice(0, 3).map((tool) => (
              <Badge key={tool} variant="outline" className="text-xs">
                {tool}
              </Badge>
            ))}
            {painStatement.toolsMentioned.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{painStatement.toolsMentioned.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Source and signal link */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {sourceLabels[painStatement.conversation.source]}
            </Badge>
            <a
              href={painStatement.conversation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <ExternalLinkIcon className="h-3 w-3" />
              Source
            </a>
          </div>

          {painStatement.signal && (
            <a
              href={`/markets/${marketId}/signals/${painStatement.signal.id}`}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <LinkIcon className="h-3 w-3" />
              {painStatement.signal.title.length > 20
                ? painStatement.signal.title.slice(0, 20) + "..."
                : painStatement.signal.title}
            </a>
          )}
        </div>

        {/* Switching intent badge */}
        {painStatement.switchingIntent && (
          <Badge variant="destructive" className="text-xs">
            🔄 Switching Intent
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
