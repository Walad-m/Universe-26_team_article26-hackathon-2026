import Link from "next/link";
import { getPortalData } from "@/app/actions/portal";
import { getSessionUser, logoutUser } from "@/app/actions/auth";
import { ShieldAlert, ArrowRight } from "lucide-react";
import PortalClient from "./PortalClient";
import PartnerAuthClient from "./PartnerAuthClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function PortalPage({ params }: Props) {
  const { token } = await params;
  const sessionUser = await getSessionUser();
  const data = await getPortalData(token, sessionUser?.id);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-black/[0.06] text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto font-bold text-xl">
            !
          </div>
          <h1 className="text-xl font-bold text-[#1D1D1F]">Access Link Not Found</h1>
          <p className="text-xs text-[#86868B] leading-relaxed">
            This external contractor access link does not exist or has expired. Please contact your project lead at Deutsche Enterprise AG.
          </p>
        </div>
      </div>
    );
  }

  // Guard 1: Client Enterprise accounts (Project Lead & Purchasing) cannot access contractor portal
  if (sessionUser && sessionUser.role !== "consultant") {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4 antialiased selection:bg-[#0071E3] selection:text-white">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center space-y-5">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto font-bold shadow-xs">
            <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1D1D1F]">
              Client Enterprise Account Detected
            </h1>
            <p className="text-xs text-[#86868B] mt-1.5 leading-relaxed">
              You are currently signed in as <strong className="text-[#1D1D1F]">{sessionUser.name}</strong> (
              {sessionUser.role === "project_lead" ? "Client Project Lead" : "Purchasing Officer"}). Under German labor
              law and enterprise RBAC rules, the contractor portal is strictly reserved for external service providers (
              <span className="text-[#1D1D1F] font-semibold">{data.supplierName}</span>).
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/dashboard"
              className="w-full bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold py-3 px-4 rounded-xl transition shadow-xs inline-flex items-center justify-center gap-2"
            >
              <span>Return to Management Cockpit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <form action={logoutUser}>
              <button
                type="submit"
                className="w-full text-xs text-[#86868B] hover:text-rose-600 font-medium py-2 transition cursor-pointer"
              >
                Sign out of client account to access as contractor
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Guard 2: If user is not logged in, or logged in under a different supplier company, require sign-in
  if (!sessionUser || sessionUser.companyId !== data.companyId) {
    return <PartnerAuthClient orderData={data} />;
  }

  // Authenticated consultant belonging to the contracted supplier
  return <PortalClient initialData={data} currentUser={sessionUser} />;
}
