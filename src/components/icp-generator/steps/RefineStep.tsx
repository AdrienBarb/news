"use client";

import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { AnalyzedData } from "@/lib/schemas/icpGenerator";

export type Step2Data = AnalyzedData;

interface RefineStepProps {
  form: UseFormReturn<Step2Data>;
  onSubmit: () => void;
  onBack: () => void;
}

export default function RefineStep({
  form,
  onSubmit,
  onBack,
}: RefineStepProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review & Refine
        </h2>
        <p className="text-gray-600">
          We analyzed your input. Review and edit the details before generating
          your ICP.
        </p>
      </div>

      {/* Product Description */}
      <div className="space-y-2">
        <Label htmlFor="productDescription">
          What does your product do?
        </Label>
        <Textarea
          id="productDescription"
          placeholder="Describe what your product does..."
          {...form.register("productDescription")}
          className="min-h-[100px] resize-none"
        />
        {form.formState.errors.productDescription && (
          <p className="text-sm text-red-500">
            {form.formState.errors.productDescription.message}
          </p>
        )}
      </div>

      {/* Problem Solved */}
      <div className="space-y-2">
        <Label htmlFor="problemSolved">What problem does it solve?</Label>
        <Textarea
          id="problemSolved"
          placeholder="The main problem or pain point your product solves..."
          {...form.register("problemSolved")}
          className="min-h-[100px] resize-none"
        />
        {form.formState.errors.problemSolved && (
          <p className="text-sm text-red-500">
            {form.formState.errors.problemSolved.message}
          </p>
        )}
      </div>

      {/* Target Customer */}
      <div className="space-y-2">
        <Label htmlFor="targetCustomer">
          Who currently pays / would pay for this?
        </Label>
        <Textarea
          id="targetCustomer"
          placeholder="e.g., B2B SaaS founders, E-commerce store owners, etc."
          {...form.register("targetCustomer")}
          className="min-h-[80px] resize-none"
        />
        {form.formState.errors.targetCustomer && (
          <p className="text-sm text-red-500">
            {form.formState.errors.targetCustomer.message}
          </p>
        )}
      </div>

      {/* Price Point */}
      <div className="space-y-2">
        <Label htmlFor="pricePoint">Price Point</Label>
        <Select
          value={form.watch("pricePoint")}
          onValueChange={(value) =>
            form.setValue("pricePoint", value as Step2Data["pricePoint"])
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a price range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FREE">Free</SelectItem>
            <SelectItem value="UNDER_50">Under $50/month</SelectItem>
            <SelectItem value="50_TO_200">$50 - $200/month</SelectItem>
            <SelectItem value="200_TO_1000">$200 - $1,000/month</SelectItem>
            <SelectItem value="OVER_1000">Over $1,000/month</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.pricePoint && (
          <p className="text-sm text-red-500">
            {form.formState.errors.pricePoint.message}
          </p>
        )}
      </div>

      {/* Business Type */}
      <div className="space-y-3">
        <Label>Business Type</Label>
        <RadioGroup
          value={form.watch("businessType")}
          onValueChange={(value) =>
            form.setValue("businessType", value as Step2Data["businessType"])
          }
        >
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="B2B" id="b2b" />
              <Label htmlFor="b2b" className="font-normal cursor-pointer">
                B2B
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="B2C" id="b2c" />
              <Label htmlFor="b2c" className="font-normal cursor-pointer">
                B2C
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="BOTH" id="both" />
              <Label htmlFor="both" className="font-normal cursor-pointer">
                Both
              </Label>
            </div>
          </div>
        </RadioGroup>
        {form.formState.errors.businessType && (
          <p className="text-sm text-red-500">
            {form.formState.errors.businessType.message}
          </p>
        )}
      </div>

      {/* Alternatives */}
      <div className="space-y-2">
        <Label htmlFor="alternatives">What alternatives exist?</Label>
        <Textarea
          id="alternatives"
          placeholder="List 2-3 alternative solutions or competitors..."
          {...form.register("alternatives")}
          className="min-h-[80px] resize-none"
        />
        {form.formState.errors.alternatives && (
          <p className="text-sm text-red-500">
            {form.formState.errors.alternatives.message}
          </p>
        )}
        <p className="text-xs text-gray-500">
          Separate with commas (e.g., Notion, Trello, Asana)
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="text-gray-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white px-6"
        >
          Generate My ICP
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}
