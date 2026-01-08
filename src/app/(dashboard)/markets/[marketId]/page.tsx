"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarketStatusBadge } from "@/components/markets/MarketStatusBadge";
import useApi from "@/lib/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  RefreshCwIcon,
  Loader2Icon,
  ExternalLinkIcon,
  Trash2Icon,
  UsersIcon,
  KeyIcon,
  SettingsIcon,
  XIcon,
  PlusIcon,
  CheckIcon,
  SearchIcon,
} from "lucide-react";
import type { MarketStatus, IntentType, SourceType } from "@prisma/client";
import { APP_ROUTER } from "@/lib/constants/appRouter";
import Link from "next/link";

interface PageProps {
  params: Promise<{ marketId: string }>;
}

interface Market {
  id: string;
  name: string;
  websiteUrl: string;
  description: string | null;
  keywords: string[];
  status: MarketStatus;
  leadCount: number;
  unreadLeadCount: number;
}

interface Lead {
  id: string;
  url: string;
  subreddit: string | null;
  title: string;
  content: string;
  author: string | null;
  score: number;
  numComments: number;
  publishedAt: string | null;
  intent: IntentType | null;
  relevance: number | null;
  isRead: boolean;
  isArchived: boolean;
  source: SourceType;
}

/** Animated radar pulse dot component */
function RadarDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
    </span>
  );
}

function IntentBadge({ intent }: { intent: IntentType | null }) {
  if (!intent) return null;

  const variants: Record<IntentType, { label: string; className: string }> = {
    recommendation: {
      label: "Looking for",
      className: "bg-blue-500/10 text-blue-600",
    },
    alternative: {
      label: "Alternative",
      className: "bg-purple-500/10 text-purple-600",
    },
    complaint: { label: "Frustrated", className: "bg-red-500/10 text-red-600" },
    question: { label: "Question", className: "bg-gray-500/10 text-gray-600" },
    comparison: {
      label: "Comparing",
      className: "bg-orange-500/10 text-orange-600",
    },
  };

  const variant = variants[intent];
  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  );
}

