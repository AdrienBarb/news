"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryState } from "nuqs";
import { authClient } from "@/lib/better-auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import useApi from "@/lib/hooks/useApi";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 6;

// Tech knowledge level options
const TECH_LEVEL_OPTIONS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert / Engineer",
] as const;

// Motivation options
const MOTIVATION_OPTIONS = [
  "To stay ahead at work",
  "To find new opportunities",
  "To discover innovations",
  "Just out of curiosity",
] as const;

// Depth preference options
const DEPTH_OPTIONS = [
  "Quick summaries only",
  "Normal articles",
  "Deep-dive analysis",
  "Mix of both",
] as const;

// Daily time options
const DAILY_TIME_OPTIONS = [
  "< 5 minutes",
  "5–10 minutes",
  "10–20 minutes",
  "As much as possible",
] as const;

// Signup form schema
const signUpSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

// localStorage keys
const STORAGE_KEYS = {
  tags: "onboarding.tags",
  techLevel: "onboarding.techLevel",
  motivation: "onboarding.motivation",
  depthPreference: "onboarding.depthPreference",
  dailyTime: "onboarding.dailyTime",
} as const;

// Continue button style
const CONTINUE_BUTTON_CLASSES = "w-full font-extrabold text-xl text-white";

interface Tag {
  id: string;
  name: string;
}

interface OnboardingPageClientProps {
  tags: Tag[];
}

