"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ReportStepProps {
  report: string;
  onSendEmail: (email: string) => void;
  isSending: boolean;
  emailSent: boolean;
}

export default function ReportStep({
  report,
  onSendEmail,
  isSending,
  emailSent,
}: ReportStepProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendEmail(email);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your ICP Report is Ready! 🎯
        </h2>
        <p className="text-gray-600">
          Here&apos;s your comprehensive Ideal Customer Profile.
        </p>
      </div>

      {/* Report Display */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 max-h-[500px] overflow-y-auto">
        <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700">
          <ReactMarkdown>{report}</ReactMarkdown>
        </div>
      </div>

      {/* Email Form */}
      {!emailSent ? (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Want a copy in your inbox?
              </h3>
              <p className="text-sm text-gray-600">
                Get this ICP report delivered to your email for easy reference.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500" />
                Email Address
              </Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 flex-1"
                  required
                />
                <Button
                  type="submit"
                  disabled={isSending || !email}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send to my inbox"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-green-50 rounded-xl p-6 border border-green-200 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-900 mb-1">
            Email sent! 📧
          </h3>
          <p className="text-sm text-green-700">
            Check your inbox for your ICP report.
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="bg-white rounded-xl p-6 border-2 border-orange-200 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Ready to find your ICP on Reddit?
        </h3>
        <p className="text-gray-600 mb-4">
          Prediqte scans Reddit to find high-intent conversations where your
          ideal customers are actively looking for solutions.
        </p>
        <Button
          asChild
          className="bg-orange-500 hover:bg-orange-600 text-white px-8"
        >
          <a href="/?utm_source=icp_generator&utm_medium=web">
            Try Prediqte →
          </a>
        </Button>
      </div>
    </div>
  );
}
