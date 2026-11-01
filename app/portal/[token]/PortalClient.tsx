"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Clock,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  FileText,
  Send,
  LogOut,
  User,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { submitContractorBooking, requestBudgetExtension, logoutPartnerUser, PortalOrderData } from "@/app/actions/portal";

interface Props {
  initialData: PortalOrderData;
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    companyName: string;
  };
}

export default function PortalClient({ initialData, currentUser }: Props) {
  const [data, setData] = useState(initialData);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [hours, setHours] = useState<number | "">(8.0);
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Contractor Extension Request State
  const [showExtensionForm, setShowExtensionForm] = useState(false);
  const [extensionHours, setExtensionHours] = useState<number | "">(40);
  const [extensionReason, setExtensionReason] = useState("");
  const [extensionError, setExtensionError] = useState<string | null>(null);
  const [extensionSuccess, setExtensionSuccess] = useState<string | null>(null);

  const rate = data.hourlyRate || 100.0;

  const handleLogout = () => {
    startTransition(async () => {
      await logoutPartnerUser(data.portalToken);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await submitContractorBooking({
        token: data.portalToken,
        date,
        hours: Number(hours),
        description,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Failed to submit work log.");
      } else {
        setSuccessMessage("Work submitted successfully! Sent to client project lead for review.");

        const newBooking = {
          id: Math.random().toString(),
          date,
          hours: Number(hours),
          personDays: Number((Number(hours) / data.dailyHoursPerDay).toFixed(2)),
          description,
          consultantName: currentUser.name,
          status: "submitted" as const,
        };

        setData((prev) => ({
          ...prev,
          consumedDays: Number((prev.consumedDays + Number(hours) / prev.dailyHoursPerDay).toFixed(2)),
          remainingDays: Number(Math.max(0, prev.remainingDays - Number(hours) / prev.dailyHoursPerDay).toFixed(2)),
          bookings: [newBooking, ...prev.bookings],
        }));

        setDescription("");
      }
    });
  };

  const handleExtensionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExtensionError(null);
    setExtensionSuccess(null);

    startTransition(async () => {
      const result = await requestBudgetExtension({
        token: data.portalToken,
        requestedHours: Number(extensionHours),
        reason: extensionReason,
      });

      if (!result.success) {
        setExtensionError(result.error || "Failed to submit extension request.");
      } else {
        setExtensionSuccess("Budget extension requested! Sent to Deutsche Enterprise AG project lead for review.");

        const newBooking = {
          id: Math.random().toString(),
          date: new Date().toISOString().split("T")[0],
          hours: Number(extensionHours),
          personDays: Number((Number(extensionHours) / data.dailyHoursPerDay).toFixed(2)),
          description: `[Budget Extension Request] ${extensionReason}`,
          consultantName: currentUser.name,
          status: "extension_requested" as const,
        };

        setData((prev) => ({
          ...prev,
          bookings: [newBooking, ...prev.bookings],
        }));

        setExtensionReason("");
        setTimeout(() => setShowExtensionForm(false), 2000);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col antialiased selection:bg-[#1D1D1F] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1D1D1F] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-[#1D1D1F]">
                  {data.supplierName}
                </span>
                <span className="bg-black/[0.04] text-[#1D1D1F] text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  Contractor Portal
                </span>
              </div>
              <p className="text-[11px] text-[#86868B] font-medium leading-none mt-0.5">
                Contracted for Deutsche Enterprise AG · Contract {data.orderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-black/[0.04] border border-black/[0.04] rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
              <div className="w-5 h-5 rounded-full bg-[#1D1D1F] text-white font-bold text-[10px] flex items-center justify-center">
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-semibold text-[#1D1D1F] leading-tight text-xs">{currentUser.name}</p>
                <p className="text-[10px] text-[#86868B] leading-tight">{currentUser.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="text-xs font-medium text-[#86868B] hover:text-[#1D1D1F] px-2.5 py-1.5 rounded-lg border border-black/[0.08] hover:bg-black/[0.03] transition flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 w-full space-y-8 flex-1">
        {/* Project Overview Cards: Money on Top, Days on Bottom, Clean Monochrome */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">Project Scope</p>
              <p className="text-base font-bold text-[#1D1D1F] mt-1 truncate">{data.title}</p>
            </div>
            <p className="text-xs text-[#86868B] font-mono mt-2">{data.orderNumber}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">Agreed Budget</p>
              <p className="text-2xl font-bold text-[#1D1D1F] mt-1 font-mono tabular-nums">
                €{(data.totalBudgetDays * 8 * rate).toLocaleString()}
              </p>
            </div>
            <p className="text-xs text-[#86868B] font-medium mt-2">
              {data.totalBudgetDays} Days · {data.totalBudgetDays * 8} Hours · €{rate}/h
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">Work Logged</p>
              <p className="text-2xl font-bold text-[#1D1D1F] mt-1 font-mono tabular-nums">
                €{(data.consumedDays * 8 * rate).toLocaleString()}
              </p>
            </div>
            <p className="text-xs text-[#86868B] font-medium mt-2">
              {data.consumedDays} Days · {Math.round(data.consumedDays * 8)} Hours spent
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">Remaining Budget</p>
              <p className="text-2xl font-bold text-[#1D1D1F] mt-1 font-mono tabular-nums">
                €{(data.remainingDays * 8 * rate).toLocaleString()}
              </p>
            </div>
            <p className="text-xs text-[#86868B] font-medium mt-2">
              {data.remainingDays} Days · {Math.round(data.remainingDays * 8)} Hours left
            </p>
          </div>
        </div>

        {/* Deliverable Booking Form with Flexible Hours */}
        <div className="bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
          <div className="border-b border-black/[0.06] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#1D1D1F]" />
                Log Your Work & Time
              </h2>
              <p className="text-xs text-[#86868B] mt-1">
                Enter flexible hours worked (e.g. 3.5h, 4h, 8h). German law (ArbZG § 3) permits maximum 10.0 hours per day.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowExtensionForm(!showExtensionForm)}
              className="text-xs font-semibold text-[#1D1D1F] hover:text-black bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.08] px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Need Budget Extension?</span>
              {showExtensionForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Quick Expandable Budget Extension Request Form */}
          {showExtensionForm && (
            <div className="p-5 bg-amber-50/70 border border-amber-200/60 rounded-2xl space-y-4">
              <div>
                <h3 className="text-xs font-bold text-amber-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  Request Budget Extension from Client Project Lead
                </h3>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  If the deliverable scope increased or hours are running low, request extra hours. The client lead will review and approve.
                </p>
              </div>

              {extensionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                  {extensionError}
                </div>
              )}

              {extensionSuccess && (
                <div className="p-3 bg-black/[0.04] border border-black/[0.08] rounded-xl text-xs text-[#1D1D1F] flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#1D1D1F]" />
                  <span className="font-semibold">{extensionSuccess}</span>
                </div>
              )}

              <form onSubmit={handleExtensionSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-amber-900 mb-1">
                      Additional Hours Needed
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="400"
                      value={extensionHours}
                      onChange={(e) => setExtensionHours(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 40"
                      required
                      className="w-full text-xs bg-white border border-amber-300 rounded-xl p-2.5 text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F] focus:outline-none"
                    />
                    <span className="text-[10px] text-amber-800 mt-1 block">
                      {extensionHours ? `+€${(Number(extensionHours) * rate).toLocaleString()} (+${extensionHours} Hours = ${(Number(extensionHours) / 8).toFixed(1)} Days)` : ""}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-amber-900 mb-1">
                      Reason for Extension
                    </label>
                    <input
                      type="text"
                      value={extensionReason}
                      onChange={(e) => setExtensionReason(e.target.value)}
                      placeholder="e.g. Additional security audit & migration testing requested"
                      required
                      className="w-full text-xs bg-white border border-amber-300 rounded-xl p-2.5 text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs"
                  >
                    {isPending ? "Sending..." : "Submit Extension Request"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExtensionForm(false)}
                    className="text-xs text-[#86868B] hover:text-[#1D1D1F] px-3 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50/80 border border-rose-200/60 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 bg-black/[0.04] border border-black/[0.08] rounded-2xl text-xs text-[#1D1D1F] flex items-center gap-2">
              <Check className="w-4 h-4 text-[#1D1D1F] shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                  Consultant Name
                </label>
                <div className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-[#86868B] shrink-0" />
                  <span className="truncate">{currentUser.name}</span>
                </div>
                <span className="text-[10px] text-[#86868B] mt-1 block">
                  Logged-in specialist
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                  Deliverable Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                  Hours Worked (Max 10.0h ArbZG)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="10.0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 3.5, 4.0, 8.0"
                  required
                  className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F] focus:bg-white focus:outline-none font-mono"
                />
                {/* Fast hour selection chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[2, 3.5, 4, 6, 8, 10].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHours(h)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                        hours === h
                          ? "bg-[#1D1D1F] text-white border-[#1D1D1F] font-semibold"
                          : "bg-white text-[#86868B] border-black/[0.08] hover:border-black/[0.2] hover:text-[#1D1D1F]"
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-[#86868B] mt-1.5 block">
                  {hours ? `€${(Number(hours) * rate).toLocaleString()} · ${hours} Hours (${(Number(hours) / 8).toFixed(2)} Days)` : "Enter hours worked"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                Work Deliverable Package Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe milestone deliverable (e.g. Completed API gateway integration and unit tests for order endpoint)..."
                required
                className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F] focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="bg-[#1D1D1F] hover:bg-black disabled:bg-[#86868B] text-white font-semibold py-2.5 px-5 rounded-xl text-xs transition shadow-xs inline-flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isPending ? "Submitting..." : "Submit Work to Client"}
            </button>
          </form>
        </div>

        {/* Deliverables History Table */}
        <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#1D1D1F] text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#86868B]" />
                Your Submitted Work History
              </h3>
              <p className="text-xs text-[#86868B] mt-0.5">
                All work logs and extension requests submitted by {data.supplierName} under contract {data.orderNumber}
              </p>
            </div>
            <span className="text-xs font-semibold bg-black/[0.05] text-[#1D1D1F] px-3 py-1 rounded-full">
              {data.bookings.length} Submissions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F5F7] text-[#86868B] font-semibold border-b border-black/[0.06]">
                <tr>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Specialist</th>
                  <th className="py-3.5 px-5 text-right">Deliverable Value & Time</th>
                  <th className="py-3.5 px-5">Deliverable Description</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {data.bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F5F5F7]/50 transition">
                    <td className="py-3.5 px-5 font-mono text-[#86868B] font-medium">
                      {b.date}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-[#1D1D1F]">
                      {b.consultantName}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-[#1D1D1F]">
                      <div className="font-semibold text-xs">€{(b.hours * rate).toLocaleString()}</div>
                      <div className="text-[10px] text-[#86868B]">{b.personDays} Days ({b.hours}h)</div>
                    </td>
                    <td className="py-3.5 px-5 text-[#1D1D1F] max-w-md">
                      {b.description}
                    </td>
                    <td className="py-3.5 px-5">
                      {b.status === "approved" && (
                        <span className="inline-flex items-center gap-1 bg-black/[0.04] text-[#1D1D1F] border border-black/[0.08] font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                          <Check className="w-3 h-3 text-[#1D1D1F]" />
                          Approved
                        </span>
                      )}
                      {b.status === "submitted" && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-[#0071E3] font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                          <Clock className="w-3 h-3 text-[#0071E3]" />
                          Needs Review
                        </span>
                      )}
                      {b.status === "extension_requested" && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                          <Zap className="w-3 h-3 text-amber-600" />
                          Extension Requested
                        </span>
                      )}
                      {b.status === "rejected" && (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 font-semibold px-2.5 py-0.5 rounded-full text-[11px]" title={b.rejectionReason || ""}>
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
