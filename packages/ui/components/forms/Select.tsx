import React, { useId } from "react";
import { useFormContext } from "react-hook-form";
import type { GroupBase, InputProps, Props } from "react-select";
import ReactSelect, { components } from "react-select";

import { classNames } from "@votewise/lib";

import { Label } from "./fields";

export type SelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
> = Props<Option, IsMulti, Group>;

export function InputComponent<Option, IsMulti extends boolean, Group extends GroupBase<Option>>({
  inputClassName,
  ...props
}: InputProps<Option, IsMulti, Group>) {
  return (
    <components.Input
      inputClassName={classNames("focus:ring-0 focus:ring-offset-0", inputClassName)}
      {...props}
    />
  );
}

function Select<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({ className, ...props }: SelectProps<Option, IsMulti, Group>) {
  return (
    <ReactSelect
      theme={(theme) => ({
        ...theme,
        borderRadius: 8,
        colors: {
          ...theme.colors,
        },
      })}
      styles={{
        // Menu options wrapper styles
        menuList: (provided) => ({
          ...provided,
          padding: "1.25rem 1rem",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05), 0px 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }),
        // Option styles
        option: (provided, state) => ({
          ...provided,
          color: state.isSelected ? "var(--gray-600)" : "var(--gray-600)",
          ":active": {
            backgroundColor: state.isSelected ? "var(--blue-100)" : "var(--blue-100)",
            color: "var(--gray-600)",
          },
          ":hover": {
            backgroundColor: state.isSelected ? "var(--blue-100)" : "var(--blue-100)",
            color: "var(--gray-600)",
            transition: "all 0.3s ease",
          },
          backgroundColor: state.isSelected ? "var(--blue-100)" : "#fff",
          marginBottom: "12px",
          borderRadius: "4px",
          padding: "0.5rem 0.75rem",
        }),
        // Control input styles
        control: (baseStyle, state) => ({
          ...baseStyle,
          padding: "1rem 0",
          border: state.isFocused ? "1px solid var(--gray-200)" : "1px solid var(--gray-200)",
          ":hover": {
            border: state.isFocused ? "1px solid var(--gray-200)" : "1px solid var(--gray-200)",
          },
        }),
      }}
      components={{
        ...components,
        IndicatorSeparator: () => null,
        Input: InputComponent,
      }}
      className={className}
      {...props}
    />
  );
}

type SelectFieldProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
> = {
  label?: string;
  name: string;
} & SelectProps<Option, IsMulti, Group> & {
    labelProps?: React.ComponentProps<typeof Label>;
  };

export function SelectField<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({ className, ...props }: SelectFieldProps<Option, IsMulti, Group>) {
  const id = useId();
  const methods = useFormContext();
  const { label, labelProps, ...passThrogh } = props;

  return (
    <div className="flex w-full flex-col gap-2">
      {!!props.name && (
        <Label htmlFor={id} {...labelProps}>
          {label}
        </Label>
      )}
      <Select id={id} className={classNames("w-full", className)} {...passThrogh} />
      {methods?.formState?.errors[props.name]?.message && (
        <p className="mt-1 text-red-600">{methods.formState.errors[props.name]?.message as string}</p>
      )}
    </div>
  );
}

export default Select;

export function UnstyledSelect<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({ className, ...props }: SelectProps<Option, IsMulti, Group>) {
  return (
    <ReactSelect
      className={classNames("w-full", className)}
      {...props}
      isSearchable={false}
      theme={(theme) => ({ ...theme, borderRadius: 0, border: "none" })}
      components={{
        IndicatorSeparator: () => null,
        Input: InputComponent,
      }}
      styles={{
        menuList: (provided) => ({
          ...provided,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05), 0px 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }),
        container: (provided) => ({
          ...provided,
          width: "100%",
        }),
        control: (provided) => ({
          ...provided,
          backgroundColor: " transparent",
          border: "none",
          boxShadow: "none",
        }),
        option: (provided, state) => ({
          ...provided,
          color: state.isSelected ? "var(--gray-600)" : "var(--gray-600)",
          ":active": {
            backgroundColor: state.isSelected ? "var(--blue-100)" : "var(--blue-100)",
            color: "var(--gray-600)",
          },
          ":hover": {
            backgroundColor: state.isSelected ? "var(--blue-100)" : "var(--blue-100)",
            color: "var(--gray-600)",
            transition: "all 0.3s ease",
          },
          backgroundColor: state.isSelected ? "var(--blue-100)" : "#fff",
          marginBottom: "12px",
          borderRadius: "4px",
          padding: "0.5rem 0.75rem",
        }),
        indicatorSeparator: () => ({
          display: "hidden",
          color: "black",
        }),
        ...props.styles,
      }}
    />
  );
}