export default function OnboardingPageClient({
  tags,
}: OnboardingPageClientProps) {
  const router = useRouter();
  const { usePost } = useApi();
  const [step, setStep] = useQueryState("step", {
    defaultValue: "1",
    parse: (value) => value || "1",
    serialize: (value) => value || "1",
  });

  const currentStep = parseInt(step, 10) || 1;

  // Step 1: Tags selection state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Step 2-5: Single choice states
  const [techLevel, setTechLevel] = useState<string>("");
  const [motivation, setMotivation] = useState<string>("");
  const [depthPreference, setDepthPreference] = useState<string>("");
  const [dailyTime, setDailyTime] = useState<string>("");

  // Step 6: Signup form
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const storedTags = localStorage.getItem(STORAGE_KEYS.tags);
    if (storedTags) {
      try {
        const parsed = JSON.parse(storedTags);
        if (Array.isArray(parsed)) {
          setSelectedTags(parsed);
        }
      } catch (error) {
        console.error("Failed to parse stored tags:", error);
      }
    }

    const storedTechLevel = localStorage.getItem(STORAGE_KEYS.techLevel);
    if (storedTechLevel) setTechLevel(storedTechLevel);

    const storedMotivation = localStorage.getItem(STORAGE_KEYS.motivation);
    if (storedMotivation) setMotivation(storedMotivation);

    const storedDepth = localStorage.getItem(STORAGE_KEYS.depthPreference);
    if (storedDepth) setDepthPreference(storedDepth);

    const storedTime = localStorage.getItem(STORAGE_KEYS.dailyTime);
    if (storedTime) setDailyTime(storedTime);
  }, []);

  // Save tags to localStorage
  useEffect(() => {
    if (selectedTags.length > 0) {
      localStorage.setItem(STORAGE_KEYS.tags, JSON.stringify(selectedTags));
    }
  }, [selectedTags]);

  const { mutate: saveOnboarding } = usePost("/user/onboarding", {
    onSuccess: () => {
      // Clear all onboarding data from localStorage
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      router.push("/news");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "error" in error.response.data
          ? String(error.response.data.error)
          : undefined;
      toast.error(errorMessage || "Failed to save onboarding data");
      console.error("Failed to save onboarding data:", error);
    },
  });

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setStep(String(currentStep + 1));
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSingleChoice = (
    value: string,
    setter: (value: string) => void,
    storageKey: string
  ) => {
    setter(value);
    localStorage.setItem(storageKey, value);
  };

  const handleStepContinue = () => {
    switch (currentStep) {
      case 1:
        if (selectedTags.length === 0) {
          toast.error("Please select at least one tag");
          return;
        }
        break;
      case 2:
        if (!techLevel) {
          toast.error("Please select your tech knowledge level");
          return;
        }
        break;
      case 3:
        if (!motivation) {
          toast.error("Please select your motivation");
          return;
        }
        break;
      case 4:
        if (!depthPreference) {
          toast.error("Please select your preferred content depth");
          return;
        }
        break;
      case 5:
        if (!dailyTime) {
          toast.error("Please select your daily time preference");
          return;
        }
        break;
    }
    handleNext();
  };

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.email,
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to create account");
      }

      // Get onboarding data from localStorage
      const onboardingData = {
        tags: JSON.parse(
          localStorage.getItem(STORAGE_KEYS.tags) || "[]"
        ) as string[],
        techLevel: localStorage.getItem(STORAGE_KEYS.techLevel) || null,
        motivation: localStorage.getItem(STORAGE_KEYS.motivation) || null,
        depthPreference:
          localStorage.getItem(STORAGE_KEYS.depthPreference) || null,
        dailyTime: localStorage.getItem(STORAGE_KEYS.dailyTime) || null,
      };

      // Map tag names to tag IDs if tags are loaded
      let tagIds: string[] = [];
      if (onboardingData.tags.length > 0) {
        if (tags.length === 0) {
          // Tags not loaded yet, wait a bit and try again or proceed without tags
          toast.error("Tags not loaded. Please try again.");
          setIsLoading(false);
          return;
        }

        tagIds = onboardingData.tags
          .map((tagName) => {
            const tag = tags.find((t) => t.name === tagName);
            return tag?.id;
          })
          .filter((id): id is string => !!id);

        if (tagIds.length === 0 && onboardingData.tags.length > 0) {
          // Selected tags don't match any tags in DB
          toast.error(
            "Some selected tags were not found. Proceeding without tags."
          );
        }
      }

      // Save all onboarding data (including tag preferences) in one call
      saveOnboarding({
        techLevel: onboardingData.techLevel,
        motivation: onboardingData.motivation,
        depthPreference: onboardingData.depthPreference,
        dailyTime: onboardingData.dailyTime,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
      });
      // Don't navigate yet - wait for saveOnboarding success callback
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create account. Please try again."
      );
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col space-y-8">
        {/* Step 1: Tags Selection */}
        {currentStep === 1 && (
          <div className="flex-1 flex flex-col space-y-6">
            <div className="text-center space-y-2 mb-16">
              <h1 className="text-3xl font-bold">
                Which tech topics are you interested in?
              </h1>
              <p className="text-muted-foreground">
                Select all that apply. You can change these later.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {tags.length > 0 ? (
                tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.name);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.name)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer",
                        "border-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
                      )}
                      type="button"
                    >
                      {tag.name}
                    </button>
                  );
                })
              ) : (
                <div className="text-muted-foreground">
                  No tags available. Please refresh the page.
                </div>
              )}
            </div>

            <div className="pt-4 mt-auto">
              <Button
                onClick={handleStepContinue}
                size="lg"
                className={CONTINUE_BUTTON_CLASSES}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Tech Knowledge Level */}
        {currentStep === 2 && (
          <div className="flex-1 flex flex-col space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl font-bold">
                How would you describe your tech knowledge?
              </h1>
            </div>

            <div className="space-y-3">
              {TECH_LEVEL_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    handleSingleChoice(
                      option.toLowerCase(),
                      setTechLevel,
                      STORAGE_KEYS.techLevel
                    )
                  }
                  className={cn(
                    "w-full px-6 py-4 rounded-lg text-left border-2 transition-all cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    techLevel === option.toLowerCase()
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
                  )}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="pt-4 mt-auto">
              <Button
                onClick={handleStepContinue}
                size="lg"
                className={CONTINUE_BUTTON_CLASSES}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Motivation */}
        {currentStep === 3 && (
          <div className="flex-1 flex flex-col space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl font-bold">
                Why do you follow tech news?
              </h1>
            </div>

            <div className="space-y-3">
              {MOTIVATION_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    handleSingleChoice(
                      option,
                      setMotivation,
                      STORAGE_KEYS.motivation
                    )
                  }
                  className={cn(
                    "w-full px-6 py-4 rounded-lg text-left border-2 transition-all cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    motivation === option
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
                  )}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="pt-4 mt-auto">
              <Button
                onClick={handleStepContinue}
                size="lg"
                className={CONTINUE_BUTTON_CLASSES}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Preferred Depth */}
        {currentStep === 4 && (
          <div className="flex-1 flex flex-col space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl font-bold">
                How do you prefer your daily news?
              </h1>
            </div>

            <div className="space-y-3">
              {DEPTH_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    handleSingleChoice(
                      option,
                      setDepthPreference,
                      STORAGE_KEYS.depthPreference
                    )
                  }
                  className={cn(
                    "w-full px-6 py-4 rounded-lg text-left border-2 transition-all cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    depthPreference === option
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
                  )}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="pt-4 mt-auto">
              <Button
                onClick={handleStepContinue}
                size="lg"
                className={CONTINUE_BUTTON_CLASSES}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Daily Time */}
        {currentStep === 5 && (
          <div className="flex-1 flex flex-col space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl font-bold">
                How much time do you want to spend on tech news each day?
              </h1>
            </div>

            <div className="space-y-3">
              {DAILY_TIME_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    handleSingleChoice(
                      option,
                      setDailyTime,
                      STORAGE_KEYS.dailyTime
                    )
                  }
                  className={cn(
                    "w-full px-6 py-4 rounded-lg text-left border-2 transition-all cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    dailyTime === option
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
                  )}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="pt-4 mt-auto">
              <Button
                onClick={handleStepContinue}
                size="lg"
                className={CONTINUE_BUTTON_CLASSES}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Signup Form */}
        {currentStep === 6 && (
          <div className="flex-1 flex flex-col space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl font-bold">Create Your Account</h1>
              <p className="text-muted-foreground">
                Complete your profile to get started
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-auto">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className={CONTINUE_BUTTON_CLASSES}
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
