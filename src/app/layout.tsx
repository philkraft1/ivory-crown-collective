import type { Metadata } from "next";
import { Cinzel, Outfit } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
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
      <head>
        {/* Hostname-gated GA4 so only ivorycrowncollective.com loads the agency property.
            Native <head> script so Google's HTML crawler / "Test your website" can see it. */}
        <script
          id="google-analytics"
          dangerouslySetInnerHTML={{
            __html: `
if (location.hostname.endsWith('ivorycrowncollective.com')) {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=${SITE.gaMeasurementId}';
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${SITE.gaMeasurementId}', { allow_enhanced_conversions: true });
}
`.trim(),
          }}
        />
      </head>
      <body className="flex min-h-svh flex-col bg-void text-pearl [font-family:var(--font-outfit),sans-serif]">
        <SiteNav />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
