import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Clock, ShieldCheck, Activity, Users } from "lucide-react";

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
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-600 text-white p-2 rounded-lg flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <Link href="/" className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                ORVIX
                <span className="text-xs uppercase bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  Cockpit
                </span>
              </Link>
            </div>

            <nav className="flex items-center space-x-6 text-sm font-medium text-slate-600">
              <Link href="/lead" className="hover:text-emerald-600 transition flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                Project Lead (Radar)
              </Link>
              <Link href="/consultant" className="hover:text-emerald-600 transition flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                Consultant Portal
              </Link>
              <Link href="/purchasing" className="hover:text-emerald-600 transition flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Purchasing View
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          Article26 Hackathon 2026 · Team Orvix · Built for Deutsche Enterprise AG
        </footer>
      </body>
    </html>
  );
}

