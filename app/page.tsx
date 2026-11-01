import { getSessionUser } from "./actions/auth";
import LandingClient from "./LandingClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sessionUser = await getSessionUser();
  return <LandingClient currentUser={sessionUser} />;
}
