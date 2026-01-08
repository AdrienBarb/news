"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useApi from "@/lib/hooks/useApi";
import { toast } from "sonner";
import {
  Loader2Icon,
  GlobeIcon,
  SparklesIcon,
  XIcon,
  PlusIcon,
  ArrowLeftIcon,
  RocketIcon,
} from "lucide-react";

type Step = "url" | "configure";

interface AnalysisResult {
  description: string;
  keywords: string[];
}

export function CreateMarketForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { usePost } = useApi();

  const [step, setStep] = useState<Step>("url");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Configuration state (from AI analysis, user-editable)
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");

  const { mutate: analyzeWebsite } = usePost("/markets/analyze", {
    onSuccess: (data: AnalysisResult) => {
      setDescription(data.description);
      setKeywords(data.keywords.slice(0, 20)); // Max 20
      setStep("configure");
      setIsAnalyzing(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to analyze website");
      setIsAnalyzing(false);
    },
  });

  const { mutate: createMarket } = usePost("/markets", {
    onSuccess: (data: { market: { id: string } }) => {
      // Invalidate markets query to refetch in sidebar
      queryClient.invalidateQueries({
        queryKey: ["get", { url: "/markets", params: undefined }],
      });
      toast.success("Market created! Starting lead discovery...");
      router.push(`/markets/${data.market.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create market");
      setIsCreating(false);
    },
  });

  const handleAnalyze = () => {
    if (!websiteUrl.trim()) {
      toast.error("Please enter a website URL");
      return;
    }
    setIsAnalyzing(true);
    analyzeWebsite({ url: websiteUrl });
  };

  const handleCreate = () => {
    if (keywords.length === 0) {
      toast.error("Please add at least one keyword");
      return;
    }
    setIsCreating(true);
    createMarket({
      websiteUrl,
      description,
      keywords,
    });
  };

  const addKeyword = () => {
    const trimmed = newKeyword.trim().toLowerCase();
    if (!trimmed) return;
    if (keywords.length >= 20) {
      toast.error("Maximum 20 keywords allowed");
      return;
    }
    if (keywords.includes(trimmed)) {
      toast.error("Keyword already exists");
      return;
    }
    setKeywords([...keywords, trimmed]);
    setNewKeyword("");
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  // Step 1: Enter URL
  if (step === "url") {
    return (
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GlobeIcon className="h-5 w-5 text-secondary" />
            Enter Your Website
          </CardTitle>
          <CardDescription>
            We&apos;ll analyze your website to understand your product and
            suggest relevant keywords to find leads on Reddit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              type="text"
              placeholder="yourproduct.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              disabled={isAnalyzing}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAnalyze();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Enter your product website or landing page URL
            </p>
          </div>

          <Button
            onClick={handleAnalyze}
            className="w-full"
            disabled={isAnalyzing || !websiteUrl.trim()}
          >
            {isAnalyzing ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Analyzing website...
              </>
            ) : (
              <>
                <SparklesIcon className="mr-2 h-4 w-4" />
                Analyze with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Configure keywords
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep("url")}
            className="h-8 w-8 p-0"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-secondary" />
              Configure Your Lead Search
            </CardTitle>
            <CardDescription>
              Review and customize the AI-generated settings. These keywords
              will be used to find potential customers on Reddit.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Product Description</Label>
          <Textarea
            id="description"
            placeholder="A brief description of your product..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            disabled={isCreating}
          />
          <p className="text-xs text-muted-foreground text-right">
            {description.length}/500
          </p>
        </div>

        {/* Keywords */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Keywords ({keywords.length}/20)</Label>
            <span className="text-xs text-muted-foreground">
              We&apos;ll search Reddit for these terms
            </span>
          </div>

          {/* Keyword input */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add a keyword..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={handleKeywordKeyDown}
              disabled={isCreating || keywords.length >= 20}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addKeyword}
              disabled={
                isCreating || keywords.length >= 20 || !newKeyword.trim()
              }
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Keywords list */}
          <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-muted/50 rounded-lg border">
            {keywords.length === 0 ? (
              <span className="text-sm text-muted-foreground">
                No keywords added yet
              </span>
            ) : (
              keywords.map((keyword) => (
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
                    disabled={isCreating}
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Create button */}
        <Button
          onClick={handleCreate}
          className="w-full"
          disabled={isCreating || keywords.length === 0}
        >
          {isCreating ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Creating market...
            </>
          ) : (
            <>
              <RocketIcon className="mr-2 h-4 w-4" />
              Start Finding Leads
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
