import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

import { ResetPasswordForm } from "./_components/form";

type Props = { searchParams: { token?: string } };

export default function Page(props: Props) {
  const { token } = props.searchParams;
  if (!token) return redirect(routes.auth.signIn());
  return <ResetPasswordForm />;
}
