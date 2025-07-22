import type { Meta, StoryObj } from "@storybook/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tab";

const meta = {
  title: "ui/Tabs",
  component: Tabs,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  subcomponents: { TabsList, TabsTrigger, TabsContent },
  tags: ["autodocs"],
  args: {
    defaultValue: "tab1"
  },
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger disabled value="tab2">
          Tab 2
        </TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content for Tab 1</TabsContent>
      <TabsContent value="tab2">Content for Tab 2</TabsContent>
      <TabsContent value="tab3">Content for Tab 3</TabsContent>
    </Tabs>
  )
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {};
