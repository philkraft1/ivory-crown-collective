import type { Metadata } from "next";
import { Cinzel, Outfit } from "next/font/google";
import { SITE } from "@/lib/site";
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
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "Ivory Crown Collective",
    "web design",
    "software",
    "web apps",
    "app development",
    "IT solutions",
    "New Jersey",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/brand/logo.png",
        width: 1600,
        height: 1600,
        alt: `${SITE.name} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
    images: ["/brand/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${cinzel.variable} min-h-svh antialiased`}>
      <body className="min-h-svh bg-void text-pearl [font-family:var(--font-outfit),sans-serif]">
        {children}
      </body>
    </html>
  );
}
