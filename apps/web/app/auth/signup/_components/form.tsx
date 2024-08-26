"use client";

import { Fragment } from "react";

import { Button } from "@votewise/ui/button";
import { Form } from "@votewise/ui/form";

import { useSignup } from "../_hooks/use-signup";
import { StepOneForm } from "./step-one";
import { StepTwoForm } from "./step-two";

export function SignupForm() {
  const { getStapLabelContent, getNextButtonProps, getBackButtonProps, form } = useSignup();
  const { stepOneForm, stepTwoForm } = form;

  return (
    <Fragment>
      <div className="flex flex-col gap-7">
        <div>
          <span className="text-base">{getStapLabelContent()}</span>
          <h4 className="text-3xl font-semibold">Your account</h4>
        </div>
        <div className="flex flex-col gap-7 min-w-[calc((450/16)*1rem)] max-w-[calc((450/16)*1rem)]">
          <Form {...stepOneForm}>
            <StepOneForm />
          </Form>
          <Form {...stepTwoForm}>
            <StepTwoForm />
          </Form>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Button {...getBackButtonProps()} />
        <Button {...getNextButtonProps()} />
      </div>
    </Fragment>
  );
}
