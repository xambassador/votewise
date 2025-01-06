import { auth } from "@/lib/auth";

import { shouldNotOnboarded } from "./_utils";

type Props = { children: React.ReactNode };

export default async function Layout(props: Props) {
  auth<true>({ redirect: true });
  shouldNotOnboarded();
  return (
    <main className="min-h-screen w-screen">
      <div className="w-full min-h-screen grid place-items-center">{props.children}</div>
    </main>
  );
}
