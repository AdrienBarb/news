import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

interface ResetPasswordEmailProps {
  resetUrl: string;
}

export const ResetPasswordEmail = ({ resetUrl }: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-8 px-4">
            <Heading className="text-2xl font-bold mb-4">
              Reset your password
            </Heading>
            <Text className="text-gray-700 mb-4">
              Click the button below to reset your password. This link will
              expire in 1 hour.
            </Text>
            <Section className="text-center my-8">
              <Link
                href={resetUrl}
                className="bg-black text-white px-6 py-3 rounded-md inline-block text-center no-underline"
              >
                Reset Password
              </Link>
            </Section>
            <Text className="text-gray-500 text-sm">
              If you didn&apos;t request a password reset, you can safely ignore
              this email.
            </Text>
            <Text className="text-gray-500 text-sm mt-4">
              Or copy and paste this URL into your browser: {resetUrl}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ResetPasswordEmail;

