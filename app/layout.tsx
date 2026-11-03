import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/app/context/LanguageContext";

export const metadata: Metadata = {
  title: "Orvix · Enterprise Order Governance & Burn Radar",
  description: "Real-time budget forecasting & 4-week reorder alerts for external service providers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://fonts.cdnfonts.com" />
        {/* Apple SF Pro & Inter Webfonts for authentic Apple typography across all platforms */}
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/sf-pro-display" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sf-font@1.0.0/stylesheet.min.css" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans antialiased selection:bg-[#0071E3] selection:text-white">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
