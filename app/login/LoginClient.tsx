"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, AlertCircle, ArrowRight } from "lucide-react";
import { loginUser } from "@/app/actions/auth";
import { useLanguage } from "@/app/context/LanguageContext";
import LanguageToggle from "@/app/components/LanguageToggle";

export default function LoginClient() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const result = await loginUser(email, password);
      if (!result.success) {
        setErrorMessage(result.error || "Login failed.");
      } else if (result.redirectUrl) {
        router.push(result.redirectUrl);
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center items-center p-4 antialiased selection:bg-[#0071E3] selection:text-white relative">
      <div className="absolute top-6 right-6">
        <LanguageToggle />
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-8 space-y-6">
        {/* Top Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#1D1D1F] text-white rounded-2xl flex items-center justify-center mx-auto font-bold shadow-sm">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
            {t.loginTitle}
          </h1>
          <p className="text-xs text-[#86868B] font-medium">
            {t.loginSub}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50/80 border border-rose-200/60 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
              {t.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
              {t.passwordLabel}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#1D1D1F] hover:bg-black disabled:bg-[#86868B] text-white font-semibold py-3 rounded-xl text-xs transition shadow-xs mt-2 inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isPending ? t.signingIn : t.loginButton}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
