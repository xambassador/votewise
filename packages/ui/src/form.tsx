"use client";

import type { FieldValues } from "react-hook-form";

import { forwardRef, useId } from "react";
import { Slot } from "@radix-ui/react-slot";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";

import { cn } from "./cn";
import { createContext } from "./context";
import { Label } from "./label";

const [Context, useContext] = createContext<{ id: string; name: string }>("Form");

export { useForm, useFormContext };
export const Form = FormProvider;
export const FieldController = Controller;
export type TFormProps<T extends FieldValues> = React.ComponentProps<typeof FormProvider<T>>;
export type TFieldControllerProps<T extends FieldValues> = React.ComponentProps<typeof Controller<T>>;

function useFormField(name: string) {
  const ctx = useContext(name);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(ctx.name, formState);
  return { id: ctx.id, name: ctx.name, ...fieldState };
}

type FormFieldProps = React.HTMLAttributes<HTMLDivElement> & { name: string };
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>((props, ref) => {
  const { name, ...rest } = props;
  const id = useId();
  return (
    <Context id={id} name={name}>
      <div {...rest} className={cn("flex flex-col gap-3", rest.className)} ref={ref} />
    </Context>
  );
});
FormField.displayName = "FormField";

type FormLabelProps = React.ComponentPropsWithoutRef<typeof Label>;
type LabelRef = React.ElementRef<typeof Label>;
export const FormLabel = forwardRef<LabelRef, FormLabelProps>((props, ref) => {
  const { error, id } = useFormField("FormLabel");
  return <Label ref={ref} htmlFor={id} {...props} data-is-error={error ? true : false} />;
});
FormLabel.displayName = "FormLabel";

type FormControlProps = Omit<React.ComponentPropsWithoutRef<typeof Slot>, "children"> & {
  children:
    | React.ComponentPropsWithoutRef<typeof Slot>["children"]
    | ((props: { id: string; hasError: boolean }) => React.ReactNode);
};
type FormControlRef = React.ElementRef<typeof Slot>;
export const FormControl = forwardRef<FormControlRef, FormControlProps>((props, ref) => {
  const { id, error } = useFormField("FormControl");
  const { children, ...rest } = props;

  if (typeof children === "function") {
    return children({ id, hasError: !!error });
  }

  return (
    <Slot {...rest} ref={ref} id={id} data-has-error={error ? true : false} aria-invalid={!!error}>
      {children}
    </Slot>
  );
});
FormControl.displayName = "FormControl";

type FormMessageProps = React.HTMLAttributes<HTMLParagraphElement>;
export const FormMessage = forwardRef<HTMLParagraphElement, FormMessageProps>((props, ref) => {
  const { error } = useFormField("FormMessage");
  const message = error ? error.message : null;
  if (!message) return null;
  return (
    <p
      ref={ref}
      data-is-error={error ? true : false}
      {...props}
      className={cn("text-sm text-red-500", props.className)}
    >
      {message}
    </p>
  );
});
FormMessage.displayName = "FormMessage";
