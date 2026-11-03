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
  ArrowLeft,
  Sun,
  LayoutDashboard,
  FileCheck,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  FolderKanban,
  Layers,
  Image as ImageIcon,
  X,
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
import { HolidayForecastResult } from "@/app/domain/budget";
import { useLanguage } from "@/app/context/LanguageContext";
import LanguageToggle from "@/app/components/LanguageToggle";

interface OrderItem {
  id: string;
  orderNumber: string;
  title: string;
  description: string | null;
  totalBudgetDays: number;
  hourlyRate: number;
  totalHours: number;
  totalMoney: number;
  bookedDays: number;
  usedHours: number;
  usedMoney: number;
  remainingDays: number;
  leftHours: number;
  leftMoney: number;
  startDate: string;
  endDate: string;
  portalToken: string;
  supplierName: string;
  status: string;
  forecast: HolidayForecastResult;
  hasShortfall: boolean;
  missingBudgetHours: number;
  missingBudgetMoney: number;
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
  const { language, t } = useLanguage();
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<"overview" | "approvals" | "links">("overview");
  const [selectedOrderId, setSelectedOrderId] = useState<string | "all">("all");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Industry-standard locale-aware currency and rate formatting
  const formatMoney = (amount: number): string => {
    if (language === "de") {
      return `${amount.toLocaleString("de-DE")} €`;
    }
    return `€${amount.toLocaleString("en-US")}`;
  };

