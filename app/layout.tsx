import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import Navbar from "@/components/share-component/navbar";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // --- Core ---
  title: {
    default: "Quizzy for Devs – Programming Quizzes for Developers",
    template: "%s | Quizzy for Devs",
  },
  description:
    "Test and sharpen your coding skills with 600+ programming quiz questions across JavaScript, React, TypeScript, Python, SQL and more. Join 50,000+ developers competing daily.",

  // --- Canonical URL ---
  metadataBase: new URL("https://www.quizzy.it.com"),
  alternates: {
    canonical: "/",
  },

  // --- Keywords ---
  keywords: [
    "programming quiz",
    "coding quiz",
    "developer quiz",
    "JavaScript quiz",
    "React quiz",
    "TypeScript quiz",
    "Python quiz",
    "SQL quiz",
    "coding challenges",
    "programming practice",
    "developer leaderboard",
  ],

  // --- Open Graph (Facebook, LinkedIn, WhatsApp previews) ---
  openGraph: {
    type: "website",
    url: "https://www.quizzy.it.com",
    title: "Quizzy for Devs – Programming Quizzes for Developers",
    description:
      "600+ programming quiz questions across 12 languages. Test your skills, climb the leaderboard, and compete with 50,000+ developers.",
    siteName: "Quizzy for Devs",
    images: [
      {
        url: "/og-image.png", // Create a 1200x630px image
        width: 1200,
        height: 630,
        alt: "Quizzy for Devs – Programming Quizzes",
      },
    ],
  },

  // --- Twitter / X Card ---
  twitter: {
    card: "summary_large_image",
    title: "Quizzy for Devs – Programming Quizzes for Developers",
    description:
      "600+ programming quiz questions across 12 languages. Join 50,000+ devs competing daily.",
    images: ["/og-image.png"],
    // creator: "@yourTwitterHandle", // Add if you have one
  },

  // --- Robots ---
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // --- Icons ---
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  // --- Verification (add your codes from Google/Bing Search Console) ---
  verification: {
    // google: "your-google-verification-code",
    // other: { "msvalidate.01": ["your-bing-code"] },
  },
};
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Quizzy for Devs",
  url: "https://www.quizzy.it.com",
  description: "Programming quizzes for developers across 12 coding languages.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.quizzy.it.com/quizzes?topic={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className=" flex flex-col font-mono-custom relative bg-[#080b14]  overflow-x-hidden">
        <StoreProvider>
          <Toaster
            theme="dark"
            position="top-center"
            richColors
            expand={false}
          />
          {children}
        </StoreProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
