import type { Metadata } from "next";
import { Fira_Code, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ThemeSync from "@/components/ThemeSync";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const codeFont = Fira_Code({
  subsets: ["latin"],
  variable: "--font-code",
});

export const metadata: Metadata = {
  title: "CodeQuest - The Gamified Coding Platform",
  description: "Learn C, C++, Python, and HTML through bite-sized, gamified lessons.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${codeFont.variable} min-h-screen bg-slate-950 text-slate-100 antialiased`}
      >
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
