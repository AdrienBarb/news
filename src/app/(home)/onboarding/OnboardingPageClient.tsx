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
import { Eye, EyeOff } from "lucide-react";
import useApi from "@/lib/hooks/useApi";
import { cn } from "@/lib/utils";
import { useClientPostHogEvent } from "@/lib/tracking/useClientPostHogEvent";
import PaymentStep from "@/components/PaymentStep";
import { TRACKING_EVENTS } from "@/lib/constants/tracking";

const TOTAL_STEPS = 3;

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

const STORAGE_KEYS = {
  tags: "onboarding.tags",
} as const;

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
  const { usePost } = useApi();
  const { sendEvent, sendEventOnce } = useClientPostHogEvent();
  const [step, setStep] = useQueryState("step", {
    defaultValue: "1",
    parse: (value) => value || "1",
    serialize: (value) => value || "1",
  });

  const currentStep = parseInt(step, 10) || 1;

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  useEffect(() => {
    sendEventOnce({
      eventName: TRACKING_EVENTS.ONBOARDING_STARTED,
    });
  }, []);

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
  }, []);

  useEffect(() => {
    if (selectedTags.length > 0) {
      localStorage.setItem(STORAGE_KEYS.tags, JSON.stringify(selectedTags));
    }
  }, [selectedTags]);

  const { mutate: saveOnboarding, isPending } = usePost("/user/onboarding", {
    onSuccess: () => {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      setStep("3");
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

  const handleTagsSelection = () => {
    if (selectedTags.length === 0) {
      toast.error("Please select at least one tag");
      return;
    }

    sendEvent({
      eventName: TRACKING_EVENTS.ONBOARDING_TAGS_SELECTED,
    });

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

      const storedTags = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.tags) || "[]"
      ) as string[];

      let tagIds: string[] = [];
      if (storedTags.length > 0) {
        if (tags.length === 0) {
          toast.error("Tags not loaded. Please try again.");
          setIsLoading(false);
          return;
        }

        tagIds = storedTags
          .map((tagName) => {
            const tag = tags.find((t) => t.name === tagName);
            return tag?.id;
          })
          .filter((id): id is string => !!id);

        if (tagIds.length === 0 && storedTags.length > 0) {
          toast.error(
            "Some selected tags were not found. Proceeding without tags."
          );
        }
      }

      sendEvent({
        eventName: TRACKING_EVENTS.ONBOARDING_ACCOUNT_CREATED,
      });

      saveOnboarding({
        tagIds: tagIds.length > 0 ? tagIds : undefined,
      });
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
    <div className="container mx-auto px-4 py-8 max-w-xl min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col space-y-8">
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
                onClick={handleTagsSelection}
                size="lg"
                className={CONTINUE_BUTTON_CLASSES}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
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
                  disabled={isLoading || isPending}
                  className={CONTINUE_BUTTON_CLASSES}
                >
                  {isLoading || isPending ? "Creating Account..." : "Sign Up"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {currentStep === 3 && <PaymentStep />}
      </div>
    </div>
  );
}