  const formatRate = (rate: number): string => {
    if (language === "de") {
      return `${rate.toLocaleString("de-DE")} €/Std`;
    }
    return `€${rate.toLocaleString("en-US")}/h`;
  };

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
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const generateConsistentOrderNumber = (title: string) => {
    if (!title.trim()) return "PO-45000" + Math.floor(10000 + Math.random() * 90000);
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = (hash << 5) - hash + title.charCodeAt(i);
      hash |= 0;
    }
    const suffix = Math.abs(hash % 90000) + 10000;
    return `PO-45000${suffix}`;
  };

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
          hourlyRate: rate,
          totalHours: days * 8,
          totalMoney: days * 8 * rate,
          bookedDays: 0,
          usedHours: 0,
          usedMoney: 0,
          remainingDays: days,
          leftHours: days * 8,
          leftMoney: days * 8 * rate,
          startDate,
          endDate: endDate || "2027-02-15",
          portalToken: result.generatedToken || "",
          supplierName: externalCompanyName,
          status: "active",
          forecast: {
            weeklyBurnRate: 0,
            burnRateWeeksRemaining: 99,
            exhaustionWeek: 52,
            exhaustionWeekLabel: "KW 52",
            reorderDeadlineWeek: 48,
            reorderDeadlineWeekLabel: "KW 48",
            reorderAlertTriggered: false,
            missingPersonDays: 0,
            status: "safe",
          },
          hasShortfall: false,
          missingBudgetHours: 0,
          missingBudgetMoney: 0,
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

  const handleCreateReorderProposal = (orderId?: string, missingDays?: number) => {
    startTransition(async () => {
      const targetId = orderId || data.orders[0]?.id;
      const daysNeeded = missingDays ?? data.metrics.forecast.missingPersonDays;
      const res = await createReorderProposal(targetId, daysNeeded);
      if (res.success) {
        setActionSuccess(res.message || "Budget extension request sent to Purchasing!");
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        setErrorMessage(res.error || "Failed to create budget request.");
      }
    });
  };

  const pendingBookingsCount = data.bookings.filter((b) => b.status === "submitted").length;

  // Selected Order for Drill-Down
  const selectedOrder = selectedOrderId === "all" ? null : data.orders.find((o) => o.id === selectedOrderId);
  const filteredBookings = selectedOrder
    ? data.bookings.filter((b) => b.orderNumber === selectedOrder.orderNumber)
    : data.bookings;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col md:flex-row antialiased selection:bg-[#0071E3] selection:text-white">
      {/* 1. Sleek Apple-Style Left Sidebar (Desktop) */}
      <aside className="w-64 lg:w-72 bg-white/95 backdrop-blur-md border-r border-black/[0.06] flex-col justify-between h-screen sticky top-0 shrink-0 z-40 hidden md:flex">
        {/* Brand & Organization */}
        <div>
          <div className="p-5 lg:p-6 border-b border-black/[0.06] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* Sleek Obsidian Squircle with Stylized Geometric O Brandmark */}
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#1D1D1F] to-[#2C2C2E] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.14)] border border-white/10 shrink-0">
                  <span className="font-bold text-base tracking-tight font-sans">O</span>
                </div>
                <div>
                  <h1 className="font-bold text-sm text-[#1D1D1F] tracking-tight leading-tight">
                    Orvix
                  </h1>
                  <p className="text-[10px] text-[#86868B] font-medium tracking-wide">
                    {language === "de" ? "Bestell-Cockpit" : "Order Cockpit"}
                  </p>
                </div>
              </div>
              <LanguageToggle />
            </div>

            {/* Tenant / Client Organization Pill */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#F5F5F7] border border-black/[0.04]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <p className="text-[11px] font-semibold text-[#1D1D1F] truncate">
                {data.currentUser.companyName}
              </p>
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
              onClick={() => {
                setActiveTab("overview");
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "overview"
                  ? "bg-[#1D1D1F] text-white shadow-xs"
                  : "text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.03]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className={`w-4 h-4 ${activeTab === "overview" ? "text-white" : "text-[#86868B]"}`} />
                <span>{t.tabsOverview}</span>
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
                <span>{t.tabsApprovals}</span>
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
                <span>{t.tabsLinks}</span>
              </div>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  activeTab === "links" ? "text-white/70" : "text-[#86868B]"
                }`}
              >
                {data.orders.length}
              </span>
            </button>

            {/* Quick Projects Sub-List in Sidebar */}
            <div className="pt-4 mt-3 border-t border-black/[0.06]">
              <p className="px-3 text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-2">
                Active Projects
              </p>
              <div className="space-y-0.5 max-h-48 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("overview");
                    setSelectedOrderId("all");
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium transition truncate flex items-center justify-between ${
                    selectedOrderId === "all"
                      ? "bg-black/[0.06] text-[#1D1D1F] font-semibold"
                      : "text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.02]"
                  }`}
                >
                  <span className="truncate">All Projects Portfolio</span>
                  <span className="text-[10px] text-[#86868B]">({data.orders.length})</span>
                </button>

                {data.orders.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      setActiveTab("overview");
                      setSelectedOrderId(o.id);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium transition truncate flex items-center justify-between ${
                      selectedOrderId === o.id
                        ? "bg-black/[0.06] text-[#1D1D1F] font-semibold"
                        : "text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.02]"
                    }`}
                  >
                    <span className="truncate">{o.title}</span>
                    {o.hasShortfall ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Shortage alert" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Healthy runway" />
                    )}
                  </button>
                ))}
              </div>
            </div>
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
                  {data.currentUser.role === "purchasing" 
                    ? (language === "de" ? "Einkaufsleiter" : "Purchasing Officer")
                    : (language === "de" ? "Projektleiter" : "Project Lead")}
                </p>
              </div>
            </div>

            <form action={logoutUser}>
              <button
                type="submit"
                title={t.signOut}
                className="text-[#86868B] hover:text-rose-600 p-2 rounded-xl hover:bg-white transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Canvas (Right Side) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Navigation Header */}
        <header className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-black/[0.06] px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#1D1D1F] to-[#2C2C2E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                O
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-[#1D1D1F] tracking-tight block">Orvix</span>
                <span className="text-[10px] text-[#86868B] block truncate leading-none">{data.currentUser.companyName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <form action={logoutUser}>
                <button type="submit" title={t.signOut} className="text-xs text-[#86868B] hover:text-rose-600 p-1.5 rounded-lg hover:bg-[#F5F5F7] transition cursor-pointer">
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-[#F5F5F7] p-1 rounded-xl text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`py-1.5 px-2 rounded-lg transition text-center truncate ${
                activeTab === "overview" ? "bg-white text-[#1D1D1F] font-semibold shadow-xs" : "text-[#86868B]"
              }`}
            >
              {t.tabsOverview}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("approvals")}
              className={`py-1.5 px-2 rounded-lg transition text-center truncate ${
                activeTab === "approvals" ? "bg-white text-[#1D1D1F] font-semibold shadow-xs" : "text-[#86868B]"
              }`}
            >
              {t.reviewsCount} {pendingBookingsCount > 0 ? `(${pendingBookingsCount})` : ""}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              {selectedOrder && activeTab === "overview" && (
                <button
                  type="button"
                  onClick={() => setSelectedOrderId("all")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] hover:text-[#0077ED] mb-2 bg-white px-3.5 py-1.5 rounded-full border border-black/[0.08] shadow-xs transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t.backToOverview}</span>
                </button>
              )}

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
                {activeTab === "overview" && (selectedOrder ? selectedOrder.title : t.tabsOverview)}
                {activeTab === "approvals" && t.tabsApprovals}
                {activeTab === "links" && t.tabsLinks}
              </h1>
              <p className="text-xs text-[#86868B] font-medium mt-1">
                {activeTab === "overview" &&
                  (selectedOrder
                    ? `Contract ${selectedOrder.orderNumber} · ${selectedOrder.supplierName} · ${t.rate} €${selectedOrder.hourlyRate}/h`
                    : t.dashboardSubOverview)}
                {activeTab === "approvals" && t.dashboardSubApprovals}
                {activeTab === "links" && t.dashboardSubLinks}
              </p>
            </div>

            {/* Quick Project Switcher Pills (in Overview tab) */}
            {activeTab === "overview" && (
              <div className="flex flex-wrap items-center gap-1.5 bg-black/[0.04] p-1.5 rounded-full border border-black/[0.04] self-start sm:self-auto text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedOrderId("all")}
                  className={`px-3.5 py-1.5 rounded-full transition text-xs font-semibold ${
                    selectedOrderId === "all"
                      ? "bg-white text-[#1D1D1F] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  All Projects
                </button>
                {data.orders.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelectedOrderId(o.id)}
                    className={`px-3.5 py-1.5 rounded-full transition text-xs font-semibold truncate max-w-[160px] flex items-center gap-1.5 ${
                      selectedOrderId === o.id
                        ? "bg-white text-[#1D1D1F] shadow-xs"
                        : "text-[#86868B] hover:text-[#1D1D1F]"
                    }`}
                  >
                    <span className="truncate">{o.title}</span>
                    {o.hasShortfall ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Success or Error Notification */}
          {actionSuccess && (
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/60 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{actionSuccess}</span>
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
            <div className="space-y-8">
              {/* SECTION A: THE 4 EXECUTIVE METRIC CARDS (Always at the Top!) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">
                    {selectedOrder ? `Financial & Time Metrics: ${selectedOrder.title}` : "Enterprise Portfolio Roll-Up"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Agreed Budget */}
                  <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-[#86868B] font-medium">
                      <span>{t.kpiTotalBudget}</span>
                      <span className="text-[10px] bg-black/[0.04] px-2 py-0.5 rounded-md font-semibold text-[#1D1D1F]">
                        {selectedOrder ? `${formatRate(selectedOrder.hourlyRate)}` : `${data.orders.length} ${language === "de" ? "Verträge" : "Contracts"}`}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="text-3xl font-bold tracking-tight text-[#1D1D1F] font-mono tabular-nums">
                        {formatMoney(selectedOrder ? selectedOrder.totalMoney : data.metrics.totalBudgetMoney)}
                      </div>
                      <p className="text-xs text-[#86868B] font-medium mt-1">
                        {selectedOrder ? selectedOrder.totalBudgetDays : data.metrics.totalBudgetDays} {t.days} ·{" "}
                        {(selectedOrder ? selectedOrder.totalHours : data.metrics.totalBudgetHours).toLocaleString()} {t.hours}
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Work Completed */}
                  <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-[#86868B] font-medium">
                      <span>{t.kpiWorkCompleted}</span>
                      <span className="text-[10px] bg-black/[0.04] text-[#1D1D1F] px-2 py-0.5 rounded-md font-semibold">
                        {selectedOrder ? `${selectedOrder.usedHours}h ${t.logged}` : `${data.metrics.totalBookedHours}h ${t.logged}`}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="text-3xl font-bold tracking-tight text-[#1D1D1F] font-mono tabular-nums">
                        {formatMoney(selectedOrder ? selectedOrder.usedMoney : data.metrics.totalBookedMoney)}
                      </div>
                      <p className="text-xs text-[#86868B] font-medium mt-1">
                        {selectedOrder ? selectedOrder.bookedDays : data.metrics.totalBookedDays} {t.days} ·{" "}
                        {(selectedOrder ? selectedOrder.usedHours : data.metrics.totalBookedHours).toLocaleString()} {t.hoursSpent}
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Budget Remaining */}
                  <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-[#86868B] font-medium">
                      <span>{t.kpiBudgetRemaining}</span>
                      <span className="text-[10px] bg-black/[0.04] text-[#1D1D1F] px-2 py-0.5 rounded-md font-semibold">
                        {t.available}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="text-3xl font-bold tracking-tight text-[#1D1D1F] font-mono tabular-nums">
                        {formatMoney(selectedOrder ? selectedOrder.leftMoney : data.metrics.remainingBudgetMoney)}
                      </div>
                      <p className="text-xs text-[#86868B] font-medium mt-1">
                        {selectedOrder ? selectedOrder.remainingDays : data.metrics.remainingBudgetDays} {t.days} ·{" "}
                        {(selectedOrder ? selectedOrder.leftHours : data.metrics.remainingBudgetHours).toLocaleString()} {t.hoursLeft}
                      </p>
                    </div>
                  </div>

                  {/* Card 4: When Budget Runs Out */}
                  <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-[#86868B] font-medium">
                      <span>{t.kpiWhenBudgetRunsOut}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          (selectedOrder ? selectedOrder.hasShortfall : data.metrics.forecast.missingPersonDays > 0)
                            ? "bg-amber-50 text-amber-800 border border-amber-200/60"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        }`}
                      >
                        {(selectedOrder ? selectedOrder.hasShortfall : data.metrics.forecast.missingPersonDays > 0)
                          ? `${t.orderMoreBy} ${selectedOrder ? selectedOrder.forecast.reorderDeadlineWeek : data.metrics.forecast.reorderDeadlineWeek}`
                          : t.runwayHealthy}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="text-3xl font-bold tracking-tight text-[#1D1D1F] font-mono tabular-nums">
                        {includeShutdown
                          ? `${t.week} ${selectedOrder ? selectedOrder.forecast.exhaustionWeek : data.metrics.forecast.exhaustionWeek}`
                          : `${t.week} ${Math.max(1, (selectedOrder ? selectedOrder.forecast.exhaustionWeek : data.metrics.forecast.exhaustionWeek) - 1)}`}
                      </div>
                      <p className="text-xs font-medium text-[#86868B] mt-1">
                        {(selectedOrder ? selectedOrder.hasShortfall : data.metrics.forecast.missingPersonDays > 0)
                          ? t.midDecember
                          : t.fullyFunded}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: THE SMART FORECASTER CARD (Pace & Runway Radar) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{selectedOrder ? `${selectedOrder.title} · Budget Radar` : "Pace Forecaster"}</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
                      {selectedOrder ? `How Long Will ${selectedOrder.title} Last?` : "How Long Will the Budget Last?"}
                    </h2>
                    <p className="text-xs text-[#86868B] mt-0.5">
                      {selectedOrder
                        ? `Projected timeline for PO ${selectedOrder.orderNumber} with ${selectedOrder.supplierName}`
                        : "Calculates the exact date your budget will run out based on how fast contractors are working"}
                    </p>
                  </div>

                  {/* Apple-Style Smooth Pill Switch for Holiday Simulator */}
                  <div className="flex items-center gap-3 bg-[#F5F5F7] py-1.5 px-3.5 rounded-2xl border border-black/[0.04]">
                    <span className="text-xs font-semibold text-[#1D1D1F]">
                      {language === "de" ? "Weihnachtspause einberechnen (24. Dez – 6. Jan)" : "December Holiday Break (Dec 24 – Jan 6)"}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={includeShutdown}
                      onClick={() => setIncludeShutdown(!includeShutdown)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        includeShutdown ? "bg-[#0071E3]" : "bg-black/[0.15]"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          includeShutdown ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 3 Simple Column Numbers: Money on Top, Days on Bottom */}
                {(() => {
                  const currentBurnRate = selectedOrder ? selectedOrder.forecast.weeklyBurnRate : data.metrics.forecast.weeklyBurnRate;
                  const currentRate = selectedOrder ? selectedOrder.hourlyRate : 100;
                  const currentExhaustion = selectedOrder ? selectedOrder.forecast.exhaustionWeek : data.metrics.forecast.exhaustionWeek;
                  const currentMissingDays = selectedOrder ? selectedOrder.forecast.missingPersonDays : data.metrics.forecast.missingPersonDays;
                  const currentMissingMoney = selectedOrder ? selectedOrder.missingBudgetMoney : data.metrics.missingBudgetMoney;
                  const currentMissingHours = selectedOrder ? selectedOrder.missingBudgetHours : data.metrics.missingBudgetHours;
                  const currentHasShortfall = selectedOrder ? selectedOrder.hasShortfall : data.metrics.forecast.missingPersonDays > 0;
                  const currentReorderDeadline = selectedOrder ? selectedOrder.forecast.reorderDeadlineWeek : data.metrics.forecast.reorderDeadlineWeek;

                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                          <span className="text-xs font-medium text-[#86868B]">{language === "de" ? "Dienstleister-Arbeitstempo" : "Contractor Working Pace"}</span>
                          <p className="text-2xl font-bold text-[#1D1D1F] font-mono tabular-nums">
                            {formatMoney(currentBurnRate * 8 * currentRate)}{" "}
                            <span className="text-xs font-normal text-[#86868B]">/ {language === "de" ? "Woche" : "week"}</span>
                          </p>
                          <p className="text-[11px] text-[#86868B]">
                            {currentBurnRate} {t.days} · {currentBurnRate * 8} {t.hours} / {language === "de" ? "Woche" : "week"}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-xs font-medium text-[#86868B]">{language === "de" ? "Prognostizierter Budget-Erschöpfungszeitpunkt" : "Predicted Date Money Runs Out"}</span>
                          <p className="text-2xl font-bold text-[#1D1D1F] font-mono tabular-nums">
                            {includeShutdown ? `${t.week} ${currentExhaustion}` : `${t.week} ${Math.max(1, currentExhaustion - 1)}`}{" "}
                            <span className="text-xs font-normal text-[#86868B]">{currentHasShortfall ? `(${t.midDecember})` : `(${t.fullyFunded})`}</span>
                          </p>
                          <p className="text-[11px] text-[#86868B]">
                            {includeShutdown
                              ? (language === "de" ? "Inklusive 2-wöchiger Weihnachtspause ohne Rechnungsstellung" : "Includes the 2-week Christmas shutdown when no work is billed")
                              : (language === "de" ? "Direkte lineare Berechnung ohne Feiertagspause" : "Direct pace calculation without holiday break")}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-xs font-medium text-[#86868B]">
                            {currentHasShortfall ? (language === "de" ? "Fehlbetrag bis Projektende" : "Shortage until Project Ends") : (language === "de" ? "Budgetstatus" : "Budget Status")}
                          </span>
                          {currentHasShortfall ? (
                            <>
                              <p className="text-2xl font-bold text-amber-900 font-mono tabular-nums">
                                {formatMoney(currentMissingMoney)} {language === "de" ? "fehlen" : "Extra Needed"}
                              </p>
                              <p className="text-[11px] text-[#86868B]">
                                ≈ {currentMissingDays} {t.days} · {currentMissingHours} {t.hours} {language === "de" ? "Fehlbestand" : "shortage"}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-2xl font-bold text-emerald-800 font-mono tabular-nums">{t.fullyFunded}</p>
                              <p className="text-[11px] text-[#86868B]">
                                {formatMoney(0)} {language === "de" ? "Nachbestellung erforderlich" : "Extra Needed"} · {selectedOrder ? selectedOrder.remainingDays : data.metrics.remainingBudgetDays} {t.days} {t.available}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Early Warning Banner & 1-Click Request */}
                      {currentHasShortfall ? (
                        <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                              <Clock className="w-4 h-4 text-amber-600" />
                              <span>
                                {language === "de" 
                                  ? `4-Wochen-Frühwarnung: Nachbestellung erforderlich bis KW ${currentReorderDeadline}` 
                                  : `4-Week Early Warning: Must request more budget by Week ${currentReorderDeadline}`}
                              </span>
                            </div>
                            <p className="text-xs text-amber-800">
                              {language === "de"
                                ? `Der Einkauf benötigt 4 Wochen Vorlaufzeit für Folgebestellungen. Um Stillstand zu vermeiden, muss die Bestellung vor KW ${currentReorderDeadline} initiiert werden.`
                                : `Purchasing takes 4 weeks to approve paperwork. You must request extra budget before Week ${currentReorderDeadline} so contractors do not stop working.`}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCreateReorderProposal(selectedOrder?.id, currentMissingDays)}
                            disabled={isPending}
                            className="bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold px-5 py-2.5 rounded-full transition shadow-xs inline-flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            {isPending
                              ? t.connecting
                              : `${language === "de" ? "Folgebestellung an Einkauf melden" : "Submit Purchasing Reorder"} (+${formatMoney(currentMissingMoney)})`}
                          </button>
                        </div>
                      ) : (
                        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span>{language === "de" ? "Budget-Reichweite solide: Kein Fehlbetrag prognostiziert" : "Budget Runway Healthy: No Shortage Detected"}</span>
                            </div>
                            <p className="text-xs text-emerald-800">
                              {language === "de"
                                ? "Das vereinbarte Budget deckt alle geplanten Meilensteine bei aktuellem Arbeitstempo vollständig ab."
                                : "Current budget covers all planned milestones at current pace. Purchasing reorder paperwork is not needed at this time."}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-semibold px-3.5 py-1.5 bg-white text-emerald-800 border border-emerald-200/60 rounded-full shadow-xs">
                              {selectedOrder ? selectedOrder.remainingDays : data.metrics.remainingBudgetDays} {t.days} {t.available}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* SECTION C: ACTIVE PROJECT CONTRACTS BOXES GRID (When All Projects is viewed) */}
              {selectedOrderId === "all" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
                        <FolderKanban className="w-4 h-4 text-[#0071E3]" />
                        {t.allProjectsOverview}
                      </h2>
                      <p className="text-xs text-[#86868B] mt-0.5">
                        {t.allProjectsSub}
                      </p>
                    </div>
                    <span className="text-xs font-semibold bg-white border border-black/[0.06] px-3 py-1 rounded-full text-[#1D1D1F]">
                      {data.orders.length} {t.days}
                    </span>
                  </div>

                  {/* Project Cards (Boxes) Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.orders.map((o) => {
                      const percentUsed = o.totalBudgetDays > 0 ? Math.min(100, Math.round((o.bookedDays / o.totalBudgetDays) * 100)) : 0;
                      return (
                        <div
                          key={o.id}
                          onClick={() => setSelectedOrderId(o.id)}
                          className="bg-white rounded-3xl p-6 border border-black/[0.06] hover:border-[#0071E3]/50 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,113,227,0.08)] transition cursor-pointer flex flex-col justify-between space-y-4 group"
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-mono text-[#86868B] uppercase tracking-wider block">
                                {o.orderNumber} · {o.supplierName}
                              </span>
                              <h3 className="text-lg font-bold text-[#1D1D1F] group-hover:text-[#0071E3] transition truncate mt-0.5">
                                {o.title}
                              </h3>
                            </div>

                            {/* Status Pill */}
                            {o.hasShortfall ? (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/60 font-semibold px-2.5 py-1 rounded-full text-[11px] shrink-0">
                                <Clock className="w-3 h-3 text-amber-600" />
                                {t.orderMoreBy} {o.forecast.reorderDeadlineWeek}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold px-2.5 py-1 rounded-full text-[11px] shrink-0">
                                <Check className="w-3 h-3 text-emerald-600" />
                                {t.runwayHealthy}
                              </span>
                            )}
                          </div>

                          {/* Metric Numbers: Money on Top, Days on Bottom */}
                          <div className="grid grid-cols-3 gap-3 py-2 border-y border-black/[0.04] text-xs">
                            <div>
                              <span className="text-[10px] text-[#86868B] font-medium block">{t.kpiTotalBudget}</span>
                              <span className="font-bold text-[#1D1D1F] font-mono text-sm block">{formatMoney(o.totalMoney)}</span>
                              <span className="text-[10px] text-[#86868B] block">{o.totalBudgetDays} {t.days} · {o.totalHours}h</span>
                            </div>

                            <div>
                              <span className="text-[10px] text-[#86868B] font-medium block">{t.kpiWorkCompleted}</span>
                              <span className="font-bold text-[#1D1D1F] font-mono text-sm block">{formatMoney(o.usedMoney)}</span>
                              <span className="text-[10px] text-[#86868B] block">{o.bookedDays} {t.days} · {o.usedHours}h</span>
                            </div>

                            <div>
                              <span className="text-[10px] text-[#86868B] font-medium block">{t.kpiBudgetRemaining}</span>
                              <span className="font-bold text-[#1D1D1F] font-mono text-sm block">{formatMoney(o.leftMoney)}</span>
                              <span className="text-[10px] text-[#86868B] block">{o.remainingDays} {t.days} · {o.leftHours}h</span>
                            </div>
                          </div>

                          {/* Progress Bar & Footer */}
                          <div>
                            <div className="flex items-center justify-between text-[11px] text-[#86868B] mb-1.5">
                              <span>{t.schedule}: {o.startDate || "Immediate"} → {o.endDate || "Ongoing"}</span>
                              <span>{formatRate(o.hourlyRate)} · {percentUsed}% {t.used}</span>
                            </div>
                            <div className="w-full bg-[#F5F5F7] h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  o.hasShortfall ? "bg-amber-500" : "bg-[#1D1D1F]"
                                }`}
                                style={{ width: `${Math.max(2, percentUsed)}%` }}
                              />
                            </div>
                          </div>

                          <div className="pt-1 flex items-center justify-between text-xs text-[#0071E3] font-semibold group-hover:underline">
                            <span>{t.openCockpit}</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION D: SPECIFIC PROJECT WORK LOGS (When a Project is Selected) */}
              {selectedOrder && (
                <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                  <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-[#1D1D1F] text-base flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-[#0071E3]" />
                        {language === "de" ? `Stundennachweise für ${selectedOrder.title}` : `Work Logs for ${selectedOrder.title}`}
                      </h3>
                      <p className="text-xs text-[#86868B] mt-0.5">
                        {language === "de" 
                          ? `Eingereichte Leistungen von ${selectedOrder.supplierName} unter Bestell-Nr. ${selectedOrder.orderNumber}`
                          : `Deliverable history submitted by ${selectedOrder.supplierName} under PO ${selectedOrder.orderNumber}`}
                      </p>
                    </div>
                    <span className="text-xs font-semibold bg-black/[0.05] text-[#1D1D1F] px-3 py-1 rounded-full">
                      {filteredBookings.length} {language === "de" ? "Einträge" : "Submissions"}
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
                          <th className="py-3.5 px-5 text-center">{t.actionCol}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.04]">
                        {filteredBookings.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center">
                              <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto text-center">
                                <div className="w-10 h-10 rounded-2xl bg-black/[0.03] text-[#86868B] flex items-center justify-center">
                                  <FileCheck className="w-5 h-5 text-[#86868B]" />
                                </div>
                                <p className="text-xs font-semibold text-[#1D1D1F]">
                                  {language === "de" ? "Noch keine Stundennachweise eingereicht" : "No Work Logs Submitted Yet"}
                                </p>
                                <p className="text-[11px] text-[#86868B] leading-relaxed">
                                  {language === "de" 
                                    ? "Für diese Bestellung liegen noch keine Einträge vor. Teilen Sie den Zugangslink mit dem Dienstleister." 
                                    : "No deliverables reported yet. Share the contractor access link to start receiving submissions."}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredBookings.map((b) => (
                            <tr key={b.id} className="hover:bg-[#F5F5F7]/50 transition">
                              <td className="py-3.5 px-5 font-mono text-[#86868B]">{b.date}</td>
                              <td className="py-3.5 px-5 font-semibold text-[#1D1D1F]">{b.consultantName}</td>
                              <td className="py-3.5 px-5 text-right font-mono text-[#1D1D1F]">
                                <div className="font-semibold text-xs">{formatMoney(b.moneyEur)}</div>
                                <div className="text-[10px] text-[#86868B]">{b.personDays} {t.days} · {b.hours}h</div>
                              </td>
                              <td className="py-3.5 px-5 text-[#1D1D1F] max-w-xs">
                                <div>{b.description}</div>
                                {b.attachmentUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewModalImg(b.attachmentUrl || null)}
                                    className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0071E3] hover:underline bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-100 cursor-pointer"
                                  >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    <span>Proof Attached</span>
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
                                  <span
                                    className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 font-semibold px-2.5 py-0.5 rounded-full text-[11px]"
                                    title={b.rejectionReason || ""}
                                  >
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
                                      className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-[11px] px-3.5 py-1 rounded-full transition shadow-xs flex items-center gap-1"
                                      title="Approves extension and adds hours directly to contract budget"
                                    >
                                      <Check className="w-3 h-3" />
                                      Approve +{b.hours}h
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleReject(b.id)}
                                      disabled={isPending}
                                      className="text-rose-600 hover:bg-rose-50 border border-rose-200/60 font-medium text-[11px] px-3 py-1 rounded-full transition"
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
                                      className="bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-[11px] px-3.5 py-1 rounded-full transition shadow-xs"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleReject(b.id)}
                                      disabled={isPending}
                                      className="text-rose-600 hover:bg-rose-50 border border-rose-200/60 font-medium text-[11px] px-3 py-1 rounded-full transition"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-[#86868B]">Completed</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REVIEW & APPROVE WORK LOGS */}
          {activeTab === "approvals" && (
            <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#1D1D1F]">
                    {t.reviewLogsHeader}
                  </h2>
                  <p className="text-xs text-[#86868B] mt-0.5">
                    {t.reviewLogsSub}
                  </p>
                </div>
                <span className="text-xs font-semibold bg-black/[0.05] text-[#1D1D1F] px-3 py-1 rounded-full">
                  {data.bookings.length} {t.totalSubmissions}
                </span>
              </div>

              {data.currentUser.role === "purchasing" && (
                <div className="p-4 bg-amber-50/80 border-b border-amber-200/60 text-xs text-amber-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>{language === "de" ? "Datenschutz aktiv:" : "Commercial Privacy Active:"}</strong> {t.commercialPrivacy}
                  </span>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F5F7] text-[#86868B] font-semibold border-b border-black/[0.06]">
                    <tr>
                      <th className="py-3.5 px-5">{t.dateCol}</th>
                      <th className="py-3.5 px-5">{t.contractCol}</th>
                      <th className="py-3.5 px-5">{t.companyCol}</th>
                      <th className="py-3.5 px-5">{t.specialistCol}</th>
                      <th className="py-3.5 px-5 text-right">{t.deliverableValCol}</th>
                      <th className="py-3.5 px-5">{t.whatWasBuiltCol}</th>
                      <th className="py-3.5 px-5">{t.statusCol}</th>
                      <th className="py-3.5 px-5 text-center">{t.actionCol}</th>
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
                        <td className="py-3.5 px-5 text-right font-mono text-[#1D1D1F]">
                          <div className="font-semibold text-xs">{formatMoney(b.moneyEur)}</div>
                          <div className="text-[10px] text-[#86868B]">{b.personDays} {t.days} · {b.hours}h</div>
                        </td>
                        <td className="py-3.5 px-5 text-[#1D1D1F] max-w-xs">
                          <div>{b.description}</div>
                          {b.attachmentUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewModalImg(b.attachmentUrl || null)}
                              className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0071E3] hover:underline bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-100 cursor-pointer"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>{t.proofAttached}</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          {b.status === "approved" && (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                              <Check className="w-3 h-3 text-emerald-600" />
                              {t.approved}
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
                        <td className="py-3.5 px-5 text-center">
                          {data.currentUser.role === "purchasing" ? (
                            <span className="text-[10px] text-[#86868B] bg-black/[0.04] px-2.5 py-1 rounded-full font-medium">
                              {t.leadApprovalRequired}
                            </span>
                          ) : b.status === "extension_requested" ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleApprove(b.id)}
                                disabled={isPending}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-[11px] px-3.5 py-1 rounded-full transition shadow-xs flex items-center gap-1 cursor-pointer"
                                title="Approves extension and adds hours directly to contract budget"
                              >
                                <Check className="w-3 h-3" />
                                {t.approve} +{b.hours}h
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(b.id)}
                                disabled={isPending}
                                className="text-rose-600 hover:bg-rose-50 border border-rose-200/60 font-medium text-[11px] px-3 py-1 rounded-full transition cursor-pointer"
                              >
                                {t.reject}
                              </button>
                            </div>
                          ) : b.status === "submitted" ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleApprove(b.id)}
                                disabled={isPending}
                                className="bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-[11px] px-3.5 py-1 rounded-full transition shadow-xs cursor-pointer"
                              >
                                {t.approve}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(b.id)}
                                disabled={isPending}
                                className="text-rose-600 hover:bg-rose-50 border border-rose-200/60 font-medium text-[11px] px-3 py-1 rounded-full transition cursor-pointer"
                              >
                                {t.reject}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#86868B]">{t.completed}</span>
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
                    {t.onboardHeader}
                  </h2>
                  <p className="text-xs text-[#86868B] mt-0.5">
                    {t.onboardSub}
                  </p>
                </div>

                {newlyGeneratedUrl && (
                  <div className="p-4 bg-black/[0.02] border border-black/[0.08] rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#1D1D1F]">
                      <Check className="w-4 h-4 text-[#1D1D1F]" />
                      <span>{language === "de" ? "Link erfolgreich erstellt! Bitte an Dienstleister übermitteln:" : "Link created! Send this link to the external partner:"}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-black/[0.08]">
                      <input
                        type="text"
                        readOnly
                        value={newlyGeneratedUrl}
                        className="w-full text-xs font-mono text-[#1D1D1F] select-all focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy("new", newlyGeneratedUrl)}
                        className="bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold px-4 py-1.5 rounded-full shrink-0 transition inline-flex items-center gap-1"
                      >
                        {copiedToken === "new" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedToken === "new" ? t.copied : t.copy}
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleGenerateLink} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                        {t.externalCompany}
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
                        {t.projectName}
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProjectName(val);
                          if (!orderNumber || orderNumber.startsWith("PO-45000")) {
                            setOrderNumber(generateConsistentOrderNumber(val));
                          }
                        }}
                        placeholder="e.g. Student Housing Portal"
                        required
                        className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-[#1D1D1F]">
                          {t.orderNumber}
                        </label>
                        <button
                          type="button"
                          onClick={() => setOrderNumber(generateConsistentOrderNumber(projectName))}
                          className="text-[10px] text-[#0071E3] hover:underline font-semibold cursor-pointer"
                        >
                          {t.autoGenerate}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        placeholder="e.g. PO-4500012345"
                        required
                        className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none font-mono font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                        {t.budgetDays}
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
                        1 {t.days.replace(/e$/, "")} = 8 {t.hours}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                        {t.hourlyRate}
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                        {t.startDate}
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
                      />
                      <span className="text-[10px] text-[#86868B] mt-1 block">
                        {language === "de" ? "Abrechnung ab diesem Datum zulässig" : "Contract work deliverables are eligible starting on this date"}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                        {t.finishDate}
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full text-xs bg-[#F5F5F7] border border-black/[0.08] rounded-xl p-3 text-[#1D1D1F] focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-none"
                      />
                      <span className="text-[10px] text-[#86868B] mt-1 block">
                        {language === "de" ? "Vereinbarte Meilenstein-Fertigstellung" : "Agreed milestone completion deadline"}
                      </span>
                    </div>
                  </div>

                  {/* Real-time total contract money & hours calculation */}
                  <div className="p-3.5 bg-black/[0.03] rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-black/[0.04]">
                    <span className="text-[#86868B] font-medium">{t.computedValue}:</span>
                    <span className="font-bold text-[#1D1D1F] font-mono">
                      {formatMoney((Number(budgetDays) || 0) * 8 * (Number(hourlyRate) || 100))}{" "}
                      <span className="font-normal text-[#86868B]">
                        ({budgetDays || 0} {t.days} · {(Number(budgetDays) || 0) * 8} {t.hours} à {formatRate(Number(hourlyRate) || 100)})
                      </span>
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold px-6 py-2.5 rounded-full transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Link2 className="w-4 h-4" />
                    {isPending ? t.connecting : t.createLinkButton}
                  </button>
                </form>
              </div>

              {/* Active External Partner Links Table */}
              <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[#1D1D1F]">
                      {t.activeLinksHeader}
                    </h2>
                    <p className="text-xs text-[#86868B] mt-0.5">
                      {t.activeLinksSub}
                    </p>
                  </div>
                  <span className="text-xs font-semibold bg-black/[0.05] text-[#1D1D1F] px-3 py-1 rounded-full">
                    {data.orders.length} {language === "de" ? "Aktive Verträge" : "Active Contracts"}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5F5F7] text-[#86868B] font-semibold border-b border-black/[0.06]">
                      <tr>
                        <th className="py-3.5 px-5">{t.contractCol}</th>
                        <th className="py-3.5 px-5">{t.externalCompany}</th>
                        <th className="py-3.5 px-5">{t.projectName}</th>
                        <th className="py-3.5 px-5 text-right">{t.budgetDays}</th>
                        <th className="py-3.5 px-5 text-right">{t.used} / {t.available}</th>
                        <th className="py-3.5 px-5">{language === "de" ? "Zugangslink zum Teilen" : "Access Link to Share"}</th>
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
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab("overview");
                                  setSelectedOrderId(o.id);
                                }}
                                className="hover:text-[#0071E3] hover:underline font-medium text-left"
                              >
                                {o.title}
                              </button>
                            </td>
                            <td className="py-3.5 px-5 text-right font-mono text-[#1D1D1F]">
                              <div className="font-semibold text-xs">{formatMoney(o.totalMoney)}</div>
                              <div className="text-[10px] text-[#86868B]">{o.totalBudgetDays} {t.days}</div>
                            </td>
                            <td className="py-3.5 px-5 text-right font-mono text-xs">
                              <div className="font-semibold text-[#1D1D1F]">{formatMoney(o.usedMoney)} / {formatMoney(o.leftMoney)}</div>
                              <div className="text-[10px] text-[#86868B]">{o.bookedDays} {t.days} / {o.remainingDays} {t.days}</div>
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] text-[#86868B] truncate max-w-xs bg-[#F5F5F7] p-1 px-2 rounded border border-black/[0.06]">
                                  {url}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(o.id, url)}
                                  className="text-[11px] font-medium bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] border border-black/[0.08] px-3 py-1 rounded-full transition inline-flex items-center gap-1 shrink-0 cursor-pointer"
                                >
                                  {copiedToken === o.id ? <Check className="w-3 h-3 text-[#0071E3]" /> : <Copy className="w-3 h-3 text-[#86868B]" />}
                                  {copiedToken === o.id ? t.copied : t.copy}
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

      {/* Proof of Work Attachment Lightbox Modal */}
      {previewModalImg && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewModalImg(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#0071E3]" />
                <h3 className="font-bold text-sm text-[#1D1D1F]">
                  {t.proofModalTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="text-[#86868B] hover:text-[#1D1D1F] p-1 rounded-full hover:bg-black/[0.05] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center rounded-2xl bg-black/[0.02] border border-black/[0.04] p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewModalImg}
                alt="Deliverable Proof"
                className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-xs"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#86868B] pt-2">
              <span>{t.proofModalSub}</span>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="px-4 py-1.5 rounded-full bg-[#1D1D1F] text-white font-medium hover:bg-black transition text-xs cursor-pointer"
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
