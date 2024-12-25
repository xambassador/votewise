import { auth } from "@/lib/auth";

type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  auth({ redirect: true });
  return (
    <main className="min-h-screen w-screen">
      <div className="w-full min-h-screen grid place-items-center">{props.children}</div>
    </main>
  );
}
