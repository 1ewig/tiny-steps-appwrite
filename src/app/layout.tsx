import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(process.env.NEXT_PUBLIC_APP_URL)
  : process.env.VERCEL_URL
  ? new URL(`https://${process.env.VERCEL_URL}`)
  : undefined;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Tiny Steps — Low-Friction AI Task Companion",
    template: "%s — Tiny Steps",
  },
  description:
    "Empathetic, zero-pressure task breakdown for ADHD paralysis, burnout, and executive dysfunction. One tiny step at a time.",
  applicationName: "Tiny Steps",
  keywords: [
    "ADHD task breakdown",
    "executive dysfunction",
    "burnout recovery",
    "gentle task manager",
    "focus tunnel",
    "micro actions",
    "anti-overwhelm",
    "Appwrite TablesDB",
  ],
  authors: [{ name: "Tiny Steps" }],
  creator: "Tiny Steps",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Tiny Steps — Low-Friction AI Task Companion",
    description:
      "Empathetic, zero-pressure task breakdown for ADHD paralysis, burnout, and executive dysfunction.",
    type: "website",
    siteName: "Tiny Steps",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Tiny Steps — Low-Friction AI Task Companion",
    description:
      "Empathetic, zero-pressure task breakdown for ADHD paralysis, burnout, and executive dysfunction.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF9F6" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1110" },
  ],
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tiny Steps",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Any",
  description:
    "Empathetic, zero-pressure task breakdown for ADHD paralysis, burnout, and executive dysfunction.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakartaSans.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var raw=localStorage.getItem('tinysteps_zustand_store');if(raw){var data=JSON.parse(raw);if(data&&data.state&&data.state.theme==='dark'){document.documentElement.classList.add('dark');}}}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>
      <body className="h-full flex flex-col font-sans bg-canvas text-text-primary">
        {children}
      </body>
    </html>
  );
}
