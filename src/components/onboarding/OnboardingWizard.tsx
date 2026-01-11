"use client";

import { useState, useCallback } from "react";
import useApi from "@/lib/hooks/useApi";
import CompanyStep from "./CompanyStep";
import CompetitorsStep from "./CompetitorsStep";
import PricingStep from "./PricingStep";
import { cn } from "@/lib/utils";

export interface OnboardingState {
  step: number;
  websiteUrl: string;
  description: string;
  keywords: string[];
  competitors: string[];
}

interface OnboardingWizardProps {
  initialState: OnboardingState;
}

const STEPS = [{ id: 1 }, { id: 2 }, { id: 3 }];

export default function OnboardingWizard({
  initialState,
}: OnboardingWizardProps) {
  const [state, setState] = useState<OnboardingState>(initialState);
  const { usePut } = useApi();

  const { mutate: updateOnboarding } = usePut("/onboarding", {
    onError: (error: Error) => {
      console.error("Failed to save onboarding state:", error);
    },
  });

  const updateState = useCallback(
    (updates: Partial<OnboardingState>) => {
      setState((prev) => {
        const newState = { ...prev, ...updates };
        // Persist to server
        updateOnboarding({
          step: newState.step,
          websiteUrl: newState.websiteUrl,
          description: newState.description,
          keywords: newState.keywords,
          competitors: newState.competitors,
        });
        return newState;
      });
    },
    [updateOnboarding]
  );

  const goToStep = useCallback(
    (step: number) => {
      updateState({ step });
    },
    [updateState]
  );

  const nextStep = useCallback(() => {
    if (state.step < 3) {
      goToStep(state.step + 1);
    }
  }, [state.step, goToStep]);

  const prevStep = useCallback(() => {
    if (state.step > 1) {
      goToStep(state.step - 1);
    }
  }, [state.step, goToStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/50 p-8 md:p-12">
          {/* Step indicator dots */}
          <div className="flex gap-2 mb-8">
            {STEPS.map((s, index) => (
              <div
                key={s.id}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === 0 ? "w-8" : "w-2",
                  state.step >= s.id ? "bg-orange-500" : "bg-gray-200"
                )}
              />
            ))}
          </div>

          {/* Step content */}
          {state.step === 1 && (
            <CompanyStep
              websiteUrl={state.websiteUrl}
              description={state.description}
              onUpdate={updateState}
              onNext={nextStep}
            />
          )}
          {state.step === 2 && (
            <CompetitorsStep
              competitors={state.competitors}
              existingKeywords={state.keywords}
              onUpdate={updateState}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {state.step === 3 && <PricingStep onBack={prevStep} />}
        </div>
      </div>
    </div>
  );
}
