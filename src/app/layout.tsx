import type { Metadata } from "next";
import { Rethink_Sans, Geist } from "next/font/google";
import { Toaster } from "react-hot-toast";
import GlobalErrorHandler from "@/components/GlobalErrorHandler";
import { QueryProviders } from "@/components/providers/QueryProviders";
import { PostHogProvider } from "@/components/tracking/PostHogProvider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { siteMetadata } from "@/data/siteMetadata";

const rethinkSans = Rethink_Sans({
  variable: "--font-rethink-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// Default metadata for all pages (can be overridden by individual pages)
export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: `${siteMetadata.title} | ${siteMetadata.brandName}`,
    template: `%s | ${siteMetadata.brandName}`,
  },
  description: siteMetadata.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rethinkSans.variable} ${geist.variable} antialiased`}>
        <NuqsAdapter>
          <QueryProviders>
            <PostHogProvider>
              <div className="flex min-h-screen flex-col">{children}</div>
              <Toaster position="bottom-center" />
              <GlobalErrorHandler />
            </PostHogProvider>
          </QueryProviders>
        </NuqsAdapter>
      </body>
    </html>
  );
}
