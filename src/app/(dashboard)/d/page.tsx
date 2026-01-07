import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rocket, Mail } from "lucide-react";
import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center">
            <Rocket className="w-10 h-10 text-secondary" />
          </div>
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-secondary/30 px-4 py-1.5">
            You&apos;re on the list!
          </Badge>
        </div>

        {/* Heading */}
        <h1 className="text-4xl lg:text-5xl font-rethink-sans font-bold text-foreground mb-6">
          Thanks for signing up!
        </h1>

        {/* Description */}
        <p className="text-xl text-foreground/70 mb-4 leading-relaxed">
          We&apos;re building something special for you.
        </p>
        <p className="text-lg text-foreground/60 mb-8 leading-relaxed">
          Prediqte is still in development. We&apos;ll send you an email as soon as
          it&apos;s ready to help you find high-intent leads on Reddit.
        </p>

        {/* What to expect */}
        <div className="bg-card rounded-2xl p-8 border border-foreground/10 mb-8 text-left">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-secondary" />
            What happens next?
          </h3>
          <ul className="space-y-3 text-foreground/70">
            <li className="flex items-start gap-3">
              <span className="text-secondary font-bold">1.</span>
              <span>We&apos;ll notify you when Prediqte launches</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-secondary font-bold">2.</span>
              <span>You&apos;ll get early access as a founding member</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-secondary font-bold">3.</span>
              <span>Your free trial will start when the app is ready</span>
            </li>
          </ul>
        </div>

        {/* Back to home */}
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/">Back to homepage</Link>
        </Button>
      </div>
    </div>
  );
}

