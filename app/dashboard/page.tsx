import { getDashboardData } from "@/app/actions/dashboard";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard · Deutsche Enterprise AG",
};

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardClient initialData={data} />;
}

