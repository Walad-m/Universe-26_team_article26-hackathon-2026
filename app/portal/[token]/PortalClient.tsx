"use client";

import { useState, useTransition, useRef } from "react";
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
  Image as ImageIcon,
  Upload,
  X,
  Paperclip,
} from "lucide-react";
import { submitContractorBooking, requestBudgetExtension, logoutPartnerUser, PortalOrderData } from "@/app/actions/portal";
import { useLanguage } from "@/app/context/LanguageContext";
import LanguageToggle from "@/app/components/LanguageToggle";

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
  const { t } = useLanguage();
  const [data, setData] = useState(initialData);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [hours, setHours] = useState<number | "">(8.0);
  const [description, setDescription] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (.png, .jpg, .jpeg, .webp).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Screenshot/image size must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachmentUrl(event.target?.result as string);
      setAttachmentName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachmentUrl(null);
    setAttachmentName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        attachmentUrl: attachmentUrl || undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Failed to submit work log.");
      } else {
        setSuccessMessage("Work submitted successfully! Sent to client project lead for review.");

        const newBooking = {
          id: Math.random().toString(),
          userId: currentUser.id,
          date,
          hours: Number(hours),
          personDays: Number((Number(hours) / data.dailyHoursPerDay).toFixed(2)),
          description,
          attachmentUrl: attachmentUrl || null,
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
        removeAttachment();
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
          userId: currentUser.id,
          date: new Date().toISOString().split("T")[0],
          hours: Number(extensionHours),
          personDays: Number((Number(extensionHours) / data.dailyHoursPerDay).toFixed(2)),
          description: `[Budget Extension Request] ${extensionReason}`,
          attachmentUrl: null,
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
            <LanguageToggle />

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
              className="text-xs font-medium text-[#86868B] hover:text-[#1D1D1F] px-2.5 py-1.5 rounded-lg border border-black/[0.08] hover:bg-black/[0.03] transition flex items-center gap-1.5 cursor-pointer"
              title={t.signOut}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.signOut}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 w-full space-y-8 flex-1">
        {/* Project Overview Cards: Money on Top, Days on Bottom, Clean Monochrome */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">{t.projectScope}</p>
              <p className="text-base font-bold text-[#1D1D1F] mt-1 truncate">{data.title}</p>
            </div>
            <p className="text-xs text-[#86868B] font-mono mt-2">{data.orderNumber}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">{t.totalContractBudget}</p>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-[#1D1D1F] font-mono block">
                €{(data.totalBudgetDays * 8 * rate).toLocaleString()}
              </span>
              <span className="text-xs text-[#86868B] block mt-0.5">
                {data.totalBudgetDays} {t.days} ({data.totalBudgetDays * 8} {t.hours})
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">{t.burnedAcrossProject}</p>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-[#1D1D1F] font-mono block">
                €{(data.consumedDays * 8 * rate).toLocaleString()}
              </span>
              <span className="text-xs text-[#86868B] block mt-0.5">
                {data.consumedDays} {t.days} ({Math.round(data.consumedDays * 8)} {t.hours})
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">{t.remainingFreeBudget}</p>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-[#1D1D1F] font-mono block">
                €{(data.remainingDays * 8 * rate).toLocaleString()}
              </span>
              <span className="text-xs text-[#86868B] block mt-0.5">
                {data.remainingDays} {t.days} ({Math.round(data.remainingDays * 8)} {t.hoursLeft})
              </span>
            </div>
          </div>
        </div>

        {/* Action Error / Success Banners */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs text-rose-800 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Budget Extension Toggle Section */}
        <div className="bg-white rounded-3xl border border-black/[0.06] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#0071E3]" />
                Deliverable Growing Beyond Scope?
              </h3>
              <p className="text-xs text-[#86868B] mt-0.5">
                Request an official budget extension directly from the Deutsche Enterprise AG Project Lead
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowExtensionForm(!showExtensionForm)}
              className="text-xs font-semibold text-[#0071E3] hover:text-[#0077ED] border border-[#0071E3]/30 px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{showExtensionForm ? t.closeForm : t.requestBudgetExtension}</span>
              {showExtensionForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showExtensionForm && (
            <form onSubmit={handleExtensionSubmit} className="pt-3 border-t border-black/[0.06] space-y-4">
              {extensionError && (
                <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{extensionError}</span>
                </div>
              )}
              {extensionSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{extensionSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                    {t.additionalHours}
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={extensionHours}
                    onChange={(e) => setExtensionHours(e.target.value === "" ? "" : Number(e.target.value))}
                    required
                    className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
                  />
                  <span className="text-[10px] text-[#86868B] mt-1 block">
                    {extensionHours ? `≈ ${(Number(extensionHours) / 8).toFixed(1)} ${t.days} (€${(Number(extensionHours) * rate).toLocaleString()})` : "Enter hours"}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                    {t.extensionReason}
                  </label>
                  <input
                    type="text"
                    value={extensionReason}
                    onChange={(e) => setExtensionReason(e.target.value)}
                    placeholder="e.g. Unforeseen legacy SOAP API integration complexity"
                    required
                    className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold px-5 py-2.5 rounded-full transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {isPending ? t.submitting : t.sendExtensionRequest}
              </button>
            </form>
          )}
        </div>

        {/* Submit Work Deliverable Section */}
        <div className="bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
          <div className="border-b border-black/[0.06] pb-4">
            <h2 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
              <Send className="w-4 h-4 text-[#0071E3]" />
              {t.submitNewWorkPackage}
            </h2>
            <p className="text-xs text-[#86868B] mt-0.5">
              {t.submitWorkPackageSub} {data.orderNumber} ({t.hourlyRate}: €{rate}/h)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                  {t.dateOfWork}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={data.startDate || undefined}
                  required
                  className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
                />
                {data.startDate && (
                  <span className="text-[10px] text-[#86868B] mt-1 block">
                    {t.schedule}: {data.startDate} {data.endDate ? `→ ${data.endDate}` : ""}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                  {t.hoursWorked}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10.0"
                    value={hours}
                    onChange={(e) => setHours(e.target.value === "" ? "" : Number(e.target.value))}
                    required
                    className="w-28 text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none font-mono"
                  />
                  {[4, 7.5, 8].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHours(h)}
                      className={`text-[10px] px-3 py-1 rounded-full border transition cursor-pointer ${
                        hours === h
                          ? "bg-[#0071E3] text-white border-[#0071E3] font-semibold"
                          : "bg-white text-[#86868B] border-black/[0.08] hover:border-[#0071E3]/30 hover:text-[#1D1D1F]"
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-[#86868B] mt-1.5 block">
                  {hours ? `€${(Number(hours) * rate).toLocaleString()} · ${hours} ${t.hours} (${(Number(hours) / 8).toFixed(2)} ${t.days})` : "Enter hours worked"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                {t.workDescription}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe milestone deliverable (e.g. Completed API gateway integration and unit tests for order endpoint)..."
                required
                className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
              />
            </div>

            {/* Proof of Work Screenshot / Image Upload (Optional Feature) */}
            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                {t.attachProof}
              </label>

              {attachmentUrl ? (
                <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-200/60 rounded-2xl text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={attachmentUrl}
                      alt="Deliverable thumbnail"
                      className="w-10 h-10 object-cover rounded-lg border border-black/[0.06] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1D1D1F] truncate">{attachmentName || "Proof attachment"}</p>
                      <p className="text-[10px] text-[#86868B]">Ready to submit with work package</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="text-[#86868B] hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition cursor-pointer"
                    title={t.removeAttachment}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-black/[0.12] rounded-2xl p-4 text-center bg-[#F5F5F7]/50 hover:bg-[#F5F5F7] transition cursor-pointer relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1 pointer-events-none">
                    <Upload className="w-5 h-5 text-[#86868B]" />
                    <p className="text-xs font-medium text-[#1D1D1F]">
                      {t.attachProof}
                    </p>
                    <p className="text-[10px] text-[#86868B]">
                      {t.uploadHint}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="bg-[#0071E3] hover:bg-[#0077ED] disabled:bg-[#86868B] text-white font-semibold py-2.5 px-6 rounded-full text-xs transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {isPending ? t.submitting : t.submitWorkLog}
            </button>
          </form>
        </div>

        {/* Deliverables History Table */}
        <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#1D1D1F] text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#86868B]" />
                {t.workHistoryHeader}
              </h3>
              <p className="text-xs text-[#86868B] mt-0.5">
                {t.workHistorySub}
              </p>
            </div>
            <span className="text-xs font-semibold bg-black/[0.05] text-[#1D1D1F] px-3 py-1 rounded-full">
              {data.bookings.length} {t.totalSubmissions}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F5F7] text-[#86868B] font-semibold border-b border-black/[0.06]">
                <tr>
                  <th className="py-3.5 px-5">{t.dateCol}</th>
                  <th className="py-3.5 px-5">{t.specialistCol}</th>
                  <th className="py-3.5 px-5 text-right">{t.deliverableValCol}</th>
                  <th className="py-3.5 px-5">{t.whatWasBuiltCol}</th>
                  <th className="py-3.5 px-5">{t.statusCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {data.bookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-[#86868B]">
                      No deliverables submitted yet. Use the form above to submit your first work package.
                    </td>
                  </tr>
                ) : (
                  data.bookings.map((b) => (
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
                        <div>{b.description}</div>
                        {b.attachmentUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewModalImg(b.attachmentUrl || null)}
                            className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#0071E3] hover:text-[#0077ED] bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-200/50 transition cursor-pointer"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>View Deliverable Proof</span>
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        {b.status === "approved" && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Approved
                          </span>
                        )}
                        {b.status === "submitted" && (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-[#0071E3] font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                            <Clock className="w-3 h-3 text-[#0071E3]" />
                            {t.needsReview}
                          </span>
                        )}
                        {b.status === "extension_requested" && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                            <Zap className="w-3 h-3 text-amber-600" />
                            {t.extensionRequested}
                          </span>
                        )}
                        {b.status === "rejected" && (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 font-semibold px-2.5 py-0.5 rounded-full text-[11px]" title={b.rejectionReason || ""}>
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            {t.rejected}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Image Preview Modal */}
      {previewModalImg && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewModalImg(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-black/[0.08] shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0071E3]" />
                <h3 className="font-bold text-sm text-[#1D1D1F]">{t.proofModalTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="text-[#86868B] hover:text-[#1D1D1F] p-1 rounded-lg hover:bg-black/[0.04] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-2xl border border-black/[0.06] bg-[#F5F5F7] flex items-center justify-center p-2">
              <img
                src={previewModalImg}
                alt="Deliverable proof attachment"
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-xs"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold px-5 py-2 rounded-full transition shadow-xs cursor-pointer"
              >
                {t.closePreview}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
