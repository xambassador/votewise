import { Authorized } from "@/components/auth";

export default async function Layout(props: React.PropsWithChildren) {
  return <Authorized>{props.children}</Authorized>;
}
