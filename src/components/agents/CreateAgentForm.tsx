"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useApi from "@/lib/hooks/useApi";
import { cn } from "@/lib/utils";
import WebsiteStep from "./steps/WebsiteStep";
import ReviewStep from "./steps/ReviewStep";
import PlatformStep from "./steps/PlatformStep";
import LeadTierStep from "./steps/LeadTierStep";
import type { PlatformKey } from "@/lib/constants/platforms";
import type { LeadTierKey } from "@/lib/constants/leadTiers";

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
  const { usePost } = useApi();

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
  const [selectedPlatform, setSelectedPlatform] =
    useState<PlatformKey | null>("reddit"); // Default to Reddit

  // Step 4 selection - Lead Tier
  const [selectedLeadTier, setSelectedLeadTier] =
    useState<LeadTierKey | null>(null);

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
    onSuccess: (data: { checkoutUrl: string; agentId: string }) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
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

  // Step 3: Proceed to lead tier selection
  const handleStep3Submit = () => {
    if (!selectedPlatform) return;
    setStep(4);
  };

  // Step 4: Create agent and redirect to payment
  const handleStep4Submit = () => {
    if (!selectedPlatform || !selectedLeadTier) return;

    const step2Data = step2Form.getValues();

    createAgent({
      websiteUrl,
      description: step2Data.description,
      keywords,
      competitors,
      targetPersonas,
      platform: selectedPlatform,
      leadTier: selectedLeadTier,
    });
  };

  return (
    <div className="space-y-6">
      {/* Step indicator dots */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
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
        />
      )}

      {/* Step 4: Lead Tier Selection */}
      {step === 4 && (
        <LeadTierStep
          selectedLeadTier={selectedLeadTier}
          setSelectedLeadTier={setSelectedLeadTier}
          onSubmit={handleStep4Submit}
          onBack={() => setStep(3)}
          isCreating={creatingAgent}
        />
      )}
    </div>
  );
}
