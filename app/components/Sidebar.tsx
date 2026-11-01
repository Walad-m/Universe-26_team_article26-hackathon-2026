"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Briefcase,
  Link2,
  CheckSquare,
  Radio,
  LogOut,
  Building2,
  ShieldCheck,
  ChevronRight,
  Plus,
} from "lucide-react";
import { logoutUser, SessionUser } from "@/app/actions/auth";

interface SidebarProps {
  user?: SessionUser | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const isClient = user?.companyType === "client";
  const orgName = user?.companyName || (isClient ? "Deutsche Enterprise AG" : "Agency Alpha GmbH");
  const userName = user?.name || "Corporate User";
  const roleName =
    user?.role === "project_lead"
      ? "Project Lead"
      : user?.role === "purchasing"
      ? "Purchasing Governance"
      : "External Consultant";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const navLinks = isClient
    ? [
        {
          group: "MAIN",
          items: [
            { label: "Dashboard Cockpit", href: "/lead", icon: LayoutDashboard },
            { label: "Deliverable Bookings", href: "/lead#bookings", icon: Clock },
          ],
        },
        {
          group: "GOVERNANCE & VENDORS",
          items: [
            { label: "Purchase Orders", href: "/lead#orders", icon: Briefcase },
            { label: "Deliverable Approvals", href: "/lead#approvals", icon: CheckSquare },
          ],
        },
      ]
    : [
        {
          group: "PARTNER WORKSPACE",
          items: [
            { label: "Deliverable Booking", href: "/consultant", icon: Clock },
            { label: "Assigned Orders", href: "/consultant#orders", icon: Briefcase },
          ],
        },
      ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold shadow-sm shrink-0">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-xs text-slate-900 truncate tracking-tight">{orgName}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isClient ? "bg-slate-900" : "bg-blue-500"
                  }`}
                />
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  {isClient ? "Client Organization" : "Partner Agency"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-6">
          {navLinks.map((section) => (
            <div key={section.group}>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {section.group}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {getInitials(userName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
              <p className="text-[10px] text-slate-500 truncate">{roleName}</p>
            </div>
          </div>
          <form action={logoutUser}>
            <button
              type="submit"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

