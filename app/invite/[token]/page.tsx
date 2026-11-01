import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InviteRedirectPage({ params }: Props) {
  const { token } = await params;
  redirect(`/portal/${token}`);
}

