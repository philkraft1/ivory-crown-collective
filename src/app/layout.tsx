import type { Metadata } from "next";
import { Cinzel, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Ivory Crown Collective",
    template: "%s · Ivory Crown Collective",
  },
  description:
    "Ivory Crown Collective — web design, entertainment, and IT solutions. Launching soon.",
  openGraph: {
    title: "Ivory Crown Collective",
    description: "Web design · Entertainment · IT solutions. Launching soon.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${cinzel.variable} h-svh overflow-hidden antialiased`}>
      <body className="h-svh overflow-hidden bg-void text-pearl [font-family:var(--font-outfit),sans-serif]">
        {children}
      </body>
    </html>
  );
}
