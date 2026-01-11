"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import useApi from "@/lib/hooks/useApi";
import { toast } from "sonner";
import { Loader2, Globe, ArrowRight, ArrowLeft } from "lucide-react";
import type { OnboardingState } from "./OnboardingWizard";

const urlSchema = z
  .string()
  .min(1, "URL is required")
  .refine(
    (url) => {
      const urlToCheck = url.startsWith("http") ? url : `https://${url}`;
      try {
        const parsed = new URL(urlToCheck);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: "Please enter a valid URL" }
  );

interface CompanyStepProps {
  websiteUrl: string;
  description: string;
  onUpdate: (updates: Partial<OnboardingState>) => void;
  onNext: () => void;
}

interface AnalysisResult {
  description: string;
  keywords: string[];
}

export default function CompanyStep({
  websiteUrl,
  description,
  onUpdate,
  onNext,
}: CompanyStepProps) {
  const [url, setUrl] = useState(websiteUrl);
  const [desc, setDesc] = useState(description);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(!!description);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlTouched, setUrlTouched] = useState(false);
  const { usePost } = useApi();

  // Validate URL and check if it's valid
  const validateUrl = (value: string): boolean => {
    if (!value.trim()) {
      setUrlError("URL is required");
      return false;
    }
    const result = urlSchema.safeParse(value);
    if (!result.success) {
      setUrlError(
        result.error.issues[0]?.message || "Please enter a valid URL"
      );
      return false;
    }
    setUrlError(null);
    return true;
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (urlTouched) {
      validateUrl(value);
    }
  };

  const handleUrlBlur = () => {
    setUrlTouched(true);
    if (url.trim()) {
      validateUrl(url);
    }
  };

  const isUrlValid = url.trim() && urlSchema.safeParse(url).success;

  const { mutate: analyzeWebsite } = usePost("/markets/analyze", {
    onSuccess: (data: AnalysisResult) => {
      setDesc(data.description);
      onUpdate({
        websiteUrl: url,
        description: data.description,
        keywords: data.keywords,
      });
      setHasAnalyzed(true);
      setIsAnalyzing(false);
      toast.success("Website analyzed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to analyze website");
      setIsAnalyzing(false);
    },
  });

  const handleAnalyze = () => {
    setUrlTouched(true);
    if (!validateUrl(url)) {
      return;
    }
    setIsAnalyzing(true);
    analyzeWebsite({ url });
  };

  const handleDescriptionChange = (value: string) => {
    setDesc(value);
    onUpdate({ description: value });
  };

  const handleNext = () => {
    if (!hasAnalyzed) {
      toast.error("Please analyze your website first");
      return;
    }
    if (!desc.trim()) {
      toast.error("Please provide a company description");
      return;
    }
    onNext();
  };

  const handleChangeWebsite = () => {
    setHasAnalyzed(false);
    setDesc("");
    onUpdate({
      websiteUrl: "",
      description: "",
      keywords: [],
    });
  };

  // Initial state - enter URL
  if (!hasAnalyzed) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tell us about your company
          </h1>
          <p className="text-gray-600">
            We&apos;ll analyze your website to understand your product and find
            the most relevant Reddit posts to target.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="websiteUrl" className="text-sm font-medium">
              Website URL
            </Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="websiteUrl"
                type="text"
                placeholder="yourproduct.com"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                onBlur={handleUrlBlur}
                disabled={isAnalyzing}
                className={`pl-10 h-12 ${urlTouched && urlError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAnalyze();
                  }
                }}
              />
            </div>
            {urlTouched && urlError && (
              <p className="text-sm text-red-500">{urlError}</p>
            )}
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !isUrlValid}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing your website...
              </>
            ) : (
              <>
                Analyze Website
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // After analysis - show description
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tell us about your company
        </h1>
        <p className="text-gray-600">
          We&apos;ll use it to learn about your product and suggest you the most
          relevant Reddit posts to target.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Company Description</Label>
        </div>

        <Textarea
          value={desc}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="A brief description of your product..."
          rows={6}
          maxLength={800}
          className="resize-none"
          disabled={isAnalyzing}
        />

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{desc.length}/800 characters</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={handleChangeWebsite}
          disabled={isAnalyzing}
          className="text-gray-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!desc.trim() || isAnalyzing}
          className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
