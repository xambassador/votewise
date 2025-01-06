"use client";

import { useStep } from "../_hooks/use-step";
import { Footer } from "../../_components/footer";

export function FooterAction() {
  const { getBackProps, getButtonProps } = useStep();
  return <Footer nextProps={getButtonProps()} backProps={getBackProps()} />;
}
