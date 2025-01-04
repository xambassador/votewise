import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { routes } from "@/lib/routes";

type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  const { user } = auth<true>({ redirect: true });
  if (user.aal !== user.user_aal_level) {
    return redirect(routes.auth.verify2FA());
  }
  return props.children;
}
