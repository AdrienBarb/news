"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/better-auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useClientPostHogEvent } from "@/lib/tracking/useClientPostHogEvent";
import { TRACKING_EVENTS } from "@/lib/constants/tracking";
import { APP_ROUTER } from "@/lib/constants/appRouter";
import SignInModal from "@/components/SignInModal";

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

export default function SignUpPageClient() {
  const router = useRouter();
  const { sendEvent, sendEventOnce } = useClientPostHogEvent();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  // Track signup page view
  useEffect(() => {
    sendEventOnce({
      eventName: TRACKING_EVENTS.SIGNUP_PAGE_VIEWED,
    });
  }, [sendEventOnce]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

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

      sendEvent({
        eventName: TRACKING_EVENTS.ACCOUNT_CREATED,
      });

      toast.success("Account created successfully!");
      router.push(APP_ROUTER.PRICING);
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

  return (
    <div className="container mx-auto px-4 py-16 max-w-md min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 flex flex-col justify-center space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Create Your Account</h1>
          <p className="text-muted-foreground">
            Sign up to get started with market intelligence
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              disabled={isLoading}
              className="h-11"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
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
                className="pr-10 h-11"
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
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters with uppercase, lowercase,
              and a number
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full font-semibold text-lg"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => setIsSignInModalOpen(true)}
            className="text-primary hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>

      <SignInModal
        open={isSignInModalOpen}
        onOpenChange={setIsSignInModalOpen}
      />
    </div>
  );
}
