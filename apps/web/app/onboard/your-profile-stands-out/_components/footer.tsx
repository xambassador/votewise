"use client";

import { Footer } from "@/app/onboard/_components/footer";

import { useStep } from "../_hooks/use-step";

type Props = { url?: string };

export function FooterAction(props: Props) {
  const { getBackProps, getButtonProps } = useStep({ initialBg: props.url });
  return <Footer nextProps={getButtonProps()} backProps={getBackProps()} />;
}
