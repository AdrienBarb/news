"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useApi from "@/lib/hooks/useApi";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import WebsiteStep from "./steps/WebsiteStep";
import ReviewStep from "./steps/ReviewStep";
import PlatformStep from "./steps/PlatformStep";
import RunPackStep from "./steps/RunPackStep";
import type { PlatformKey } from "@/lib/constants/platforms";
import type { RunPackKey } from "@/lib/constants/leadTiers";

interface PlatformSuggestion {
  platform: PlatformKey;
  reason: string;
  confidence: "high" | "medium" | "low";
}

export interface TargetPersona {
  title: string;
  description: string;
}

// Step 1 Schema - Website URL
export const step1Schema = z.object({
  websiteUrl: z.string().url("Please enter a valid URL"),
});

export type Step1Data = z.infer<typeof step1Schema>;

// Step 2 Schema - Edit description, keywords, competitors
export const step2Schema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  keywords: z
    .array(z.string())
    .min(1, "At least 1 keyword is required")
    .max(20, "Maximum 20 keywords allowed"),
  competitors: z.array(z.string()).max(3, "Maximum 3 competitors allowed"),
});

export type Step2Data = z.infer<typeof step2Schema>;

interface CreateAgentFormProps {
  onSuccess?: () => void;
}

export default function CreateAgentForm({ onSuccess }: CreateAgentFormProps) {
  const { usePost, useGet } = useApi();
  const router = useRouter();

  // Form state
  const [step, setStep] = useState(1);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Step 2 form data (populated after analysis)
  const [keywords, setKeywords] = useState<string[]>([]);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [targetPersonas, setTargetPersonas] = useState<TargetPersona[]>([]);
  const [suggestedPlatforms, setSuggestedPlatforms] = useState<
    PlatformSuggestion[]
  >([]);

  // Step 3 selection - Platform
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey | null>(
    "reddit"
  );

  // Step 4 selection - Run Pack (only used when user has 0 runs)
  const [selectedRunPack, setSelectedRunPack] = useState<RunPackKey | null>(
    null
  );

  // Fetch remaining runs
  const { data: runsData } = useGet("/user/runs");
  const remainingRuns =
    (runsData as { remainingRuns: number } | undefined)?.remainingRuns ?? 0;

  // Step 1 Form
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { websiteUrl: "" },
  });

  // Step 2 Form
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      description: "",
      keywords: [],
      competitors: [],
    },
  });

  // API calls
  const { mutate: analyzeWebsite } = usePost("/analyze-website", {
    onSuccess: (data: {
      description: string;
      keywords: string[];
      targetPersonas: TargetPersona[];
      suggestedPlatforms: PlatformSuggestion[];
    }) => {
      step2Form.setValue("description", data.description);
      step2Form.setValue("keywords", data.keywords);
      setKeywords(data.keywords);
      setTargetPersonas(data.targetPersonas || []);
      setSuggestedPlatforms(data.suggestedPlatforms);
      setIsAnalyzing(false);
      setStep(2);
    },
    onError: () => {
      setIsAnalyzing(false);
    },
  });

  const { mutate: createAgent, isPending: creatingAgent } = usePost("/agents", {
    onSuccess: (data: { checkoutUrl?: string; agentId: string }) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // Direct launch (user had runs) — redirect to agent detail
        router.push(`/d/agents/${data.agentId}`);
      }
      onSuccess?.();
    },
  });

  // Step 1: Analyze website
  const handleStep1Submit = (data: Step1Data) => {
    setWebsiteUrl(data.websiteUrl);
    setIsAnalyzing(true);
    analyzeWebsite({ websiteUrl: data.websiteUrl });
  };

  // Step 2: Proceed to platform selection
  const handleStep2Submit = () => {
    step2Form.setValue("keywords", keywords);
    step2Form.setValue("competitors", competitors);
    setStep(3);
  };

  // Step 3: Check runs and either launch or go to step 4
  const handleStep3Submit = () => {
    if (!selectedPlatform) return;

    if (remainingRuns > 0) {
      // User has runs — launch immediately
      const step2Data = step2Form.getValues();
      createAgent({
        websiteUrl,
        description: step2Data.description,
        keywords,
        competitors,
        targetPersonas,
        platform: selectedPlatform,
      });
    } else {
      // No runs — go to step 4 to buy a run pack
      setStep(4);
    }
  };

  // Step 4: Create agent with run pack purchase
  const handleStep4Submit = () => {
    console.log("🚀 ~ handleStep4Submit ~ selectedPlatform:", selectedPlatform);
    if (!selectedPlatform || !selectedRunPack) return;

    const step2Data = step2Form.getValues();

    createAgent({
      websiteUrl,
      description: step2Data.description,
      keywords,
      competitors,
      targetPersonas,
      platform: selectedPlatform,
      runPack: selectedRunPack,
    });
  };

  // Determine total steps based on whether user has runs
  const totalSteps = remainingRuns > 0 ? 3 : 4;

  return (
    <div className="space-y-6">
      {/* Step indicator dots */}
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              s === step ? "w-8 bg-orange-500" : "w-2",
              step >= s ? "bg-orange-500" : "bg-gray-200"
            )}
          />
        ))}
      </div>

      {/* Runs balance indicator */}
      {remainingRuns > 0 && (
        <div className="text-sm text-gray-500">
          You have{" "}
          <span className="font-semibold text-orange-600">
            {remainingRuns} run{remainingRuns !== 1 ? "s" : ""}
          </span>{" "}
          remaining
        </div>
      )}

      {/* Step 1: Enter Website URL */}
      {step === 1 && (
        <WebsiteStep
          form={step1Form}
          onSubmit={handleStep1Submit}
          isAnalyzing={isAnalyzing}
        />
      )}

      {/* Step 2: Edit Description, Keywords & Competitors */}
      {step === 2 && (
        <ReviewStep
          form={step2Form}
          keywords={keywords}
          setKeywords={setKeywords}
          competitors={competitors}
          setCompetitors={setCompetitors}
          targetPersonas={targetPersonas}
          setTargetPersonas={setTargetPersonas}
          onSubmit={handleStep2Submit}
          onBack={() => setStep(1)}
        />
      )}

      {/* Step 3: Platform Selection */}
      {step === 3 && (
        <PlatformStep
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          suggestedPlatforms={suggestedPlatforms}
          onSubmit={handleStep3Submit}
          onBack={() => setStep(2)}
          isCreating={creatingAgent}
          hasRuns={remainingRuns > 0}
        />
      )}

      {/* Step 4: Run Pack Selection (only if no runs) */}
      {step === 4 && (
        <RunPackStep
          selectedRunPack={selectedRunPack}
          setSelectedRunPack={setSelectedRunPack}
          onSubmit={handleStep4Submit}
          onBack={() => setStep(3)}
          isCreating={creatingAgent}
        />
      )}
    </div>
  );
}
