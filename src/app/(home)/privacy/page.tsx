import type { Metadata } from "next";
import { genPageMetadata } from "@/lib/seo/genPageMetadata";
import { config } from "@/lib/config";

export const metadata: Metadata = genPageMetadata({
  title: "Privacy Policy",
  description: "Privacy Policy",
  url: "/privacy",
});

export default function PrivacyPage() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-sm max-w-none space-y-6">
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: {currentDate}
        </p>

        <section>
          <p className="text-muted-foreground mb-4">
            This Privacy Policy explains how {config.project.name}{" "}
            (&quot;we&quot;, &quot;our&quot;, &quot;the Service&quot;) collects,
            uses, and protects your personal information.
          </p>
          <p className="text-muted-foreground">
            By using our website or app, you agree to this Policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            1. Information We Collect
          </h2>

          <h3 className="text-xl font-semibold mb-3 mt-6">
            1.1 Information You Provide
          </h3>
          <p className="text-muted-foreground mb-2">We may collect:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Email address</li>
            <li>Name or nickname</li>
            <li>Preferences (e.g., tags you choose)</li>
            <li>Account information</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">
            1.2 Information Collected Automatically
          </h3>
          <p className="text-muted-foreground mb-2">
            When you use the Service, we may collect:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Device information (browser type, OS)</li>
            <li>Usage data (pages viewed, time spent, interactions)</li>
            <li>Log data (IP address, timestamps)</li>
            <li>Cookies and similar technologies</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">1.3 Optional Data</h3>
          <p className="text-muted-foreground mb-2">
            If you choose to share it, we may collect:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Your feedback or messages</li>
            <li>Survey answers</li>
            <li>Onboarding information</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            We do not collect sensitive personal data (health, political,
            biometric, etc.).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            2. How We Use Your Information
          </h2>
          <p className="text-muted-foreground mb-2">
            We use your information to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Provide and improve the Service</li>
            <li>Personalize your news feed</li>
            <li>Send relevant notifications or updates</li>
            <li>Prevent abuse, fraud, or misuse</li>
            <li>Understand usage patterns for analytics</li>
            <li>Communicate with you about the Service</li>
          </ul>
          <p className="text-muted-foreground mt-4 font-semibold">
            We do not sell your personal data. Ever.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Legal Basis (GDPR)</h2>
          <p className="text-muted-foreground mb-2">
            If you are in the EU/EEA, we process your data under:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Contract necessity (to provide the Service)</li>
            <li>Legitimate interest (improving features, preventing abuse)</li>
            <li>Consent (newsletters, cookies, optional onboarding info)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Cookies & Tracking</h2>
          <p className="text-muted-foreground mb-2">
            We may use cookies or similar tools to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Remember your preferences</li>
            <li>Measure usage and performance</li>
            <li>Improve personalization</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            You can disable cookies in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            5. Third-Party Services
          </h2>
          <p className="text-muted-foreground mb-2">
            We may use trusted third parties to operate the Service, such as:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Hosting providers (e.g., Vercel, Supabase)</li>
            <li>Analytics tools (e.g., PostHog, Google Analytics)</li>
            <li>Email services (e.g., Resend)</li>
            <li>Payment providers (if applicable)</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            These providers may process personal data strictly to perform their
            service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            6. Data Storage & Security
          </h2>
          <p className="text-muted-foreground mb-4">
            We take reasonable technical and organizational measures to protect
            your data.
          </p>
          <p className="text-muted-foreground mb-4">
            Your data may be stored on secure servers inside or outside the EU.
          </p>
          <p className="text-muted-foreground">
            We cannot guarantee 100% security, but we work hard to protect your
            information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            7. How Long We Keep Your Data
          </h2>
          <p className="text-muted-foreground mb-2">
            We keep data only for as long as needed:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Account data → until you delete your account</li>
            <li>Usage logs → short period for security and analytics</li>
            <li>Preferences → until you change or remove them</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            You can request deletion at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Your Rights (GDPR)</h2>
          <p className="text-muted-foreground mb-2">
            If you are located in the EU/EEA, you have the right to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Access your data</li>
            <li>Correct your data</li>
            <li>Delete your data</li>
            <li>Export your data</li>
            <li>Restrict or object to processing</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            To exercise these rights, contact us on Telegram:{" "}
            <a
              href={config.contact.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {config.contact.telegram}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            9. Children&apos;s Privacy
          </h2>
          <p className="text-muted-foreground mb-4">
            We do not knowingly collect data from children under 13 (or under
            your local legal age).
          </p>
          <p className="text-muted-foreground">
            If you think a child has used the Service, contact us and we will
            remove the data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            10. Changes to This Policy
          </h2>
          <p className="text-muted-foreground mb-4">
            We may update this Privacy Policy from time to time.
          </p>
          <p className="text-muted-foreground">
            If changes are significant, we will notify you through the app or
            email.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have questions about this Privacy Policy, you can reach us on
            Telegram:{" "}
            <a
              href={config.contact.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {config.contact.telegram}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
