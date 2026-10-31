import { getConsultantViewData } from "@/app/actions/bookings";
import ConsultantBookingClient from "./ConsultantBookingClient";

interface PageProps {
  searchParams: Promise<{ user?: string }>;
}

export const dynamic = "force-dynamic";

export default async function ConsultantPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const userEmail = resolvedParams?.user || "consultant@supplier-a.de";

  const data = await getConsultantViewData(userEmail);

  return <ConsultantBookingClient initialData={data} />;
}

