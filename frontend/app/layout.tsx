import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Midiscanai — Medical Intelligence Platform",
  description: "AI-powered medical report analysis platform. Upload your report and get instant clinical insights powered by OpenAI GPT-4o.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico'
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "Midiscanai — Medical Intelligence Platform",
    description: "AI-powered medical report analysis platform. Upload your report and get instant clinical insights powered by OpenAI GPT-4o.",
    type: "website",
    siteName: "Midiscanai",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
