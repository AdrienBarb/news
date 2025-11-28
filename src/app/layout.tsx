import type { Metadata } from "next";
import { Inter, Archivo, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import GlobalErrorHandler from "@/components/GlobalErrorHandler";
import { QueryProviders } from "@/components/providers/QueryProviders";
import { PostHogProvider } from "@/components/tracking/PostHogProvider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Navbar from "@/components/Navbar";
import "./globals.css";
import { genPageMetadata } from "@/lib/seo/genPageMetadata";
import { siteMetadata } from "@/data/siteMetadata";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const selecta = Inter({
  variable: "--font-selecta",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = genPageMetadata({
  title: siteMetadata.title,
  description: siteMetadata.description,
  url: "/",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${selecta.variable} ${archivo.variable} ${playfairDisplay.variable} antialiased`}
      >
        <NuqsAdapter>
          <QueryProviders>
            <PostHogProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
              </div>
              <Toaster position="bottom-center" />
              <GlobalErrorHandler />
            </PostHogProvider>
          </QueryProviders>
        </NuqsAdapter>
      </body>
    </html>
  );
}
