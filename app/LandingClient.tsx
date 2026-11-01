"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  Zap,
  Users,
  BarChart3,
  FileText,
  Plus,
  ExternalLink,
  ChevronRight,
  Calendar,
  Lock,
} from "lucide-react";
import { loginUser, SessionUser } from "@/app/actions/auth";

interface Props {
  currentUser: SessionUser | null;
}

export default function LandingClient({ currentUser }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleQuickLeadLogin = () => {
    startTransition(async () => {
      const res = await loginUser("lead@client.de", "password");
      if (res.success) {
        router.push("/dashboard");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col antialiased selection:bg-[#0071E3] selection:text-white">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1D1D1F] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#1D1D1F]">
                Orvix
              </span>
              <span className="text-[10px] text-[#86868B] block leading-none font-medium mt-0.5">
                Enterprise Order Governance
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <Link
                href="/dashboard"
                className="bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl transition inline-flex items-center gap-1.5 shadow-xs"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-medium text-[#1D1D1F] hover:text-[#0071E3] px-3 py-2 transition"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={handleQuickLeadLogin}
                  disabled={isPending}
                  className="bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl transition inline-flex items-center gap-1.5 shadow-xs"
                >
                  <span>{isPending ? "Connecting..." : "Live Demo"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 sm:pt-24 sm:pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.03)] text-xs font-semibold text-[#1D1D1F]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Article26 Hackathon 2026 · Team Orvix</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1D1D1F] max-w-3xl mx-auto leading-[1.1]">
          Every hour you buy,{" "}
          <span className="bg-gradient-to-r from-[#0071E3] via-[#4387F6] to-[#0071E3] bg-clip-text text-transparent">
            in plain view.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#86868B] max-w-2xl mx-auto font-normal leading-relaxed">
          The smart time booking and budget runway radar for German enterprises buying project work from outside service providers.
          No more guessing how long budget will last.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleQuickLeadLogin}
            disabled={isPending}
            className="w-full sm:w-auto bg-[#1D1D1F] hover:bg-black text-white text-sm font-semibold px-6 py-3.5 rounded-2xl transition shadow-sm inline-flex items-center justify-center gap-2"
          >
            <span>{isPending ? "Launching..." : "Launch Project Lead Dashboard"}</span>
            <ChevronRight className="w-4 h-4 text-[#86868B]" />
          </button>

          <Link
            href="/portal/contractor-portal-2026"
            className="w-full sm:w-auto bg-white hover:bg-black/[0.02] text-[#1D1D1F] border border-black/[0.08] text-sm font-semibold px-6 py-3.5 rounded-2xl transition shadow-xs inline-flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4 text-[#0071E3]" />
            <span>Open Contractor Workspace</span>
          </Link>
        </div>

        <p className="text-xs text-[#86868B] font-medium pt-1">
          Zero installation required · Preloaded with challenge scenario data
        </p>
      </section>

      {/* 3. Live Juror Preset Box */}
      <section className="max-w-5xl mx-auto px-6 pb-16 w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_2px_16px_rgba(0,0,0,0.04)] space-y-6">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0071E3]">
                Evaluation & Jury Access
              </span>
              <h2 className="text-lg font-bold text-[#1D1D1F] mt-0.5">
                Two Sides of the Same Hour
              </h2>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-black/[0.04] text-[#1D1D1F] rounded-full">
              Instant 1-Click Access
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Lead Side */}
            <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#1D1D1F] text-white flex items-center justify-center text-xs font-bold">
                    DE
                  </div>
                  <span className="text-xs font-bold text-[#1D1D1F]">
                    Client Enterprise (Deutsche Enterprise AG)
                  </span>
                </div>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Steer budgets, configure hourly rates (€/h), monitor 4-week reorder radar with holiday adjustments, and review contractor deliverables.
                </p>
                <div className="text-[11px] font-mono text-[#86868B] bg-white p-2 rounded-lg border border-black/[0.04]">
                  Account: lead@client.de · Role: Project Lead
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuickLeadLogin}
                disabled={isPending}
                className="w-full bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition shadow-xs inline-flex items-center justify-center gap-2"
              >
                <span>Enter as Project Lead</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Contractor Side */}
            <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#0071E3] text-white flex items-center justify-center text-xs font-bold">
                    AG
                  </div>
                  <span className="text-xs font-bold text-[#1D1D1F]">
                    External Service Provider (Agency Alpha)
                  </span>
                </div>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  External developers sign in via shared link, book flexible daily hours (3.5h, 4h, 8h) under ArbZG legal limits, and request budget extensions.
                </p>
                <div className="text-[11px] font-mono text-[#86868B] bg-white p-2 rounded-lg border border-black/[0.04]">
                  Invite Token: contractor-portal-2026 · Contract PO-4500012345
                </div>
              </div>

              <Link
                href="/portal/contractor-portal-2026"
                className="w-full bg-white hover:bg-black/[0.02] text-[#1D1D1F] border border-black/[0.08] text-xs font-semibold py-2.5 px-4 rounded-xl transition shadow-xs inline-flex items-center justify-center gap-2"
              >
                <span>Enter External Contractor Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#0071E3]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Innovation Features */}
      <section className="max-w-5xl mx-auto px-6 pb-20 w-full space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            Built for what German enterprises actually need
          </h2>
          <p className="text-xs sm:text-sm text-[#86868B]">
            Every feature directly targets the pain points outlined in the hackathon challenge brief.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1 */}
          <div className="bg-white p-7 rounded-3xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F]">
              4-Week Early Warning Radar
            </h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Purchasing takes 4 weeks to approve follow-up purchase orders. Orvix calculates exact exhaustion weeks considering holiday breaks and triggers reorders well before work stops.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-7 rounded-3xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F]">
              Multi-Metric Clarity (Days, Hours & Money)
            </h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Consultants record hours; contracts count person-days; purchasing tracks Euros (€). Orvix presents all three simultaneously in plain language with zero confusing corporate jargon.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-7 rounded-3xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F]">
              German Working Time Compliance (ArbZG § 3)
            </h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Enforces statutory 10.0h daily working limits server-side while supporting realistic flexible hours (e.g., 3.5h, 4h, 7.5h). Rejects non-compliant bookings automatically.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-7 rounded-3xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F]">
              Bidirectional Budget Extensions
            </h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              When deliverables grow, external contractors can submit a budget extension request with reason directly from their portal. The Project Lead reviews and approves it in 1 click.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Clean Footer */}
      <footer className="border-t border-black/[0.06] bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#86868B]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1D1D1F]">Orvix</span>
            <span>·</span>
            <span>Article26 Hackathon 2026</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link href="/login" className="hover:text-[#1D1D1F] transition">
              Sign In
            </Link>
            <Link href="/portal/contractor-portal-2026" className="hover:text-[#1D1D1F] transition">
              Contractor Portal
            </Link>
            <a
              href="https://github.com/Walad-m/Universe-26_team_article26-hackathon-2026"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#1D1D1F] transition flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

