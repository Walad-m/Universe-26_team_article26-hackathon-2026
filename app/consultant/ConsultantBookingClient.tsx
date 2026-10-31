"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building2,
  Briefcase,
  ArrowLeft,
  Send,
  Zap,
  UserCheck,
  ShieldAlert,
  FileText,
} from "lucide-react";
import { submitConsultantBooking } from "@/app/actions/bookings";

interface Order {
  id: string;
  orderNumber: string;
  title: string;
  description: string | null;
  totalBudgetDays: number;
  dailyHoursPerDay: number;
  maxDailyHours: number;
  consumedDays: number;
  remainingDays: number;
  status: string;
}

interface BookingHistory {
  id: string;
  orderId: string;
  orderNumber: string;
  orderTitle: string;
  date: string;
  hours: number;
  personDays: number;
  description: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
}

interface Consultant {
  id: string;
  name: string;
  email: string;
  company: string;
}

interface Props {
  initialData: {
    currentUser: {
      id: string;
      name: string;
      email: string;
      role: string;
      company: string;
    };
    assignedOrders: Order[];
    bookingsHistory: BookingHistory[];
    allConsultants: Consultant[];
  };
}

export default function ConsultantBookingClient({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [selectedUserEmail, setSelectedUserEmail] = useState(initialData.currentUser.email);
  const [isPending, startTransition] = useTransition();

  // Booking Form State
  const defaultOrderId = data.assignedOrders[0]?.id || "";
  const [orderId, setOrderId] = useState<string>(defaultOrderId);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [hours, setHours] = useState<number>(8.0);
  const [description, setDescription] = useState<string>("");
  
  // Feedback Banners
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedOrder = data.assignedOrders.find((o) => o.id === orderId) || data.assignedOrders[0];
  const conversionRate = selectedOrder?.dailyHoursPerDay || 8.0;
  const calculatedDays = Number((hours / conversionRate).toFixed(2));

  // Quick preset helper
  const setPresetHours = (h: number, descPreset?: string) => {
    setHours(h);
    if (descPreset && !description) {
      setDescription(descPreset);
    }
  };

  const handleSwitchUser = (email: string) => {
    setSelectedUserEmail(email);
    window.location.href = `/consultant?user=${encodeURIComponent(email)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedOrder) {
      setErrorMessage("No active purchase order assigned to book against.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitConsultantBooking(
          data.currentUser.id,
          selectedOrder.id,
          date,
          Number(hours),
          description
        );

        if (!result.success) {
          setErrorMessage(result.error || "Booking submission failed.");
        } else {
          setSuccessMessage(
            `Success: ${hours}h (${calculatedDays} Person-Days) booked on ${selectedOrder.orderNumber} for "${description}". Awaiting Project Lead approval.`
          );
          setDescription("");
          // Optimistically prepend to table
          const newEntry: BookingHistory = {
            id: result.bookingId || Math.random().toString(),
            orderId: selectedOrder.id,
            orderNumber: selectedOrder.orderNumber,
            orderTitle: selectedOrder.title,
            date,
            hours: Number(hours),
            personDays: calculatedDays,
            description: description.trim(),
            status: "submitted",
            rejectionReason: null,
            createdAt: new Date().toISOString(),
          };
          setData((prev) => ({
            ...prev,
            bookingsHistory: [newEntry, ...prev.bookingsHistory],
          }));
        }
      } catch (err: any) {
        setErrorMessage(err.message || "An unexpected error occurred.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Navigation & Demo Persona Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg">{data.currentUser.name}</span>
              <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                External Consultant
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>{data.currentUser.company}</span>
              <span>•</span>
              <span>{data.currentUser.email}</span>
            </div>
          </div>
        </div>

        {/* Demo Switcher for Jurors */}
        <div className="flex items-center gap-2 self-end sm:self-auto bg-slate-50 p-1.5 rounded-lg border border-slate-200">
          <UserCheck className="w-4 h-4 text-slate-500 ml-1" />
          <span className="text-xs font-semibold text-slate-600">Simulate Consultant:</span>
          <select
            value={selectedUserEmail}
            onChange={(e) => handleSwitchUser(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded px-2 py-1 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {data.allConsultants.map((c) => (
              <option key={c.id} value={c.email}>
                {c.name} ({c.company})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Multi-Tenant Supplier Check Banner */}
      {data.assignedOrders.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto" />
          <h3 className="font-bold text-amber-900 text-lg">Cross-Tenant Supplier Isolation Active</h3>
          <p className="text-sm text-amber-700 max-w-xl mx-auto">
            User <strong>{data.currentUser.name}</strong> belongs to <strong>{data.currentUser.company}</strong>.
            Under German procurement regulations and client tenant boundaries, consultants cannot see or book against purchase orders issued to competing vendors.
          </p>
          <div className="pt-2">
            <button
              onClick={() => handleSwitchUser("consultant@supplier-a.de")}
              className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition"
            >
              Switch back to Alex Becker (Agency Alpha GmbH)
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Booking Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Book Deliverable Time
                  </h2>
                  <p className="text-xs text-slate-500">Record work against purchase order</p>
                </div>
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                  § 3 ArbZG
                </span>
              </div>

              {/* Error & Success Banners */}
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-900">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    Server Validation Rejected
                  </div>
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Booking Submitted
                  </div>
                  <p className="leading-relaxed">{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Order Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Purchase Order
                  </label>
                  <select
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {data.assignedOrders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} - {o.title} ({o.remainingDays} PD free)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Performance Date</span>
                    <span className="text-[11px] text-slate-400 font-normal">German standard format</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Working Hours & Calculation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Working Hours (h)
                    </label>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      = {calculatedDays} Person-Days (PD)
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={hours}
                    onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>Conversion: 1 PD = {conversionRate}h</span>
                    <span className="text-amber-700 font-medium">Statutory Limit: Max 10.0h</span>
                  </div>

                  {/* Preset quick test buttons for Jurors */}
                  <div className="pt-2">
                    <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      Quick Presets for Jurors:
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPresetHours(4.0, "Frontend UI component sprint")}
                        className="text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 px-2 rounded border border-slate-200 transition"
                      >
                        Half (4h)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetHours(8.0, "Architecture and integration tests")}
                        className="text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 px-2 rounded border border-slate-200 transition"
                      >
                        Full (8h)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetHours(12.0, "Emergency overtime deployment")}
                        className="text-[11px] font-bold bg-red-50 hover:bg-red-100 text-red-700 py-1 px-2 rounded border border-red-200 transition"
                        title="Click to test server rejection under German ArbZG 10h limit"
                      >
                        Test 12h (Fail)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Deliverable Description Note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deliverable / Work Package Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., OAuth 2.0 PKCE authentication flow and unit tests..."
                    required
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Deliverable-based description ensures compliance with German bogus self-employment (Scheinselbstständigkeit) prevention rules.
                  </p>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  {isPending ? "Validating & Submitting..." : "Submit Deliverable Booking"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Order Context & Bookings Table */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Order Cockpit Card */}
            {selectedOrder && (
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {selectedOrder.orderNumber}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">{selectedOrder.title}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{selectedOrder.description}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                    Status: {selectedOrder.status.toUpperCase()}
                  </span>
                </div>

                {/* Budget Gauge */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500">Total Contract</p>
                    <p className="text-lg font-black text-slate-900">{selectedOrder.totalBudgetDays} PD</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500">Consumed</p>
                    <p className="text-lg font-black text-amber-600">{selectedOrder.consumedDays} PD</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <p className="text-xs text-emerald-700 font-semibold">Remaining Free</p>
                    <p className="text-lg font-black text-emerald-700">{selectedOrder.remainingDays} PD</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Budget Depletion</span>
                    <span>
                      {((selectedOrder.consumedDays / selectedOrder.totalBudgetDays) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (selectedOrder.consumedDays / selectedOrder.totalBudgetDays) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Historical Deliverable Bookings Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    My Submitted Deliverable Bookings
                  </h3>
                  <p className="text-xs text-slate-500">
                    Persisted in SQLite database, survives server restarts
                  </p>
                </div>
                <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                  {data.bookingsHistory.length} Total Entries
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Order</th>
                      <th className="py-3 px-4">Deliverable Milestone</th>
                      <th className="py-3 px-4 text-right">Hours / PD</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.bookingsHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No bookings recorded yet for this consultant.
                        </td>
                      </tr>
                    ) : (
                      data.bookingsHistory.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                            {b.date}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-mono font-semibold text-slate-800">
                              {b.orderNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-800 max-w-xs truncate">
                            {b.description}
                          </td>
                          <td className="py-3 px-4 text-right font-mono whitespace-nowrap">
                            <span className="font-bold text-slate-900">{b.hours}h</span>
                            <span className="text-slate-400 text-[11px] ml-1">({b.personDays} PD)</span>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {b.status === "approved" && (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Approved
                              </span>
                            )}
                            {b.status === "submitted" && (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Submitted
                              </span>
                            )}
                            {b.status === "rejected" && (
                              <span
                                className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-semibold text-[11px]"
                                title={b.rejectionReason || "Rejected by Project Lead"}
                              >
                                <AlertCircle className="w-3 h-3 text-red-600" />
                                Rejected
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
          </div>
        </div>
      )}
    </div>
  );
}

