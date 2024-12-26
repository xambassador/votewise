import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { COOKIE_KEYS, getCookie } from "@/lib/cookie";
import { routes } from "@/lib/routes";

type Props = { children: React.ReactNode };

export default async function Layout(props: Props) {
  auth<true>({ redirect: true });
  const isOnboarded = getCookie(COOKIE_KEYS.is_onboarded);
  if (!isOnboarded) {
    return redirect(routes.auth.logout({ redirect: routes.onboard.root() }));
  }
  if (isOnboarded === "true") return redirect(routes.app.root());

  return (
    <main className="min-h-screen w-screen">
      <div className="w-full min-h-screen grid place-items-center">{props.children}</div>
    </main>
  );
}
