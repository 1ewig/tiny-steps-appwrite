import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tiny Steps — Low-Friction AI Task Companion",
  description: "Empathetic, zero-pressure task breakdown for ADHD paralysis, burnout, and executive dysfunction.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakartaSans.variable} h-full antialiased`}>
      <body className="h-full flex flex-col font-sans bg-oatmeal-100 text-stone-800 dark:bg-dim-950 dark:text-stone-200">
        {children}
      </body>
    </html>
  );
}
