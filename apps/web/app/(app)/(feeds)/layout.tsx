import { Authorized } from "@/components/auth";
import { Container } from "@/components/container";

import { FeedTabs } from "./_components/tabs";

type Props = { children: React.ReactNode };

export default async function Layout(props: Props) {
  return (
    <Authorized>
      <FeedTabs />
      <Container>{props.children}</Container>
    </Authorized>
  );
}
