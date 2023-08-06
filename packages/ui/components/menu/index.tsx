import { Menu, Transition } from "@headlessui/react";
import React, { Fragment } from "react";

import classNames from "@votewise/lib/classnames";

type DropdownMenuProps = React.ComponentProps<typeof Menu>;

export function DropdownMenu(props: DropdownMenuProps) {
  const { as = "div", children, className, ...rest } = props;
  return (
    <Menu as={as} className={classNames("relative", className)} {...rest}>
      {children}
    </Menu>
  );
}

type DropdownButtonProps = React.ComponentProps<typeof Menu.Button>;
export function DropdownButton(props: DropdownButtonProps) {
  const { className, children, ...rest } = props;
  return (
    <Menu.Button className={className} {...rest}>
      {children}
    </Menu.Button>
  );
}

type DropdownTransitionProps = {
  open?: boolean;
} & React.ComponentProps<typeof Transition>;
export function DropdownTransition(props: DropdownTransitionProps) {
  const {
    as = Fragment,
    open,
    children,
    className,
    enter,
    enterFrom,
    enterTo,
    leave,
    leaveFrom,
    leaveTo,
  } = props;
  return (
    <Transition
      as={as}
      show={open}
      className={classNames("relative z-10", className)}
      enter={classNames("transition ease-out duration-100", enter)}
      enterFrom={classNames("transform opacity-0 scale-95", enterFrom)}
      enterTo={classNames("transform opacity-100 scale-100", enterTo)}
      leave={classNames("transition ease-in duration-75", leave)}
      leaveFrom={classNames("transform opacity-100 scale-100", leaveFrom)}
      leaveTo={classNames("transform opacity-0 scale-95", leaveTo)}
    >
      <div>{children as React.ReactNode}</div>
    </Transition>
  );
}

type DropdownMenuItemsProps = React.ComponentProps<typeof Menu.Items>;
export function DropdownMenuItems(props: DropdownMenuItemsProps) {
  const { as = "ul", children, className, ref, ...rest } = props;
  return (
    <Menu.Items
      as={as}
      className={classNames(
        "shadow-dropdown absolute right-0 z-10 mt-2 flex w-56 origin-top-right flex-col gap-2 rounded-lg border border-gray-200 bg-white p-5 outline-none",
        className
      )}
      ref={ref}
      {...rest}
    >
      {children}
    </Menu.Items>
  );
}

type DropdownMenuItemsGroupProps = React.HTMLAttributes<HTMLDivElement>;
export function DropdownMenuItemsGroup(props: DropdownMenuItemsGroupProps) {
  const { className, ...rest } = props;
  return <div className={classNames("flex flex-col gap-1", className)} {...rest} />;
}

type DropdownMenuItemProps = React.ComponentProps<typeof Menu.Item>;
export function DropdownMenuItem(props: DropdownMenuItemProps) {
  const { as = "div", children, className, ref, ...rest } = props;
  return (
    <Menu.Item
      as={as}
      className={classNames(
        "group flex items-center rounded p-1 text-base font-semibold text-gray-600 transition-colors ease-in hover:bg-gray-50",
        className
      )}
      ref={ref}
      {...rest}
    >
      {children}
    </Menu.Item>
  );
}
