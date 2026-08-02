import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ivory Crown Collective",
    template: "%s · Ivory Crown Collective",
  },
  description:
    "Ivory Crown Collective LLC — web and software design alongside DJ gigs. Two co-equal practices, one standard of craft.",
  openGraph: {
    title: "Ivory Crown Collective",
    description:
      "Digital craft and live sound — equal weight, one collective. Web/software design and DJ bookings.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${syne.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-pearl text-ink">{children}</body>
    </html>
  );
}
