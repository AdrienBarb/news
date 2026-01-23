"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useApi from "@/lib/hooks/useApi";
import { cn } from "@/lib/utils";
import InputStep, { type Step1Data } from "./steps/InputStep";
import RefineStep, { type Step2Data } from "./steps/RefineStep";
import ReportStep from "./steps/ReportStep";
import { analyzedDataSchema } from "@/lib/schemas/icpGenerator";

// Step 1 Schema - Input (URL or description)
const step1Schema = z.object({
  input: z.string().min(10, "Please enter at least 10 characters"),
});

export default function IcpGeneratorForm() {
  const { usePost } = useApi();

  // Form state
  const [step, setStep] = useState(1);
  const [reportId, setReportId] = useState<string | null>(null);
  const [generatedReport, setGeneratedReport] = useState<string>("");
  const [emailSent, setEmailSent] = useState(false);

  // Step 1 Form
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { input: "" },
  });

  // Step 2 Form
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(analyzedDataSchema),
    defaultValues: {
      productDescription: "",
      problemSolved: "",
      targetCustomer: "",
      pricePoint: "UNDER_50",
      businessType: "B2B",
      alternatives: "",
    },
  });

  // API calls
  const { mutate: analyzeInput, isPending: isAnalyzing } = usePost(
    "/tools/icp-generator/analyze",
    {
      onSuccess: (data: {
        reportId: string;
        analyzedData: {
          productDescription: string;
          problemSolved: string;
          targetCustomer: string;
          pricePoint: string;
          businessType: string;
          alternatives: string;
        };
      }) => {
        setReportId(data.reportId);
        step2Form.setValue("productDescription", data.analyzedData.productDescription);
        step2Form.setValue("problemSolved", data.analyzedData.problemSolved);
        step2Form.setValue("targetCustomer", data.analyzedData.targetCustomer);
        step2Form.setValue("pricePoint", data.analyzedData.pricePoint as Step2Data["pricePoint"]);
        step2Form.setValue("businessType", data.analyzedData.businessType as Step2Data["businessType"]);
        step2Form.setValue("alternatives", data.analyzedData.alternatives);
        setStep(2);
      },
    }
  );

  const { mutate: generateIcp, isPending: isGenerating } = usePost(
    "/tools/icp-generator/generate",
    {
      onSuccess: (data: { report: string }) => {
        setGeneratedReport(data.report);
        setStep(3);
      },
    }
  );

  const { mutate: sendEmail, isPending: isSendingEmail } = usePost(
    "/tools/icp-generator/send-email",
    {
      onSuccess: () => {
        setEmailSent(true);
      },
    }
  );

  // Step 1: Analyze input
  const handleStep1Submit = (data: Step1Data) => {
    analyzeInput({ input: data.input });
  };

  // Step 2: Generate ICP report
  const handleStep2Submit = () => {
    if (!reportId) return;

    const finalData = step2Form.getValues();
    generateIcp({
      reportId,
      finalData,
    });
  };

  // Step 3: Send email
  const handleSendEmail = (email: string) => {
    if (!reportId) return;

    sendEmail({
      reportId,
      email,
    });
  };

  return (
    <div className="space-y-6">
      {/* Step indicator dots */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
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

      {/* Step 1: Input */}
      {step === 1 && (
        <InputStep
          form={step1Form}
          onSubmit={handleStep1Submit}
          isAnalyzing={isAnalyzing}
        />
      )}

      {/* Step 2: Refine */}
      {step === 2 && !isGenerating && (
        <RefineStep
          form={step2Form}
          onSubmit={handleStep2Submit}
          onBack={() => setStep(1)}
        />
      )}

      {/* Loading state for generation */}
      {step === 2 && isGenerating && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Generating your ICP report...
          </h3>
          <p className="text-gray-600">
            This may take 10-15 seconds. We&apos;re analyzing your product and
            creating a comprehensive profile.
          </p>
        </div>
      )}

      {/* Step 3: Report */}
      {step === 3 && (
        <ReportStep
          report={generatedReport}
          onSendEmail={handleSendEmail}
          isSending={isSendingEmail}
          emailSent={emailSent}
        />
      )}
    </div>
  );
}
