"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useApi from "@/lib/hooks/useApi";
import { toast } from "sonner";
import {
  Loader2,
  Globe,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Users,
} from "lucide-react";
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

interface CompetitorsStepProps {
  competitors: string[];
  existingKeywords: string[];
  onUpdate: (updates: Partial<OnboardingState>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface CompetitorAnalysisResult {
  competitorKeywords: string[];
}

export default function CompetitorsStep({
  competitors: initialCompetitors,
  existingKeywords,
  onUpdate,
  onNext,
  onBack,
}: CompetitorsStepProps) {
  const [competitors, setCompetitors] = useState<string[]>(
    initialCompetitors.length > 0 ? initialCompetitors : [""]
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errors, setErrors] = useState<(string | null)[]>([]);
  const [touched, setTouched] = useState<boolean[]>([]);
  const { usePost } = useApi();

  // Validate a single URL
  const validateUrl = (value: string): string | null => {
    if (!value.trim()) return null; // Empty is allowed, just won't be submitted
    const result = urlSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues[0]?.message || "Please enter a valid URL";
    }
    return null;
  };

  // Check if all filled URLs are valid
  const allUrlsValid = competitors.every((c) => {
    if (!c.trim()) return true; // Empty URLs are fine
    return urlSchema.safeParse(c).success;
  });

  const hasAtLeastOneValidUrl = competitors.some(
    (c) => c.trim() && urlSchema.safeParse(c).success
  );

  const { mutate: analyzeCompetitors } = usePost(
    "/onboarding/analyze-competitors",
    {
      onSuccess: (data: CompetitorAnalysisResult) => {
        // Merge competitor keywords with existing keywords
        const allKeywords = [
          ...existingKeywords,
          ...data.competitorKeywords,
        ].filter((k, i, arr) => arr.indexOf(k) === i); // Remove duplicates

        onUpdate({
          competitors: competitors.filter((c) => c.trim()),
          keywords: allKeywords,
        });

        setIsAnalyzing(false);
        toast.success("Competitors analyzed successfully!");
        onNext();
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to analyze competitors");
        setIsAnalyzing(false);
      },
    }
  );

  const handleAddCompetitor = () => {
    if (competitors.length >= 3) {
      toast.error("Maximum 3 competitors allowed");
      return;
    }
    setCompetitors([...competitors, ""]);
  };

  const handleRemoveCompetitor = (index: number) => {
    if (competitors.length <= 1) {
      return;
    }
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const handleCompetitorChange = (index: number, value: string) => {
    const updated = [...competitors];
    updated[index] = value;
    setCompetitors(updated);

    // Validate if already touched
    if (touched[index]) {
      const newErrors = [...errors];
      newErrors[index] = validateUrl(value);
      setErrors(newErrors);
    }
  };

  const handleCompetitorBlur = (index: number) => {
    const newTouched = [...touched];
    newTouched[index] = true;
    setTouched(newTouched);

    if (competitors[index]?.trim()) {
      const newErrors = [...errors];
      newErrors[index] = validateUrl(competitors[index]);
      setErrors(newErrors);
    }
  };

  const handleNext = () => {
    // Mark all as touched
    setTouched(competitors.map(() => true));

    // Validate all filled URLs
    const newErrors = competitors.map((c) =>
      c.trim() ? validateUrl(c) : null
    );
    setErrors(newErrors);

    const validCompetitors = competitors.filter((c) => c.trim());
    if (validCompetitors.length === 0) {
      toast.error("Please enter at least one competitor URL");
      return;
    }

    // Check if any have errors
    const hasErrors = newErrors.some((e) => e !== null);
    if (hasErrors) {
      toast.error("Please fix the invalid URLs");
      return;
    }

    setIsAnalyzing(true);
    analyzeCompetitors({ urls: validCompetitors });
  };

  const validCount = competitors.filter((c) => c.trim()).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Who are your competitors?
        </h1>
        <p className="text-gray-600">
          We&apos;ll analyze their websites to find people looking for
          alternatives and help you target them.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            Competitor Websites ({validCount}/3)
          </Label>
        </div>

        <div className="space-y-3">
          {competitors.map((competitor, index) => (
            <div key={index} className="space-y-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="competitor.com"
                    value={competitor}
                    onChange={(e) =>
                      handleCompetitorChange(index, e.target.value)
                    }
                    onBlur={() => handleCompetitorBlur(index)}
                    disabled={isAnalyzing}
                    className={`pl-10 h-12 ${touched[index] && errors[index] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </div>
                {competitors.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveCompetitor(index)}
                    disabled={isAnalyzing}
                    className="h-12 w-12 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {touched[index] && errors[index] && (
                <p className="text-sm text-red-500 pl-1">{errors[index]}</p>
              )}
            </div>
          ))}
        </div>

        {competitors.length < 3 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddCompetitor}
            disabled={isAnalyzing}
            className="w-full h-10"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Competitor
          </Button>
        )}

        <p className="text-sm text-gray-500">
          Enter 1-3 competitor websites. We&apos;ll generate keywords to help
          you find people searching for alternatives.
        </p>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isAnalyzing}
          className="text-gray-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!hasAtLeastOneValidUrl || !allUrlsValid || isAnalyzing}
          className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing competitors...
            </>
          ) : (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
