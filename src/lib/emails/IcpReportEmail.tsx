import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Markdown,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface IcpReportEmailProps {
  productName?: string;
  report: string;
}

export const IcpReportEmail = ({
  report,
}: IcpReportEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        {`Your Ideal Customer Profile Report is ready!`}
      </Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto py-8 px-4 max-w-2xl">
            <Section className="bg-white rounded-2xl shadow-lg p-8">
              {/* Header */}
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">🎯</span>
              </div>

              <Heading className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Your ICP Report is Ready!
              </Heading>

              <Text className="text-gray-600 text-base mb-6 text-center">
                Here&apos;s your comprehensive Ideal Customer Profile
              </Text>

              {/* Report Content */}
              <Section className="bg-gray-50 rounded-xl p-6 mb-6">
                <Markdown
                  markdownCustomStyles={{
                    h1: {
                      color: "#111827",
                      fontSize: "24px",
                      fontWeight: "bold",
                      marginBottom: "16px",
                      marginTop: "0",
                    },
                    h2: {
                      color: "#1f2937",
                      fontSize: "18px",
                      fontWeight: "bold",
                      marginTop: "24px",
                      marginBottom: "12px",
                    },
                    h3: {
                      color: "#374151",
                      fontSize: "16px",
                      fontWeight: "600",
                      marginTop: "16px",
                      marginBottom: "8px",
                    },
                    p: {
                      color: "#4b5563",
                      fontSize: "14px",
                      lineHeight: "22px",
                      marginBottom: "12px",
                    },
                    li: {
                      color: "#4b5563",
                      fontSize: "14px",
                      lineHeight: "22px",
                      marginBottom: "6px",
                    },
                    codeInline: {
                      background: "#e5e7eb",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontFamily: "monospace",
                      fontSize: "13px",
                    },
                  }}
                  markdownContainerStyles={{
                    padding: "0",
                  }}
                >
                  {report}
                </Markdown>
              </Section>

              {/* CTA */}
              <Section className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 mb-6 text-center">
                <Heading className="text-lg font-bold text-gray-900 mb-2">
                  Ready to find your ICP on Reddit?
                </Heading>
                <Text className="text-gray-600 text-sm mb-4">
                  Prediqte scans Reddit to find high-intent conversations where
                  your ideal customers are actively looking for solutions.
                </Text>
                <Button
                  href="https://prediqte.com?utm_source=icp_generator&utm_medium=email"
                  className="bg-orange-500 text-white font-semibold px-8 py-3 rounded-full no-underline inline-block"
                >
                  Try Prediqte →
                </Button>
              </Section>

              <Text className="text-gray-400 text-xs text-center">
                Made with ❤️ by{" "}
                <a
                  href="https://prediqte.com"
                  className="text-orange-500 no-underline"
                >
                  Prediqte
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default IcpReportEmail;
