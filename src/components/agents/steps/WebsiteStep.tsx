"use client";

import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Loader2, Sparkles } from "lucide-react";
import type { Step1Data } from "../CreateAgentForm";

interface WebsiteStepProps {
  form: UseFormReturn<Step1Data>;
  onSubmit: (data: Step1Data) => void;
  isAnalyzing: boolean;
}

export default function WebsiteStep({
  form,
  onSubmit,
  isAnalyzing,
}: WebsiteStepProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Find leads on Reddit
        </h2>
        <p className="text-gray-600">
          Enter your website URL and we&apos;ll analyze it to find relevant
          keywords.
        </p>
      </div>

      {/* Website URL */}
      <div className="space-y-2">
        <Label htmlFor="websiteUrl" className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-orange-500" />
          Website URL
        </Label>
        <Input
          id="websiteUrl"
          type="url"
          placeholder="https://yourproduct.com"
          {...form.register("websiteUrl")}
          className="h-12"
        />
        {form.formState.errors.websiteUrl && (
          <p className="text-sm text-red-500">
            {form.formState.errors.websiteUrl.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isAnalyzing}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Analyze Website
              <Sparkles className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

