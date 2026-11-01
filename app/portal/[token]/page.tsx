import { notFound } from "next/navigation";
import { getPortalData } from "@/app/actions/portal";
import { getSessionUser } from "@/app/actions/auth";
import PortalClient from "./PortalClient";
import PartnerAuthClient from "./PartnerAuthClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function PortalPage({ params }: Props) {
  const { token } = await params;
  const data = await getPortalData(token);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto font-bold text-xl">
            !
          </div>
          <h1 className="text-xl font-bold text-slate-900">Access Link Not Found</h1>
          <p className="text-xs text-slate-500">
            This external contractor access link does not exist or has expired. Please contact your project lead at Deutsche Enterprise AG.
          </p>
        </div>
      </div>
    );
  }

  const sessionUser = await getSessionUser();

  // If user is not logged in, or logged in under a different company, require them to sign up or log in
  if (!sessionUser || sessionUser.companyId !== data.companyId) {
    return <PartnerAuthClient orderData={data} />;
  }

  return <PortalClient initialData={data} currentUser={sessionUser} />;
}
