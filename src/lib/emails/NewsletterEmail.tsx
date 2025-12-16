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
import type { Article, Tag } from "@prisma/client";

type ArticleWithTags = Article & { tags: Tag[] };

interface NewsletterEmailProps {
  articles: ArticleWithTags[];
  unsubscribeUrl?: string;
}

export const NewsletterEmail = ({
  articles,
  unsubscribeUrl,
}: NewsletterEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Your weekly tech briefing - {articles.length.toString()} curated
        articles
      </Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-8 px-4">
            <Heading className="text-2xl font-bold mb-4">
              Your Weekly Tech Brief
            </Heading>

            {articles.map((article, index) => (
              <Section key={article.id} className="my-8">
                <Heading className="text-xl font-bold mb-2">
                  {index + 1}. {article.headline || "Tech Article"}
                </Heading>
                <Text className="text-gray-700 mb-4">{article.summary}</Text>
                <Section className="text-center my-4">
                  <Link
                    href={article.link}
                    className="bg-black text-white px-6 py-3 rounded-md inline-block text-center no-underline"
                  >
                    Read Article
                  </Link>
                </Section>
              </Section>
            ))}

            <Text className="text-gray-500 text-sm mt-8">
              Thanks for staying informed with us!
            </Text>
            {unsubscribeUrl && (
              <Text className="text-gray-500 text-sm mt-4">
                <Link href={unsubscribeUrl} className="text-gray-500">
                  Unsubscribe
                </Link>
              </Text>
            )}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default NewsletterEmail;
