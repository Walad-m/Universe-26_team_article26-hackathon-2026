"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center p-0.5 rounded-full bg-black/[0.05] border border-black/[0.08] text-xs font-semibold shadow-xs">
      <button
        type="button"
        onClick={() => setLanguage("de")}
        className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer text-[11px] ${
          language === "de"
            ? "bg-white text-[#1D1D1F] shadow-xs font-bold"
            : "text-[#86868B] hover:text-[#1D1D1F]"
        }`}
        title="Deutsch (German)"
      >
        <span>🇩🇪</span>
        <span>DE</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer text-[11px] ${
          language === "en"
            ? "bg-white text-[#1D1D1F] shadow-xs font-bold"
            : "text-[#86868B] hover:text-[#1D1D1F]"
        }`}
        title="English"
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}
