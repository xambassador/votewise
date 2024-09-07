import { Fragment } from "react";

import { FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { Input } from "@votewise/ui/input";

import { useStepTwo } from "../_hooks/use-signup";

export function StepTwoForm() {
  const { render, getUserNameInputProps, getLastNameInputProps, getFormFieldProps, getFirstNameInputProps } =
    useStepTwo();

  return render(
    <Fragment>
      <FormField {...getFormFieldProps("userName")}>
        <FormLabel>Username</FormLabel>
        <FormControl>
          <Input {...getUserNameInputProps()} />
        </FormControl>
        <FormMessage />
      </FormField>

      <FormField {...getFormFieldProps("firstName")}>
        <FormLabel>First name</FormLabel>
        <FormControl>
          <Input {...getFirstNameInputProps()} />
        </FormControl>
        <FormMessage />
      </FormField>

      <FormField {...getFormFieldProps("lastName")}>
        <FormLabel>Last name</FormLabel>
        <FormControl>
          <Input {...getLastNameInputProps()} />
        </FormControl>
        <FormMessage />
      </FormField>
    </Fragment>
  );
}
