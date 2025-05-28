import { Unauthorized } from "@/components/auth";

type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  return (
    <Unauthorized>
      <main className="w-screen min-h-screen">{props.children}</main>
    </Unauthorized>
  );
}
