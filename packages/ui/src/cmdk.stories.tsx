import type { Meta, StoryObj } from "@storybook/react";

import { Fragment } from "react";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "./cmdk";

const commands = [
  {
    group_name: "Users",
    items: [
      { value: "John doe", label: "John doe" },
      { value: "Jane smith", label: "Jane Smith" },
      { value: "Alice johnson", label: "Alice Johnson" },
      { value: "Bob brown", label: "Bob Brown" }
    ]
  },
  {
    group_name: "Settings",
    items: [
      { value: "settings", label: "Settings" },
      { value: "profile", label: "Profile" },
      { value: "logout", label: "Logout" }
    ]
  },
  {
    group_name: "Actions",
    items: [
      { value: "create", label: "Create" },
      { value: "edit", label: "Edit" },
      { value: "delete", label: "Delete" }
    ]
  }
];

const meta = {
  title: "ui/Command",
  component: Command,
  tags: ["autodocs"],
  render: (args) => (
    <div className="w-[850px] mx-auto">
      <Command {...args}>
        <CommandInput placeholder="Search..." />
        <CommandList className="scroller">
          <CommandEmpty>No results found.</CommandEmpty>
          {commands.map((group) => (
            <Fragment key={group.group_name}>
              <CommandGroup key={group.group_name} heading={group.group_name}>
                {group.items.map((item) => (
                  <CommandItem key={item.value} value={item.value}>
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </Fragment>
          ))}
        </CommandList>
      </Command>
    </div>
  )
} satisfies Meta<typeof Command>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
