import { getDashboardData } from "@/app/actions/dashboard";
import { getSessionUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard · Deutsche Enterprise AG",
};

export default async function DashboardPage() {
  const sessionUser = await getSessionUser();

  // Guard 1: Require authentication
  if (!sessionUser) {
    redirect("/login");
  }

  // Guard 2: External consultants are routed to their designated contractor portal
  if (sessionUser.role === "consultant") {
    redirect("/portal/contractor-portal-2026");
  }

  const data = await getDashboardData();
  return <DashboardClient initialData={data} />;
}
