"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/lib/better-auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (error === "INVALID_TOKEN") {
      setTokenError("Invalid or expired reset token. Please request a new password reset.");
    } else if (!token) {
      setTokenError("No reset token provided. Please check your email for the reset link.");
    }
  }, [error, token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Invalid reset token. Please request a new password reset.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to reset password");
      }

      setIsSuccess(true);
      toast.success("Password reset successfully! Redirecting to sign in...");
      
      // Redirect to sign in after a short delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again."
      );
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Invalid Reset Link</h1>
            <p className="text-muted-foreground">{tokenError}</p>
            <div className="space-y-2">
              <Button
                onClick={() => router.push("/")}
                variant="default"
                className="w-full"
              >
                Go to Home
              </Button>
              <p className="text-sm text-muted-foreground">
                Need a new reset link?{" "}
                <Link href="/" className="text-primary hover:underline">
                  Sign in
                </Link>{" "}
                and request a new one.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Password Reset Successful!</h1>
            <p className="text-muted-foreground">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Button
              onClick={() => router.push("/")}
              variant="default"
              className="w-full"
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Reset Your Password</h1>
          <p className="text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
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
                  <EyeOff className="h-4 w-4 cursor-pointer" />
                ) : (
                  <Eye className="h-4 w-4 cursor-pointer" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                {...register("confirmPassword")}
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 cursor-pointer" />
                ) : (
                  <Eye className="h-4 w-4 cursor-pointer" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

