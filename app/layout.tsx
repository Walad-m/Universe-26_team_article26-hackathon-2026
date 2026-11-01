import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] antialiased selection:bg-[#0071E3] selection:text-white">
        {children}
      </body>
    </html>
  );
}
