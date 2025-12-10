import type { Metadata } from "next";
import { genPageMetadata } from "@/lib/seo/genPageMetadata";
import { config } from "@/lib/config";

export const metadata: Metadata = genPageMetadata({
  title: "Terms of Service",
  description: "Terms of Service",
  url: "/terms",
});

export default function TermsPage() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>

      <div className="prose prose-sm max-w-none space-y-6">
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: {currentDate}
        </p>

        <section>
          <p className="text-muted-foreground mb-6">
            Welcome to {config.project.name} (&quot;we&quot;, &quot;our&quot;,
            &quot;the Service&quot;).
          </p>
          <p className="text-muted-foreground mb-4">
            By using our website or app, you agree to these Terms & Conditions.
          </p>
          <p className="text-muted-foreground">
            If you do not agree, please stop using the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            1. Purpose of the Service
          </h2>
          <p className="text-muted-foreground mb-4">
            {config.project.name} provides curated news summaries and insights
            to help users stay informed.
          </p>
          <p className="text-muted-foreground">
            We are not responsible for the accuracy or completeness of
            third-party content we reference.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Use of the Service</h2>
          <p className="text-muted-foreground mb-4">
            You agree to use the Service only for personal, non-commercial
            purposes.
          </p>
          <p className="text-muted-foreground mb-2">You must not:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>misuse or disrupt the Service</li>
            <li>
              attempt to copy, scrape, or redistribute our content without
              permission
            </li>
            <li>use the Service in any way that violates the law</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Accounts</h2>
          <p className="text-muted-foreground mb-4">
            To access certain features, you may need to create an account.
          </p>
          <p className="text-muted-foreground mb-2">You agree to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>provide accurate information</li>
            <li>keep your login details secure</li>
            <li>notify us immediately if you suspect unauthorized use</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            We may suspend or delete accounts that violate these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Content</h2>
          <p className="text-muted-foreground mb-4">
            All content on the Service is owned by us or our partners.
          </p>
          <p className="text-muted-foreground mb-2">
            You may read and share content for personal use, but you cannot:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>sell, republish, or commercially exploit our content</li>
            <li>use our brand without permission</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            If you believe any content infringes your rights, contact us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            5. Subscriptions & Payments
          </h2>
          <p className="text-muted-foreground mb-2">
            If we offer paid plans or subscriptions:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>Prices and features will be clearly displayed</li>
            <li>Payments are handled securely by our payment provider</li>
            <li>All sales are final unless stated otherwise</li>
            <li>Subscriptions renew automatically unless canceled</li>
            <li>
              Free trials may be limited and cannot be reused once expired
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Privacy</h2>
          <p className="text-muted-foreground mb-4">
            Your privacy is important to us.
          </p>
          <p className="text-muted-foreground">
            Please read our{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>{" "}
            to understand how we collect, store, and use your data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Third-Party Links</h2>
          <p className="text-muted-foreground mb-4">
            The Service may contain links to external websites.
          </p>
          <p className="text-muted-foreground">
            We are not responsible for their content, practices, or policies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Disclaimer</h2>
          <p className="text-muted-foreground mb-4">
            The Service is provided &quot;as is&quot;.
          </p>
          <p className="text-muted-foreground mb-2">We do not guarantee:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>that the Service will always be available</li>
            <li>that the content is error-free</li>
            <li>that we will cover every news topic</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            You use the Service at your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            9. Limitation of Liability
          </h2>
          <p className="text-muted-foreground mb-2">
            To the maximum extent permitted by law, we are not liable for:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>losses caused by using or not being able to use the Service</li>
            <li>actions or content from third parties</li>
            <li>
              any damages arising from reliance on our summaries or insights
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            10. Changes to These Terms
          </h2>
          <p className="text-muted-foreground mb-4">
            We may update these Terms at any time.
          </p>
          <p className="text-muted-foreground">
            If changes are significant, we will notify users through the app or
            by email.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have questions about these Terms, you can reach us at:{" "}
            <a
              href={`mailto:${config.contact.email}`}
              className="text-primary hover:underline"
            >
              {config.contact.email}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
