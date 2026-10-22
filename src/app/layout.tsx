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
  icons: {
    icon: "/icon.svg",
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
      </head>
      <body className="h-full flex flex-col font-sans bg-oatmeal-100 text-stone-800 dark:bg-dim-950 dark:text-stone-200">
        {children}
      </body>
    </html>
  );
}
