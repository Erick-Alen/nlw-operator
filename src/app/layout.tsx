import type { Metadata } from "next";
import { IBM_Plex_Mono, JetBrains_Mono } from "next/font/google";
import { Navbar } from "./components/ui/navbar";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-primary",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-secondary",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "devroast",
  description:
    "paste your code and get roasted — brutally honest or full roast mode",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} ${ibmPlexMono.variable} min-h-screen bg-bg-page antialiased`}
      >
        <Navbar links={[{ href: "/leaderboard", label: "leaderboard" }]} />
        {children}
      </body>
    </html>
  );
}
