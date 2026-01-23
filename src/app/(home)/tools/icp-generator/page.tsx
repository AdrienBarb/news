import { Metadata } from "next";
import IcpGeneratorForm from "@/components/icp-generator/IcpGeneratorForm";
import { Target } from "lucide-react";

export const metadata: Metadata = {
  title: "Free ICP Generator - Identify Your Ideal Customer Profile",
  description:
    "Generate a comprehensive Ideal Customer Profile for your SaaS product in minutes. AI-powered analysis to help you understand who your ideal customers are and where to find them on Reddit.",
  keywords: [
    "ideal customer profile",
    "icp generator",
    "customer persona",
    "target audience",
    "b2b marketing",
    "customer research",
    "icp template",
    "customer profile generator",
    "free icp tool",
    "saas marketing",
  ],
  openGraph: {
    title: "Free ICP Generator - Identify Your Ideal Customer Profile",
    description:
      "Generate a comprehensive Ideal Customer Profile for your SaaS product in minutes. AI-powered analysis to help you understand who your ideal customers are.",
    type: "website",
    url: "https://prediqte.com/tools/icp-generator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prediqte - ICP Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free ICP Generator - Identify Your Ideal Customer Profile",
    description:
      "Generate a comprehensive Ideal Customer Profile for your SaaS product in minutes. AI-powered analysis.",
    images: ["/og-image.png"],
  },
};

export default function IcpGeneratorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-white">
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-6">
            <Target className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Free ICP Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate a comprehensive Ideal Customer Profile for your product in
            minutes. Powered by AI.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
          <IcpGeneratorForm />
        </div>

        {/* Benefits Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            What you&apos;ll get
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Target Customer Profile
              </h3>
              <p className="text-sm text-gray-600">
                Company size, industry, growth stage, and more
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Pain Points & Triggers
              </h3>
              <p className="text-sm text-gray-600">
                What problems they face and when they search for solutions
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Where to Find Them
              </h3>
              <p className="text-sm text-gray-600">
                Subreddits, communities, and keywords they use
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
