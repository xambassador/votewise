"use client";

import { useStep } from "../_hooks/use-step";
import { Footer } from "../../_components/footer";

type Props = { url?: string };

export function FooterAction(props: Props) {
  const { getBackProps, getButtonProps } = useStep({ initialBg: props.url });
  return <Footer nextProps={getButtonProps()} backProps={getBackProps()} />;
}
