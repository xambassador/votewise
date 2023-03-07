import type { ReactNode } from "react";
import React, { forwardRef, useId } from "react";
import { useFormContext } from "react-hook-form";

import { classNames } from "@votewise/lib";

type InputProps = Omit<JSX.IntrinsicElements["input"], "name"> & {
  name: string;
  primary?: boolean;
  secondary?: boolean;
};

const getThemeClasses = (theme: "primary" | "secondary") => {
  let classnames = "w-full rounded-lg border border-gray-200";
  if (theme === "primary") {
    classnames += " px-3 py-4";
  }
  if (theme === "secondary") {
    classnames += " bg-gray-50";
  }
  return classnames;
};

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { className, secondary } = props;
  const classnames = secondary ? getThemeClasses("secondary") : getThemeClasses("primary");
  return <input {...props} ref={ref} className={classNames(classnames, className)} />;
});

export function Label(props: JSX.IntrinsicElements["label"]) {
  const { className, children, ...rest } = props;
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label {...rest} className={classNames("block font-bold text-gray-600", className)}>
      {children}
    </label>
  );
}

export function InputLeading(props: JSX.IntrinsicElements["div"]) {
  const { children } = props;
  return (
    <span className="inline-flex flex-shrink-0 items-center rounded-l-sm border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
      {children}
    </span>
  );
}

type InputFieldProps = {
  label?: ReactNode;
  hint?: ReactNode;
  addOnLeading?: ReactNode;
} & React.ComponentProps<typeof Input> & {
    labelProps?: React.ComponentProps<typeof Label>;
  };

const InputField = forwardRef<HTMLInputElement, InputFieldProps>((props, ref) => {
  const id = useId();
  const methods = useFormContext();
  const {
    label,
    labelProps,
    placeholder = "",
    className,
    children,
    hint,
    primary,
    secondary,
    ...passThrough
  } = props;
  return (
    <div className="flex w-full flex-col gap-2">
      {!!props.name && (
        <Label htmlFor={id} {...labelProps}>
          {label}
        </Label>
      )}
      <div className="relative w-full">
        <Input
          id={id}
          placeholder={placeholder}
          className={classNames("mt-0", props.addOnLeading && "rounded-l-none", className)}
          primary={primary}
          secondary={secondary}
          {...passThrough}
          ref={ref}
        />
        {children}
      </div>
      {hint}
      {methods?.formState?.errors[props.name]?.message && (
        <p className="mt-1">{methods.formState.errors[props.name]?.message as string}</p>
      )}
    </div>
  );
});

export const TextField = forwardRef<HTMLInputElement, InputFieldProps>((props, ref) => (
  <InputField ref={ref} {...props} />
));

export const PasswordField = forwardRef<HTMLInputElement, InputFieldProps>((props, ref) => (
  <InputField data-testid="password" type="password" placeholder="•••••••••••••" ref={ref} {...props} />
));

export const EmailInput = forwardRef<HTMLInputElement, InputFieldProps>((props, ref) => (
  <Input
    ref={ref}
    type="email"
    autoCapitalize="none"
    autoComplete="email"
    autoCorrect="off"
    inputMode="email"
    {...props}
  />
));

export const EmailField = forwardRef<HTMLInputElement, InputFieldProps>((props, ref) => (
  <InputField
    ref={ref}
    type="email"
    autoCapitalize="none"
    autoComplete="email"
    autoCorrect="off"
    inputMode="email"
    {...props}
  />
));

type TextAreaProps = Omit<JSX.IntrinsicElements["textarea"], "name"> & {
  name: string;
  primary?: string;
  secondary?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>((props, ref) => {
  const { className, secondary } = props;
  const classnames = secondary ? getThemeClasses("secondary") : getThemeClasses("primary");
  return <textarea ref={ref} {...props} className={classNames(classnames, className)} />;
});

type TextAreaFieldProps = {
  label?: ReactNode;
} & React.ComponentProps<typeof TextArea> & {
    labelProps?: React.ComponentProps<typeof Label>;
  };

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>((props, ref) => {
  const id = useId();
  const methods = useFormContext();
  const { label, labelProps, placeholder = "", ...passThrough } = props;
  return (
    <div className="flex w-full flex-col gap-2">
      {!!props.name && (
        <Label htmlFor={id} {...labelProps}>
          {label}
        </Label>
      )}
      <TextArea ref={ref} id={id} placeholder={placeholder} {...passThrough} />
      {methods?.formState?.errors[props.name]?.message && (
        // TODO: Replace with error component
        <p className="mt-1">{methods.formState.errors[props.name]?.message as string}</p>
      )}
    </div>
  );
});
