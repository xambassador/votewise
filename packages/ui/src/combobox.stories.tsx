import type { Meta, StoryObj } from "@storybook/react";

import { useState } from "react";

import {
  ComboBoxContent,
  ComboBoxEmpty,
  ComboBoxInput,
  ComboBoxItem,
  ComboBoxList,
  ComboBoxPlaceholder,
  ComboBoxRoot,
  ComboBoxSelection,
  ComboBoxTrigger
} from "./combobox";

const meta = {
  title: "ui/ComboBox",
  tags: ["autodocs"],
  component: ComboBoxRoot,
  render: (args) => (
    <ComboBoxRoot {...args}>
      <ComboBoxTrigger>
        <ComboBoxSelection />
        <ComboBoxPlaceholder>Select items</ComboBoxPlaceholder>
      </ComboBoxTrigger>
      <ComboBoxContent>
        <ComboBoxInput />
        <ComboBoxList>
          <ComboBoxItem value="apple">Apple</ComboBoxItem>
          <ComboBoxItem value="banana">Banana</ComboBoxItem>
          <ComboBoxItem value="cherry">Cherry</ComboBoxItem>
          <ComboBoxEmpty>No items found</ComboBoxEmpty>
        </ComboBoxList>
      </ComboBoxContent>
    </ComboBoxRoot>
  )
} satisfies Meta<typeof ComboBoxRoot>;

export default meta;

type Story = StoryObj<typeof ComboBoxRoot>;

export const Default: Story = {};

const topics = [
  { value: "react", label: "React" },
  { value: "nextjs", label: "Next.js" },
  { value: "typescript", label: "TypeScript" },
  { value: "tailwind", label: "Tailwind CSS" },
  { value: "javascript", label: "JavaScript" },
  { value: "node", label: "Node.js" },
  { value: "graphql", label: "GraphQL" },
  { value: "prisma", label: "Prisma" },
  { value: "mongodb", label: "MongoDB" },
  { value: "postgres", label: "PostgreSQL" },
  { value: "redis", label: "Redis" },
  { value: "docker", label: "Docker" },
  { value: "kubernetes", label: "Kubernetes" },
  { value: "aws", label: "AWS" },
  { value: "vercel", label: "Vercel" }
];

export const WithControlledValues: Story = {
  args: {
    selected: ["vercel"]
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selectedTopics, setSelectedTopics] = useState<string[]>(["vercel"]);
    return (
      <ComboBoxRoot
        {...args}
        selected={selectedTopics}
        onChange={(selected) => {
          setSelectedTopics(selected);
        }}
      >
        <ComboBoxTrigger>
          <ComboBoxSelection />
          <ComboBoxPlaceholder>Select topics</ComboBoxPlaceholder>
        </ComboBoxTrigger>
        <ComboBoxContent>
          <ComboBoxInput placeholder="Search topics..." />
          <ComboBoxList className="scroller">
            {topics
              .filter((topic) => !selectedTopics.includes(topic.value))
              .map((topic) => (
                <ComboBoxItem key={topic.value} value={topic.value}>
                  {topic.label}
                </ComboBoxItem>
              ))}
            <ComboBoxEmpty>No topics found</ComboBoxEmpty>
          </ComboBoxList>
        </ComboBoxContent>
      </ComboBoxRoot>
    );
  }
};
