import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface LeadsReadyEmailProps {
  name?: string;
  marketName: string;
  leadCount: number;
  dashboardUrl: string;
}

export const LeadsReadyEmail = ({
  name = "there",
  marketName,
  leadCount,
  dashboardUrl,
}: LeadsReadyEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        {`Your leads are ready! ${leadCount} high-intent leads found for ${marketName}`}
      </Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto py-8 px-4 max-w-xl">
            <Section className="bg-white rounded-2xl shadow-lg p-8 text-center">
              {/* Success Icon */}
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">🎯</span>
              </div>

              <Heading className="text-2xl font-bold text-gray-900 mb-2">
                Your leads are ready!
              </Heading>

              <Text className="text-gray-600 text-base mb-6">
                Hey {name}, great news! We&apos;ve finished analyzing Reddit
                for your market.
              </Text>

              {/* Stats Box */}
              <Section className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 mb-6">
                <Text className="text-4xl font-bold text-orange-600 mb-1">
                  {String(leadCount)}
                </Text>
                <Text className="text-gray-700 font-medium mb-0">
                  high-intent leads found
                </Text>
                <Text className="text-gray-500 text-sm">for {marketName}</Text>
              </Section>

              <Text className="text-gray-600 text-sm mb-6">
                These are people actively looking for solutions like yours on
                Reddit. Check them out and start engaging!
              </Text>

              <Button
                href={dashboardUrl}
                className="bg-orange-500 text-white font-semibold px-8 py-3 rounded-full no-underline inline-block"
              >
                View Your Leads →
              </Button>

              <Text className="text-gray-400 text-xs mt-8">
                Thanks for using Reddit Lead Finder!
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default LeadsReadyEmail;

