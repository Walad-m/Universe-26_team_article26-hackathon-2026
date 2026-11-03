"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  BarChart3,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { quickLoginAsLead } from "@/app/actions/auth";
import { useLanguage } from "@/app/context/LanguageContext";
import LanguageToggle from "@/app/components/LanguageToggle";

interface Props {
  currentUser?: {
    name: string;
    email: string;
    role: string;
    companyName: string;
  } | null;
}

export default function LandingClient({ currentUser }: Props) {
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  const handleQuickLeadLogin = () => {
    startTransition(async () => {
      await quickLoginAsLead();
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col antialiased selection:bg-[#0071E3] selection:text-white">
      {/* 1. Global Navigation Bar (Apple Style Translucent) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1D1D1F] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              O
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#1D1D1F]">
                Orvix
              </span>
              <span className="text-[10px] text-[#86868B] block leading-none font-medium mt-0.5">
                {t.brandSubtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />

            {currentUser ? (
              <Link
                href="/dashboard"
                className="bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold px-4 py-2 rounded-full transition inline-flex items-center gap-1.5 shadow-xs"
              >
                <span>{t.dashboard}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-medium text-[#1D1D1F] hover:text-[#0071E3] px-3 py-2 transition"
                >
                  {t.signIn}
                </Link>
                <button
                  type="button"
                  onClick={handleQuickLeadLogin}
                  disabled={isPending}
                  className="bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold px-4 py-2 rounded-full transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>{isPending ? t.connecting : t.liveDemo}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Apple.com Hero Pattern) */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-16 sm:pt-24 sm:pb-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.03)] text-xs font-semibold text-[#1D1D1F]">
          <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-pulse" />
          <span>{t.heroBadge}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1D1D1F] max-w-3xl mx-auto leading-[1.08]">
          {t.heroHeadline1}
          <span className="bg-gradient-to-r from-[#0071E3] via-[#4387F6] to-[#0071E3] bg-clip-text text-transparent">
            {t.heroHeadline2}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#86868B] max-w-2xl mx-auto font-normal leading-relaxed">
          {t.heroSub}
        </p>

        {/* Hero CTA Dual-Pill Architecture (Apple Duo Pattern) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleQuickLeadLogin}
            disabled={isPending}
            className="w-full sm:w-auto bg-[#0071E3] hover:bg-[#0077ED] text-white text-sm font-semibold px-7 py-3 rounded-full transition shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isPending ? t.connecting : t.launchDashboard}</span>
            <ChevronRight className="w-4 h-4 text-white/80" />
          </button>

          <Link
            href="/login"
            className="w-full sm:w-auto border border-[#0071E3] text-[#0071E3] hover:bg-[#0071E3]/5 text-sm font-semibold px-7 py-3 rounded-full transition inline-flex items-center justify-center gap-2"
          >
            <span>{t.signIn}</span>
          </Link>
        </div>

        <p className="text-xs text-[#86868B] font-medium pt-1">
          {t.zeroInstall}
        </p>
      </section>

      {/* 3. Core Innovation Features (Apple Bento Cards) */}
      <section className="max-w-5xl mx-auto px-6 pb-20 w-full space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
            {t.builtForNeedTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#86868B]">
            {t.builtForNeedSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1 */}
          <div className="bg-white p-7 rounded-3xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F]">
              {t.feature1Title}
            </h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              {t.feature1Desc}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-7 rounded-3xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F]">
              {t.feature2Title}
            </h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              {t.feature2Desc}
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-7 rounded-3xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-black/[0.04] text-[#1D1D1F] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F]">
              {t.feature3Title}
            </h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              {t.feature3Desc}
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-7 rounded-3xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F]">
              {t.feature4Title}
            </h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              {t.feature4Desc}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Clean Footer */}
      <footer className="border-t border-black/[0.06] bg-white mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#86868B]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1D1D1F]">Orvix</span>
            <span>·</span>
            <span>Article26 Hackathon 2026</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link href="/login" className="hover:text-[#0071E3] transition">
              {t.signIn}
            </Link>
            <a
              href="https://github.com/Walad-m/Universe-26_team_article26-hackathon-2026"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#0071E3] transition flex items-center gap-1"
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
