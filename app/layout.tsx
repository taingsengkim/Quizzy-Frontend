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
  // --- metadataBase (required for absolute URLs on social platforms) ---
  metadataBase: new URL("https://quizzy-it.vercel.app/"),

  // --- Core ---
  title: {
    default: "Quizzy for Devs – Programming Quizzes for Developers",
    template: "%s | Quizzy for Devs",
  },
  description:
    "600+ programming quiz questions across 12 languages. Test your skills, climb the leaderboard, and compete with 50,000+ developers.",
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
  authors: [{ name: "Quizzy for Devs", url: "https://quizzy-it.vercel.app/" }],
  creator: "Quizzy for Devs",
  publisher: "Quizzy for Devs",

  // --- Canonical ---
  alternates: {
    canonical: "https://quizzy-it.vercel.app/",
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
      "max-video-preview": -1,
    },
  },

  // --- Open Graph (Facebook, Discord, Telegram, WhatsApp, LinkedIn) ---
  openGraph: {
    type: "website",
    url: "https://quizzy-it.vercel.app/",
    siteName: "Quizzy for Devs",
    title: "Quizzy for Devs – Programming Quizzes for Developers",
    description:
      "600+ programming quiz questions across 12 languages. Test your skills, climb the leaderboard, and compete with 50,000+ developers.",
    locale: "en_US",
    images: [
      {
        url: "https://quizzy-it.vercel.app/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Quizzy for Devs – Programming Quizzes for Developers",
        type: "image/png",
      },
    ],
  },

  // --- Twitter / X ---
  twitter: {
    card: "summary_large_image",
    site: "@quizzy.it.com",
    title: "Quizzy for Devs – Programming Quizzes for Developers",
    description:
      "600+ programming quiz questions across 12 languages. Test your skills, climb the leaderboard, and compete with 50,000+ developers.",
    images: [
      {
        url: "https://quizzy-it.vercel.app/opengraph-image.png",
        alt: "Quizzy for Devs – Programming Quizzes for Developers",
      },
    ],
    // creator: "@yourTwitterHandle", // add if you have one
  },

  // --- Icons / Favicon ---
  icons: {
    icon: [
      { url: "/icon/favicon.ico" },
      { url: "/icon/favicon-16x16.ico", sizes: "16x16", type: "image/png" },
      { url: "/icon/favicon-32x32.ico", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },

  // --- Verification (uncomment after getting codes from Search Console) ---
  verification: {
    google: "sha9U89TLX6Gup_QipHRFlMYV7S4ZcdWy0VbkMyXtEU",
    // other: { "msvalidate.01": ["your-bing-verification-code"] },
  },
};
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Quizzy for Devs",
  url: "https://quizzy-it.vercel.app/",
  description: "Programming quizzes for developers across 12 coding languages.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://quizzy-it.vercel.app/quizzes?topic={search_term_string}",
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
