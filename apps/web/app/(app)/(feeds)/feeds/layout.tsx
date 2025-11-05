import { Authorized } from "@/components/auth";

export default function Layout(props: React.PropsWithChildren) {
  return <Authorized>{props.children}</Authorized>;
}
