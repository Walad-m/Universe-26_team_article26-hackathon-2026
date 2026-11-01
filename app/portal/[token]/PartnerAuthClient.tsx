"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Briefcase, AlertCircle, ShieldCheck, ArrowRight, Lock, Mail, User } from "lucide-react";
import { signupPartnerUser, loginPartnerUser, PortalOrderData } from "@/app/actions/portal";

interface Props {
  orderData: PortalOrderData;
}

export default function PartnerAuthClient({ orderData }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");

  // Signup State
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const result = await signupPartnerUser({
        token: orderData.portalToken,
        name,
        email: signupEmail,
        password: signupPassword,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Failed to create account.");
      } else {
        router.refresh();
      }
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const result = await loginPartnerUser({
        token: orderData.portalToken,
        email: loginEmail,
        password: loginPassword,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Failed to log in.");
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center items-center p-4 antialiased selection:bg-[#0071E3] selection:text-white">
      <div className="max-w-md w-full bg-white rounded-3xl border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#1D1D1F] text-white rounded-2xl flex items-center justify-center mx-auto font-bold shadow-sm">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#0071E3] text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {orderData.supplierName} · Project Access
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#1D1D1F]">
            {mode === "signup" ? "Set up your account" : "Log in to portal"}
          </h1>
          <p className="text-xs text-[#86868B] font-medium">
            Contracted by <span className="font-semibold text-[#1D1D1F]">Deutsche Enterprise AG</span> for contract{" "}
            <span className="font-mono font-bold text-[#1D1D1F]">{orderData.orderNumber}</span>
          </p>
        </div>

        {/* Project Context Box */}
        <div className="bg-[#F5F5F7] border border-black/[0.04] rounded-2xl p-3.5 space-y-1 text-xs">
          <div className="flex items-center justify-between text-[#86868B]">
            <span>Project Name:</span>
            <span className="font-bold text-[#1D1D1F]">{orderData.title}</span>
          </div>
          <div className="flex items-center justify-between text-[#86868B]">
            <span>Agreed Budget:</span>
            <span className="font-mono font-bold text-[#1D1D1F]">{orderData.totalBudgetDays} Days (8h = 1 Day)</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-black/[0.05] p-1 border border-black/[0.04] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg transition ${
              mode === "signup"
                ? "bg-white text-[#1D1D1F] shadow-xs font-bold"
                : "text-[#86868B] hover:text-[#1D1D1F]"
            }`}
          >
            Create New Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg transition ${
              mode === "login"
                ? "bg-white text-[#1D1D1F] shadow-xs font-bold"
                : "text-[#86868B] hover:text-[#1D1D1F]"
            }`}
          >
            Existing Login
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50/80 border border-rose-200/60 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Sign Up Form */}
        {mode === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                Your Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abdul-Ghalib"
                  required
                  className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 pl-9 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
                />
                <User className="w-4 h-4 text-[#86868B] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 pl-9 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
                />
                <Mail className="w-4 h-4 text-[#86868B] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 pl-9 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
                />
                <Lock className="w-4 h-4 text-[#86868B] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#1D1D1F] hover:bg-black disabled:bg-[#86868B] text-white font-semibold py-3 rounded-xl text-xs transition shadow-xs inline-flex items-center justify-center gap-2 mt-2"
            >
              {isPending ? "Creating Account..." : "Create Account & Open Portal"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Login Form */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 pl-9 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
                />
                <Mail className="w-4 h-4 text-[#86868B] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 pl-9 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
                />
                <Lock className="w-4 h-4 text-[#86868B] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#1D1D1F] hover:bg-black disabled:bg-[#86868B] text-white font-semibold py-3 rounded-xl text-xs transition shadow-xs inline-flex items-center justify-center gap-2 mt-2"
            >
              {isPending ? "Signing in..." : "Log In & Open Portal"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Legal Limit Notice */}
        <div className="text-center">
          <p className="text-[11px] text-[#86868B] flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1D1D1F]" />
            German labor law compliant · Daily limit max 10 hours
          </p>
        </div>
      </div>
    </div>
  );
}
