import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "./providers/posthog-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Grand Slam Offer Generator | Create Irresistible Offers with AI",
  description:
    "Transform your ideas into irresistible offers with AI-powered generation. Based on Alex Hormozi's $100M Offers methodology. Get your Grand Slam Offer in minutes.",
  keywords: [
    "offer generation",
    "business offers",
    "Alex Hormozi",
    "grand slam offers",
    "AI business tools",
    "irresistible offers",
  ],
  authors: [{ name: "Grand Slam Generator" }],
  creator: "Grand Slam Generator",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://grandslamgenerator.com",
    title: "Grand Slam Offer Generator | Create Irresistible Offers with AI",
    description:
      "Transform your ideas into irresistible offers with AI-powered generation. Based on Alex Hormozi's $100M Offers methodology.",
    siteName: "Grand Slam Offer Generator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grand Slam Offer Generator | Create Irresistible Offers with AI",
    description:
      "Transform your ideas into irresistible offers with AI-powered generation. Based on Alex Hormozi's $100M Offers methodology.",
    creator: "@grandslamgen",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} font-sans antialiased bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen`}
      >
        <PostHogProvider>
          <div className="relative">{children}</div>
        </PostHogProvider>
      </body>
    </html>
  );
}