function LeadCard({
  lead,
  onMarkRead,
}: {
  lead: Lead;
  onMarkRead: (id: string) => void;
}) {
  return (
    <Card className={lead.isRead ? "opacity-60" : ""}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {lead.subreddit && (
              <Badge variant="outline" className="font-mono">
                r/{lead.subreddit}
              </Badge>
            )}
            <IntentBadge intent={lead.intent} />
          </div>
          {!lead.isRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkRead(lead.id)}
              className="h-6 px-2 text-xs"
            >
              <CheckIcon className="h-3 w-3 mr-1" />
              Mark read
            </Button>
          )}
        </div>

        {/* Title */}
        <a
          href={lead.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
            {lead.title}
            <ExternalLinkIcon className="inline h-3 w-3 ml-1 opacity-50" />
          </h3>
        </a>

        {/* Content preview */}
        <p className="text-xs text-muted-foreground line-clamp-3">
          {lead.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>u/{lead.author || "unknown"}</span>
          <div className="flex items-center gap-3">
            <span>↑ {lead.score}</span>
            <span>💬 {lead.numComments}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MarketDetailPage({ params }: PageProps) {
  const { marketId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { useGet, usePost, usePut, useDelete } = useApi();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editKeywords, setEditKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");

  // Auto-refetch every 30 seconds
  const { data: marketData, isLoading: marketLoading } = useGet(
    `/markets/${marketId}`,
    {},
    { refetchInterval: 30000 }
  );

  // Fetch leads
  const { data: leadsData, isLoading: leadsLoading } = useGet(
    `/markets/${marketId}/leads`,
    {},
    { refetchInterval: 30000 }
  );

  const { mutate: updateMarket, isPending: updating } = usePut(
    `/markets/${marketId}`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["get", { url: `/markets/${marketId}`, params: undefined }],
        });
        toast.success("Settings updated!");
        setShowSettingsDialog(false);
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to update settings");
      },
    }
  );

  const { mutate: deleteMarket, isPending: deleting } = useDelete(
    `/markets/${marketId}`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["get", { url: "/markets", params: undefined }],
        });
        toast.success("Market deleted successfully");
        router.push(APP_ROUTER.MARKETS);
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to delete market");
      },
    }
  );

  const market: Market | undefined = marketData?.market;
  const leads: Lead[] = leadsData?.leads || [];

  const handleDelete = () => {
    deleteMarket({});
    setShowDeleteDialog(false);
  };

  const openSettings = () => {
    if (market) {
      setEditDescription(market.description || "");
      setEditKeywords([...market.keywords]);
    }
    setShowSettingsDialog(true);
  };

  const saveSettings = () => {
    updateMarket({
      description: editDescription,
      keywords: editKeywords,
    });
  };

  const addKeyword = () => {
    const trimmed = newKeyword.trim().toLowerCase();
    if (!trimmed) return;
    if (editKeywords.length >= 20) {
      toast.error("Maximum 20 keywords allowed");
      return;
    }
    if (editKeywords.includes(trimmed)) {
      toast.error("Keyword already exists");
      return;
    }
    setEditKeywords([...editKeywords, trimmed]);
    setNewKeyword("");
  };

  const removeKeyword = (keyword: string) => {
    setEditKeywords(editKeywords.filter((k) => k !== keyword));
  };

  const markLeadAsRead = (leadId: string) => {
    // TODO: Implement mark as read API
    toast.success("Marked as read");
  };

  if (marketLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <p className="text-muted-foreground">Market not found</p>
          <Button variant="link" onClick={() => router.push("/markets")}>
            Back to Markets
          </Button>
        </div>
      </div>
    );
  }

  const isActive = market.status === "active";

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">{market.name}</h1>
            <MarketStatusBadge status={market.status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openSettings}>
            <Link
              href={market.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLinkIcon className="h-3 w-3" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={openSettings}>
            <SettingsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleting}
            className="text-destructive hover:text-destructive"
          >
            {deleting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2Icon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Leads
              </CardTitle>
              {isActive && <RadarDot />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{market.leadCount}</span>
              {market.unreadLeadCount > 0 && (
                <Badge variant="secondary">{market.unreadLeadCount} new</Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Keywords Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <KeyIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {market.keywords.length}
              </span>
              <span className="text-muted-foreground">/ 20</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keywords Preview */}
      {market.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {market.keywords.map((keyword) => (
            <Badge key={keyword} variant="secondary" className="text-xs">
              {keyword}
            </Badge>
          ))}
        </div>
      )}

      {/* Leads */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <UsersIcon className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Recent Leads</h2>
        </div>

        {leadsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-muted/20">
            <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No leads yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {market.status === "pending" || market.status === "analyzing"
                ? "We're setting up your market. Leads will appear soon."
                : "The AI agent will find leads during the next scheduled run at 1 AM UTC."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onMarkRead={markLeadAsRead} />
            ))}
          </div>
        )}
      </section>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Market</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{market.name}&quot;? This
              will permanently remove all leads associated with this market.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {deleting ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Market Settings</DialogTitle>
            <DialogDescription>
              Update your product description and keywords for lead discovery.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="A brief description of your product..."
              />
              <p className="text-xs text-muted-foreground text-right">
                {editDescription.length}/500
              </p>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Keywords ({editKeywords.length}/20)
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add a keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  disabled={editKeywords.length >= 20}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addKeyword}
                  disabled={editKeywords.length >= 20 || !newKeyword.trim()}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-muted/50 rounded-lg border">
                {editKeywords.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    No keywords added
                  </span>
                ) : (
                  editKeywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:bg-background/50 rounded-full p-0.5"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSettingsDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveSettings} disabled={updating}>
              {updating ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
