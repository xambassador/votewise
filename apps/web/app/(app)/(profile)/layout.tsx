import { Authorized } from "@/components/auth";
import { Container } from "@/components/container";

import { FeedTabs } from "@/app/(app)/(feeds)/_components/tabs";

export default function Layout(props: React.PropsWithChildren) {
  return (
    <Authorized>
      <FeedTabs />
      <Container>{props.children}</Container>
    </Authorized>
  );
}
