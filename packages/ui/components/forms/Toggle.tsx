import { Switch } from "@headlessui/react";
import React, { useId } from "react";

import { classNames } from "@votewise/lib";

type Props = React.ComponentProps<typeof Switch> & {
  label?: string;
  triggerClassName?: string;
};

export function Toggle(props: Props) {
  const { className, checked = false, label, triggerClassName, ...rest } = props;

  return (
    <Switch
      checked={checked}
      className={classNames(
        checked ? "bg-indigo-600" : "bg-gray-200",
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
        className
      )}
      {...rest}
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className={classNames(
          checked ? "translate-x-5" : "translate-x-0",
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          triggerClassName
        )}
      />
    </Switch>
  );
}

type ToggleFieldProps = React.ComponentProps<typeof Toggle> & {
  labelProps?: React.HTMLAttributes<HTMLLabelElement> & { label?: string };
};

export function ToggleField(props: ToggleFieldProps) {
  const id = useId();
  const { label, labelProps, ...rest } = props;

  return (
    <div className="flex shrink-0 flex-row items-center justify-start gap-2">
      <Toggle id={id} {...rest} />
      <label {...labelProps} htmlFor={id}>
        {label}
      </label>
    </div>
  );
}
