"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Link2,
  Copy,
  Check,
  Briefcase,
  Calendar,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Zap,
  Users,
  Wallet,
  ArrowUpRight,
  Sun,
  LayoutDashboard,
  FileCheck,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import {
  createOrderAndGenerateLink,
  approveBooking,
  rejectBooking,
  createReorderProposal,
  DashboardMetrics,
  BookingDisplayItem,
} from "@/app/actions/dashboard";
import { logoutUser } from "@/app/actions/auth";

interface OrderItem {
  id: string;
  orderNumber: string;
  title: string;
  description: string | null;
  totalBudgetDays: number;
  bookedDays: number;
  remainingDays: number;
  startDate: string;
  endDate: string;
  portalToken: string;
  supplierName: string;
  status: string;
}

interface Props {
  initialData: {
    currentUser: {
      name: string;
      email: string;
      role: string;
      companyName: string;
      companyType: string;
    };
    metrics: DashboardMetrics;
    orders: OrderItem[];
    bookings: BookingDisplayItem[];
  };
}

export default function DashboardClient({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<"overview" | "approvals" | "links">("overview");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Holiday shutdown simulator toggle
  const [includeShutdown, setIncludeShutdown] = useState(true);

  // Form State to Onboard External Company & Generate Link
  const [externalCompanyName, setExternalCompanyName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [budgetDays, setBudgetDays] = useState<number | "">("");
  const [hourlyRate, setHourlyRate] = useState<number | "">(100);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");

  const [newlyGeneratedUrl, setNewlyGeneratedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCopy = (token: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setNewlyGeneratedUrl(null);

    const rate = Number(hourlyRate) || 100.0;
    const days = Number(budgetDays);

    startTransition(async () => {
      const result = await createOrderAndGenerateLink({
        externalCompanyName,
        projectName,
        orderNumber,
        budgetDays: days,
        hourlyRate: rate,
        startDate,
        endDate: endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });

      if (!result.success) {
        setErrorMessage(result.error || "Failed to generate link.");
      } else {
        const fullLink = `${window.location.origin}/portal/${result.generatedToken}`;
        setNewlyGeneratedUrl(fullLink);

        const newOrder: OrderItem = {
          id: result.orderId || Math.random().toString(),
          orderNumber,
          title: projectName,
          description: null,
          totalBudgetDays: days,
          bookedDays: 0,
          remainingDays: days,
          startDate,
          endDate: endDate || "2027-02-15",
          portalToken: result.generatedToken || "",
          supplierName: externalCompanyName,
          status: "active",
        };

        setData((prev) => ({
          ...prev,
          orders: [newOrder, ...prev.orders],
          metrics: {
            ...prev.metrics,
            totalBudgetDays: Number((prev.metrics.totalBudgetDays + days).toFixed(1)),
            totalBudgetHours: prev.metrics.totalBudgetHours + days * 8,
            totalBudgetMoney: prev.metrics.totalBudgetMoney + days * 8 * rate,
            remainingBudgetDays: Number((prev.metrics.remainingBudgetDays + days).toFixed(1)),
            remainingBudgetHours: prev.metrics.remainingBudgetHours + days * 8,
            remainingBudgetMoney: prev.metrics.remainingBudgetMoney + days * 8 * rate,
            activeContractsCount: prev.metrics.activeContractsCount + 1,
            externalPartnersCount: prev.metrics.externalPartnersCount + 1,
          },
        }));

        setExternalCompanyName("");
        setProjectName("");
        setOrderNumber("");
        setBudgetDays("");
        setHourlyRate(100);
        setEndDate("");
      }
    });
  };

  const handleApprove = (bookingId: string) => {
    startTransition(async () => {
      const res = await approveBooking(bookingId);
      if (res.success) {
        setActionSuccess("Approved successfully!");
        setTimeout(() => setActionSuccess(null), 3000);

        setData((prev) => {
          const booking = prev.bookings.find((b) => b.id === bookingId);
          const isExtension = booking?.status === "extension_requested";
          const extraHours = isExtension && booking ? booking.hours : 0;
          const extraDays = Number((extraHours / 8.0).toFixed(1));

          return {
            ...prev,
            bookings: prev.bookings.map((b) =>
              b.id === bookingId ? { ...b, status: "approved" as const } : b
            ),
            metrics: {
              ...prev.metrics,
              totalBudgetDays: Number((prev.metrics.totalBudgetDays + extraDays).toFixed(1)),
              totalBudgetHours: prev.metrics.totalBudgetHours + extraHours,
              totalBudgetMoney: prev.metrics.totalBudgetMoney + extraHours * 100,
              remainingBudgetDays: Number((prev.metrics.remainingBudgetDays + extraDays).toFixed(1)),
              remainingBudgetHours: prev.metrics.remainingBudgetHours + extraHours,
              remainingBudgetMoney: prev.metrics.remainingBudgetMoney + extraHours * 100,
              pendingReviewDays: Math.max(0, prev.metrics.pendingReviewDays - (isExtension ? 0 : 1.0)),
            },
          };
        });
      }
    });
  };

  const handleReject = (bookingId: string) => {
    const reason = prompt("Enter a brief reason for rejecting this work log:", "Work exceeds agreed daily scope");
    if (!reason) return;

    startTransition(async () => {
      const res = await rejectBooking(bookingId, reason);
      if (res.success) {
        setActionSuccess("Work log rejected and returned to contractor with feedback.");
        setTimeout(() => setActionSuccess(null), 3000);

        setData((prev) => ({
          ...prev,
          bookings: prev.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: "rejected" as const, rejectionReason: reason } : b
          ),
        }));
      }
    });
  };

  const handleCreateReorderProposal = () => {
    startTransition(async () => {
      const primaryOrder = data.orders[0];
      const res = await createReorderProposal(primaryOrder?.id, data.metrics.forecast.missingPersonDays);
      if (res.success) {
        setActionSuccess(res.message || "Budget extension request sent to Purchasing!");
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        setErrorMessage(res.error || "Failed to create budget request.");
      }
    });
  };

  const pendingBookingsCount = data.bookings.filter((b) => b.status === "submitted").length;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col md:flex-row antialiased selection:bg-[#0071E3] selection:text-white">
      {/* 1. Sleek Apple-Style Left Sidebar (Desktop) */}
      <aside className="w-64 lg:w-72 bg-white/95 backdrop-blur-md border-r border-black/[0.06] flex-col justify-between h-screen sticky top-0 shrink-0 z-40 hidden md:flex">
        {/* Brand & Organization */}
        <div>
          <div className="p-5 lg:p-6 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1D1D1F] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-sm text-[#1D1D1F] truncate tracking-tight">
                  {data.currentUser.companyName}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider">
                    Client Organization
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items (The Side Bar) */}
          <div className="p-3.5 space-y-1">
            <p className="px-3 text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-2 mt-1">
              Management Cockpit
            </p>

            {/* Tab 1: Budget & Forecast */}
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "overview"
                  ? "bg-[#1D1D1F] text-white shadow-xs"
                  : "text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.03]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className={`w-4 h-4 ${activeTab === "overview" ? "text-white" : "text-[#86868B]"}`} />
                <span>Budget & Forecast</span>
              </div>
            </button>

            {/* Tab 2: Review Work Logs */}
            <button
              type="button"
              onClick={() => setActiveTab("approvals")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "approvals"
                  ? "bg-[#1D1D1F] text-white shadow-xs"
                  : "text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.03]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck className={`w-4 h-4 ${activeTab === "approvals" ? "text-white" : "text-[#86868B]"}`} />
                <span>Review Work Logs</span>
              </div>
              {pendingBookingsCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === "approvals"
                      ? "bg-white text-[#1D1D1F]"
                      : "bg-[#0071E3] text-white"
                  }`}
                >
                  {pendingBookingsCount}
                </span>
              )}
            </button>

            {/* Tab 3: Contractor Access Links */}
            <button
              type="button"
              onClick={() => setActiveTab("links")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "links"
                  ? "bg-[#1D1D1F] text-white shadow-xs"
                  : "text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.03]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Link2 className={`w-4 h-4 ${activeTab === "links" ? "text-white" : "text-[#86868B]"}`} />
                <span>Contractor Access Links</span>
              </div>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  activeTab === "links" ? "text-white/70" : "text-[#86868B]"
                }`}
              >
                {data.orders.length}
              </span>
            </button>
          </div>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-4 border-t border-black/[0.06]">
          <div className="p-3 bg-[#F5F5F7] rounded-2xl flex items-center justify-between border border-black/[0.04]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#1D1D1F] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {data.currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#1D1D1F] truncate leading-tight">
                  {data.currentUser.name}
                </p>
                <p className="text-[10px] text-[#86868B] font-medium truncate capitalize">
                  Project Lead
                </p>
              </div>
            </div>

            <form action={logoutUser}>
              <button
                type="submit"
                title="Sign Out"
                className="text-[#86868B] hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Canvas (Right Side) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Navigation Header (Shows only on mobile screens) */}
        <header className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-black/[0.06] px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1D1D1F] text-white flex items-center justify-center font-bold text-xs">
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-bold text-xs text-[#1D1D1F] truncate">{data.currentUser.companyName}</span>
            </div>
            <form action={logoutUser}>
              <button type="submit" title="Sign Out" className="text-xs text-[#86868B] hover:text-[#1D1D1F] p-1">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-[#F5F5F7] p-1 rounded-xl text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`py-1.5 px-2 rounded-lg transition text-center truncate ${
                activeTab === "overview" ? "bg-white text-[#1D1D1F] font-semibold shadow-xs" : "text-[#86868B]"
              }`}
            >
              Budget
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("approvals")}
              className={`py-1.5 px-2 rounded-lg transition text-center truncate ${
                activeTab === "approvals" ? "bg-white text-[#1D1D1F] font-semibold shadow-xs" : "text-[#86868B]"
              }`}
            >
              Reviews {pendingBookingsCount > 0 ? `(${pendingBookingsCount})` : ""}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("links")}
              className={`py-1.5 px-2 rounded-lg transition text-center truncate ${
                activeTab === "links" ? "bg-white text-[#1D1D1F] font-semibold shadow-xs" : "text-[#86868B]"
              }`}
            >
              Links
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="max-w-6xl mx-auto px-6 py-8 w-full space-y-8 flex-1">
          {/* Active Section Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
              {activeTab === "overview" && "Budget & Forecast"}
              {activeTab === "approvals" && "Review Work Logs"}
              {activeTab === "links" && "Contractor Access Links"}
            </h1>
            <p className="text-xs text-[#86868B] font-medium mt-1">
              {activeTab === "overview" && `Tracking burn pace and holiday-adjusted forecast across ${data.orders.length} external contracts`}
              {activeTab === "approvals" && "Verify contractor daily deliverable hours and approve budget extensions"}
              {activeTab === "links" && `Create secure workspace access links with configurable hourly rates (€/h)`}
            </p>
          </div>

          {/* Action Success or Error Notification */}
          {actionSuccess && (
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/60 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{actionSuccess}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-rose-50/80 border border-rose-200/60 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: BUDGET & FORECAST */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* 4 Clean Metric Cards in Plain Language (Days, Hours & Money) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-[#86868B] font-medium">
                    <span>Agreed Budget</span>
                    <span className="text-[10px] bg-black/[0.04] px-2 py-0.5 rounded-md font-semibold text-[#1D1D1F]">
                      {data.orders.length} Active Contracts
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-extrabold tracking-tight text-[#1D1D1F] font-mono tabular-nums">
                      {data.metrics.totalBudgetDays} <span className="text-base font-medium text-[#86868B]">Days</span>
                    </div>
                    <p className="text-xs font-semibold text-[#1D1D1F] mt-1">
                      €{data.metrics.totalBudgetMoney.toLocaleString()} <span className="text-[#86868B] font-normal">({data.metrics.totalBudgetHours.toLocaleString()} Hours)</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-[#86868B] font-medium">
                    <span>Work Completed</span>
                    <span className="text-[10px] bg-blue-50 text-[#0071E3] px-2 py-0.5 rounded-md font-semibold">
                      {data.metrics.totalBookedHours}h Logged
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-extrabold tracking-tight text-[#0071E3] font-mono tabular-nums">
                      {data.metrics.totalBookedDays} <span className="text-base font-medium text-[#0071E3]/70">Days</span>
                    </div>
                    <p className="text-xs font-semibold text-[#0071E3] mt-1">
                      €{data.metrics.totalBookedMoney.toLocaleString()} <span className="text-[#86868B] font-normal">spent so far</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-[#86868B] font-medium">
                    <span>Budget Remaining</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold">
                      Available
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-extrabold tracking-tight text-emerald-600 font-mono tabular-nums">
                      {data.metrics.remainingBudgetDays} <span className="text-base font-medium text-emerald-600/70">Days</span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-600 mt-1">
                      €{data.metrics.remainingBudgetMoney.toLocaleString()} <span className="text-[#86868B] font-normal">({data.metrics.remainingBudgetHours.toLocaleString()} Hours left)</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-[#86868B] font-medium">
                    <span>When Budget Runs Out</span>
                    <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-semibold">
                      Order More by Wk 47
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-extrabold tracking-tight text-[#1D1D1F] font-mono tabular-nums">
                      {includeShutdown ? "Week 51" : "Week 50"}
                    </div>
                    <p className="text-xs font-medium text-[#86868B] mt-1">
                      Mid-December 2026
                    </p>
                  </div>
                </div>
              </div>

              {/* The Smart Forecaster Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Budget Forecaster</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
                      How Long Will the Budget Last?
                    </h2>
                    <p className="text-xs text-[#86868B] mt-0.5">
                      Calculates the exact date your budget will run out based on how fast contractors are working
                    </p>
                  </div>

                  {/* Holiday Toggle */}
                  <div className="flex items-center gap-3 bg-[#F5F5F7] p-2 px-3.5 rounded-xl border border-black/[0.04]">
                    <label htmlFor="shutdown-toggle" className="text-xs font-semibold text-[#1D1D1F] cursor-pointer">
                      December Holiday Break (Dec 24 – Jan 6)
                    </label>
                    <input
                      id="shutdown-toggle"
                      type="checkbox"
                      checked={includeShutdown}
                      onChange={(e) => setIncludeShutdown(e.target.checked)}
                      className="w-4 h-4 accent-[#0071E3] rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* 3 Simple Column Numbers (Days, Hours & Money) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-[#86868B]">Contractor Working Pace</span>
                    <p className="text-2xl font-bold text-[#1D1D1F] font-mono tabular-nums">
                      {data.metrics.forecast.weeklyBurnRate} Days <span className="text-xs font-normal text-[#86868B]">/ week</span>
                    </p>
                    <p className="text-[11px] font-semibold text-[#1D1D1F]">
                      €{(data.metrics.forecast.weeklyBurnRate * 8 * 100).toLocaleString()} <span className="font-normal text-[#86868B]">({data.metrics.forecast.weeklyBurnRate * 8} Hours / week)</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-[#86868B]">Predicted Date Money Runs Out</span>
                    <p className="text-2xl font-bold text-[#1D1D1F] font-mono tabular-nums">
                      {includeShutdown ? "Week 51" : "Week 50"} <span className="text-xs font-normal text-[#86868B]">(mid-Dec 2026)</span>
                    </p>
                    <p className="text-[11px] text-[#86868B]">
                      {includeShutdown
                        ? "Includes the 2-week Christmas shutdown when no work is billed"
                        : "Direct pace calculation without holiday break"}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-[#86868B]">
                      {data.metrics.forecast.missingPersonDays > 0 ? "Shortage until Project Ends (Feb 2027)" : "Budget Status"}
                    </span>
                    {data.metrics.forecast.missingPersonDays > 0 ? (
                      <>
                        <p className="text-2xl font-bold text-[#FF3B30] font-mono tabular-nums">
                          ≈ {data.metrics.forecast.missingPersonDays} Days Short
                        </p>
                        <p className="text-[11px] font-semibold text-[#FF3B30]">
                          €{data.metrics.missingBudgetMoney.toLocaleString()} Extra Needed <span className="font-normal text-[#86868B]">({data.metrics.missingBudgetHours} Hours)</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
                          Fully Funded
                        </p>
                        <p className="text-[11px] font-semibold text-emerald-700">
                          0 Days Shortage <span className="font-normal text-[#86868B]">({data.metrics.remainingBudgetDays} Days / {data.metrics.remainingBudgetHours}h available)</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Early Warning Banner & 1-Click Request */}
                {data.metrics.forecast.missingPersonDays > 0 ? (
                  <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>4-Week Early Warning: Must request more budget by Week {data.metrics.forecast.reorderDeadlineWeek}</span>
                      </div>
                      <p className="text-xs text-amber-800">
                        Purchasing takes 4 weeks to approve paperwork. You must request extra budget before Week {data.metrics.forecast.reorderDeadlineWeek} so contractors do not stop working.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCreateReorderProposal}
                      disabled={isPending}
                      className="bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs inline-flex items-center gap-2 shrink-0 self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      {isPending ? "Submitting..." : `Request Extra €${data.metrics.missingBudgetMoney.toLocaleString()} (${data.metrics.forecast.missingPersonDays} Days)`}
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Budget Runway Healthy: No Shortage Detected</span>
                      </div>
                      <p className="text-xs text-emerald-800">
                        Current budget covers all planned milestones at current pace. Purchasing reorder paperwork is not needed at this time.
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full shrink-0">
                      ✅ Runway Healthy
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: REVIEW & APPROVE WORK LOGS */}
          {activeTab === "approvals" && (
            <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#1D1D1F]">
                    Review & Approve Work Logs
                  </h2>
                  <p className="text-xs text-[#86868B] mt-0.5">
                    Check work submitted by external contractors before invoices are paid
                  </p>
                </div>
                <span className="text-xs font-semibold bg-black/[0.05] text-[#1D1D1F] px-3 py-1 rounded-full">
                  {data.bookings.length} Total Submissions
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F5F7] text-[#86868B] font-semibold border-b border-black/[0.06]">
                    <tr>
                      <th className="py-3.5 px-5">Date</th>
                      <th className="py-3.5 px-5">Contract Number</th>
                      <th className="py-3.5 px-5">Company</th>
                      <th className="py-3.5 px-5">Specialist Name</th>
                      <th className="py-3.5 px-5 text-right">Time Worked</th>
                      <th className="py-3.5 px-5">What Was Built</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {data.bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-[#F5F5F7]/50 transition">
                        <td className="py-3.5 px-5 font-mono text-[#86868B]">{b.date}</td>
                        <td className="py-3.5 px-5">
                          <span className="font-mono font-semibold text-[#0071E3]">{b.orderNumber}</span>
                          <div className="text-[11px] text-[#86868B] truncate max-w-xs">{b.orderTitle}</div>
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-[#1D1D1F]">{b.supplierName}</td>
                        <td className="py-3.5 px-5 text-[#86868B]">{b.consultantName}</td>
                        <td className="py-3.5 px-5 text-right font-mono font-semibold text-[#1D1D1F]">
                          {b.hours}h ({b.personDays} Days)
                        </td>
                        <td className="py-3.5 px-5 text-[#1D1D1F] max-w-xs">{b.description}</td>
                        <td className="py-3.5 px-5">
                          {b.status === "approved" && (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
                        <td className="py-3.5 px-5 text-center">
                          {b.status === "extension_requested" ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleApprove(b.id)}
                                disabled={isPending}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-[11px] px-3 py-1 rounded-md transition shadow-xs flex items-center gap-1"
                                title="Approves extension and adds hours directly to contract budget"
                              >
                                <Check className="w-3 h-3" />
                                Approve +{b.hours}h
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(b.id)}
                                disabled={isPending}
                                className="text-rose-600 hover:bg-rose-50 border border-rose-200/60 font-medium text-[11px] px-2.5 py-1 rounded-md transition"
                              >
                                Reject
                              </button>
                            </div>
                          ) : b.status === "submitted" ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleApprove(b.id)}
                                disabled={isPending}
                                className="bg-[#0071E3] hover:bg-[#0066CC] text-white font-medium text-[11px] px-3 py-1 rounded-md transition shadow-xs"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(b.id)}
                                disabled={isPending}
                                className="text-rose-600 hover:bg-rose-50 border border-rose-200/60 font-medium text-[11px] px-2.5 py-1 rounded-md transition"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#86868B]">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CONTRACTOR ACCESS LINKS */}
          {activeTab === "links" && (
            <div className="space-y-6">
              {/* Generate Contractor Access Link Form */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#1D1D1F]">
                    Create Access Link for External Contractor
                  </h2>
                  <p className="text-xs text-[#86868B] mt-0.5">
                    Create a unique invite link so your external partner can log in and submit their work
                  </p>
                </div>

                {newlyGeneratedUrl && (
                  <div className="p-4 bg-emerald-50/80 border border-emerald-200/60 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Link created! Send this link to the external partner:</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-emerald-200/60">
                      <input
                        type="text"
                        readOnly
                        value={newlyGeneratedUrl}
                        className="w-full text-xs font-mono text-[#1D1D1F] select-all focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy("new", newlyGeneratedUrl)}
                        className="bg-[#0071E3] hover:bg-[#0066CC] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition inline-flex items-center gap-1"
                      >
                        {copiedToken === "new" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedToken === "new" ? "Copied" : "Copy Link"}
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleGenerateLink} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                        External Company Name
                      </label>
                      <input
                        type="text"
                        value={externalCompanyName}
                        onChange={(e) => setExternalCompanyName(e.target.value)}
                        placeholder="e.g. KGL Group or Agency Alpha"
                        required
                        className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                        Project Name / Scope
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g. Hostel for student"
                        required
                        className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                        Contract / Order Number
                      </label>
                      <input
                        type="text"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        placeholder="e.g. PO-4500012345"
                        required
                        className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                        Agreed Budget (Days)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={budgetDays}
                        onChange={(e) => setBudgetDays(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="140"
                        required
                        className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
                      />
                      <span className="text-[10px] text-[#86868B] mt-1 block">
                        1 Day = 8 hours
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                        Agreed Hourly Rate (€/h)
                      </label>
                      <input
                        type="number"
                        step="5"
                        min="20"
                        max="500"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="100"
                        required
                        className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
                      />
                      <span className="text-[10px] text-[#86868B] mt-1 block">
                        Standard German IT: €100/h
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                        Target Finish Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Real-time total contract money & hours calculation */}
                  <div className="p-3.5 bg-black/[0.03] rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-black/[0.04]">
                    <span className="text-[#86868B] font-medium">Computed Total Contract Value:</span>
                    <span className="font-bold text-[#1D1D1F] font-mono">
                      €{((Number(budgetDays) || 0) * 8 * (Number(hourlyRate) || 100)).toLocaleString()}{" "}
                      <span className="font-normal text-[#86868B]">
                        ({budgetDays || 0} Days · {(Number(budgetDays) || 0) * 8} Hours at €{hourlyRate || 100}/h)
                      </span>
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-xs inline-flex items-center gap-2"
                  >
                    <Link2 className="w-4 h-4" />
                    {isPending ? "Creating..." : "Create Access Link"}
                  </button>
                </form>
              </div>

              {/* Active External Partner Links Table */}
              <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[#1D1D1F]">
                      Active Contractor Links & Contracts
                    </h2>
                    <p className="text-xs text-[#86868B] mt-0.5">
                      External developers use these links to log in and report their daily work
                    </p>
                  </div>
                  <span className="text-xs font-semibold bg-black/[0.05] text-[#1D1D1F] px-3 py-1 rounded-full">
                    {data.orders.length} Active Contracts
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5F5F7] text-[#86868B] font-semibold border-b border-black/[0.06]">
                      <tr>
                        <th className="py-3.5 px-5">Contract Number</th>
                        <th className="py-3.5 px-5">External Company</th>
                        <th className="py-3.5 px-5">Project Name</th>
                        <th className="py-3.5 px-5 text-right">Agreed Budget</th>
                        <th className="py-3.5 px-5 text-right">Used / Left</th>
                        <th className="py-3.5 px-5">Access Link to Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04]">
                      {data.orders.map((o) => {
                        const url = typeof window !== "undefined"
                          ? `${window.location.origin}/portal/${o.portalToken}`
                          : `/portal/${o.portalToken}`;
                        return (
                          <tr key={o.id} className="hover:bg-[#F5F5F7]/50 transition">
                            <td className="py-3.5 px-5 font-mono font-semibold text-[#0071E3]">
                              {o.orderNumber}
                            </td>
                            <td className="py-3.5 px-5 font-semibold text-[#1D1D1F]">
                              {o.supplierName}
                            </td>
                            <td className="py-3.5 px-5 text-[#86868B]">
                              {o.title}
                            </td>
                            <td className="py-3.5 px-5 text-right font-mono font-semibold text-[#1D1D1F]">
                              {o.totalBudgetDays} Days
                            </td>
                            <td className="py-3.5 px-5 text-right font-mono font-medium text-[#86868B]">
                              <span className="text-[#0071E3]">{o.bookedDays} Days</span> / <span className="text-emerald-600">{o.remainingDays} Days</span>
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] text-[#86868B] truncate max-w-xs bg-[#F5F5F7] p-1 px-2 rounded border border-black/[0.06]">
                                  {url}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(o.id, url)}
                                  className="text-[11px] font-medium bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] border border-black/[0.08] px-2.5 py-1 rounded-lg transition inline-flex items-center gap-1 shrink-0"
                                >
                                  {copiedToken === o.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#86868B]" />}
                                  {copiedToken === o.id ? "Copied" : "Copy"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
