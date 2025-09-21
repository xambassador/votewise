import { Fragment } from "react";

import { Container } from "@/components/container";

import { FeedTabs } from "../(feeds)/_components/tabs";

export default function Layout(props: React.PropsWithChildren) {
  return (
    <Fragment>
      <FeedTabs />
      <Container>{props.children}</Container>
    </Fragment>
  );
}
