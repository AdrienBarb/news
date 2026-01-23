"use client";

import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";

export const step1Schema = {
  input: "",
};

export type Step1Data = {
  input: string;
};

interface InputStepProps {
  form: UseFormReturn<Step1Data>;
  onSubmit: (data: Step1Data) => void;
  isAnalyzing: boolean;
}

export default function InputStep({
  form,
  onSubmit,
  isAnalyzing,
}: InputStepProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Describe Your Product
        </h2>
        <p className="text-gray-600">
          Paste your website URL or describe your product in a few sentences.
        </p>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <Label htmlFor="input" className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          Website URL or Product Description
        </Label>
        <Textarea
          id="input"
          placeholder="https://yourproduct.com OR describe what your product does, who it's for, and what problem it solves..."
          {...form.register("input")}
          className="min-h-[120px] resize-none"
        />
        {form.formState.errors.input && (
          <p className="text-sm text-red-500">
            {form.formState.errors.input.message}
          </p>
        )}
        <p className="text-xs text-gray-500">
          We&apos;ll analyze this to understand your ideal customer profile
        </p>
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
              Analyze
              <Sparkles className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
