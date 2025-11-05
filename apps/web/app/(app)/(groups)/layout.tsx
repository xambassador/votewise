import { Authorized } from "@/components/auth";
import { Container } from "@/components/container";

import { GroupTabs } from "./_components/tabs";

type Props = { children: React.ReactNode };

export default async function Layout(props: Props) {
  return (
    <Authorized>
      <GroupTabs />
      <Container>{props.children}</Container>
    </Authorized>
  );
}
