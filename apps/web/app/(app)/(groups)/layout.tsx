import { Fragment } from "react";

import { Container } from "@/components/container";

import { GroupTabs } from "./_components/tabs";

type Props = { children: React.ReactNode };

export default async function Layout(props: Props) {
  return (
    <Fragment>
      <GroupTabs />
      <Container>{props.children}</Container>
    </Fragment>
  );
}
