import React from "react";
import { Tab } from "@headlessui/react";

import classNames from "@votewise/lib/classnames";

type TabButtonProps = {
  selected?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function TabButton(props: TabButtonProps) {
  const { children, className, selected, ...rest } = props;
  const classes = classNames(
    "bg-gray-800 text-gray-50 rounded-full py-[2px] py-[10px]",
    selected ? "bg-gray-200 text-gray-800" : "",
    className
  );
  return (
    // eslint-disable-next-line react/button-has-type
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

export function TabGroups(props: React.ComponentProps<typeof Tab.Group>) {
  return <Tab.Group {...props} />;
}

export function TabList(props: React.ComponentProps<typeof Tab.List>) {
  return <Tab.List {...props} />;
}

export function TabItem(props: React.ComponentProps<typeof Tab>) {
  return <Tab {...props} />;
}

export function TabPanels(props: React.ComponentProps<typeof Tab.Panels>) {
  return <Tab.Panels {...props} />;
}

export function TabPanel(props: React.ComponentProps<typeof Tab.Panel>) {
  return <Tab.Panel {...props} />;
}
