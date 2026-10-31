import Link from "next/link";
import { Activity, Clock, ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 sm:p-12 shadow-xl border border-slate-700">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
            <Activity className="w-3.5 h-3.5" />
            Active Order Governance System
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Every Hour You Buy, In View.
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Orvix gives enterprise Project Leads real-time visibility into external contractor budgets,
            burn-down forecasts, and automated 4-week reorder alerts — with frictionless deliverable-based booking.
          </p>
        </div>
      </div>

      {/* Demo Roles Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span>Select a Role View</span>
          <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2.5 py-0.5 rounded-full">
            Juror Demo Quick-Access
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Project Lead */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Project Lead</h3>
                <p className="text-xs text-slate-500">Deutsche Enterprise AG (Client)</p>
              </div>
              <p className="text-sm text-slate-600">
                Monitor real-time Person-Day burn, inspect active order PO-4500012345, check 4-week reorder alerts, and review deliverables.
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/lead"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition"
              >
                Open Project Lead Cockpit
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: External Consultant */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">External Consultant</h3>
                <p className="text-xs text-slate-500">Agency Alpha GmbH (Supplier)</p>
              </div>
              <p className="text-sm text-slate-600">
                Log working time in seconds against assigned purchase orders. Enforces German Working Time Act (ArbZG 10h limit) on the server.
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/consultant"
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition"
              >
                Open Consultant Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: Purchasing / Finance */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Purchasing & Finance</h3>
                <p className="text-xs text-slate-500">Commercial Governance (Client)</p>
              </div>
              <p className="text-sm text-slate-600">
                Aggregated order drawdown overview. Privacy-compliant (no personal daily logs visible) with 4-week reorder radar warnings.
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/purchasing"
                className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition"
              >
                Open Purchasing View
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 mb-4">Core Hackathon Differentiators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Configurable Supplier Alignment</p>
              <p className="text-slate-600 text-xs mt-1">
                Day-rate conversions (8h = 1 PD), ArbZG limits, and reorder lead times are configurable per purchase order.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">The 4-Week Reorder Radar</p>
              <p className="text-slate-600 text-xs mt-1">
                Forecasts the exact Calendar Week (KW) of budget exhaustion and triggers a warning 4 weeks in advance for Purchasing.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Compliance & Privacy by Design</p>
              <p className="text-slate-600 text-xs mt-1">
                Avoids German *Scheinselbstständigkeit* risks by tracking work packages, not employee punch clocks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

