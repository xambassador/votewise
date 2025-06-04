"use client";

import { useState } from "react";

import { Badge } from "./badge";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "./cmdk";
import { cn } from "./cn";
import { createContext } from "./context";
import { Cross } from "./icons/cross";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type State = {
  selected: string[];
  onSelect: (value: string) => void;
  onUnselect: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const [Provider, useProvider] = createContext<State>("ComboboxRoot");

export type ComboBoxRootProps = React.ComponentProps<typeof Popover> & {
  onChange?: (selected: string[]) => void;
  selected?: string[];
};
export function ComboBoxRoot(props: ComboBoxRootProps) {
  const {
    open: controlledOpen = false,
    onOpenChange: controlledOnOpenChange,
    onChange,
    selected: controlledSelected,
    ...rest
  } = props;
  const [selected, setSelected] = useState<string[]>(controlledSelected || []);
  const [open, setOpen] = useState(controlledOpen);

  const onOpenChange = (open: boolean) => {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(open);
    }
    setOpen(open);
  };

  const onSelect = (value: string) => {
    const isSelected = selected.includes(value);
    if (isSelected) {
      const filteredSelected = selected.filter((item) => item !== value);
      setSelected(filteredSelected);
      onChange?.(filteredSelected);
    } else {
      const newSelectedValues = [...selected, value];
      setSelected(newSelectedValues);
      onChange?.(newSelectedValues);
    }
  };

  const onUnselect = (value: string) => {
    const filteredSelected = selected.filter((item) => item !== value);
    setSelected(filteredSelected);
    onChange?.(filteredSelected);
  };

  return (
    <Provider selected={selected} onSelect={onSelect} onUnselect={onUnselect} open={open} onOpenChange={onOpenChange}>
      <Popover {...rest} open={open} onOpenChange={onOpenChange} />
    </Provider>
  );
}

export type ComboBoxTriggerProps = Omit<React.ComponentProps<typeof PopoverTrigger>, "asChild">;
export function ComboBoxTrigger(props: ComboBoxTriggerProps) {
  const { className, children, ...rest } = props;
  const { onOpenChange, open } = useProvider("ComboboxTrigger");
  return (
    <PopoverTrigger
      {...rest}
      className={cn(
        "flex min-h-10 w-full flex-wrap items-center gap-1 rounded-full bg-transparent px-3 py-2 text-sm ring-offset-background",
        className
      )}
      asChild
    >
      <div role="combobox" aria-controls="popover-content" aria-expanded={open} onClick={() => onOpenChange?.(true)}>
        {children}
      </div>
    </PopoverTrigger>
  );
}

export type ComboBoxSelectionProps = Omit<React.ComponentProps<typeof Badge>, "children">;
export function ComboBoxSelection(props: ComboBoxSelectionProps) {
  const { className, ...rest } = props;
  const { selected, onUnselect } = useProvider("ComboboxSelection");
  return (
    <>
      {selected.map((item) => (
        <Badge key={item} variant="outline" {...rest} className={cn("text-blue-400 border-blue-400", className)}>
          {item}
          <button
            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onUnselect(item);
              }
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onUnselect(item);
            }}
          >
            <Cross className="size-3" />
            {/* TODO: Need to anounce what we are removing to screen readers */}
            <span className="sr-only">Remove</span>
          </button>
        </Badge>
      ))}
    </>
  );
}

export type ComboBoxPlaceholderProps = React.ComponentProps<typeof Badge>;
export function ComboBoxPlaceholder(props: ComboBoxPlaceholderProps) {
  const { className, children, ...rest } = props;
  return (
    <Badge {...rest} variant="outline" className={cn("border-dashed", className)}>
      {children}
    </Badge>
  );
}

export type ComboBoxContentProps = React.ComponentProps<typeof PopoverContent>;
export function ComboBoxContent(props: ComboBoxContentProps) {
  const { className, children, ...rest } = props;
  return (
    <PopoverContent align="start" {...rest} className={cn("w-full p-0", className)}>
      <Command>{children}</Command>
    </PopoverContent>
  );
}

export type ComboBoxInputProps = React.ComponentProps<typeof CommandInput>;
export function ComboBoxInput(props: ComboBoxInputProps) {
  const { className, ...rest } = props;
  return <CommandInput placeholder="Search options..." {...rest} className={cn("h-10", className)} />;
}

export type ComboBoxListProps = React.ComponentProps<typeof CommandList>;
export function ComboBoxList(props: ComboBoxListProps) {
  const { children, ...rest } = props;
  return <CommandList {...rest}>{children}</CommandList>;
}

export type ComboBoxEmptyProps = React.ComponentProps<typeof CommandEmpty>;
export function ComboBoxEmpty(props: ComboBoxEmptyProps) {
  const { children, ...rest } = props;
  return <CommandEmpty {...rest}>{children}</CommandEmpty>;
}

export type ComboBoxItemProps = React.ComponentProps<typeof CommandItem> & { value: string };
export function ComboBoxItem(props: ComboBoxItemProps) {
  const { value, onSelect: controllerOnSelect, ...rest } = props;
  const { onSelect } = useProvider("ComboboxItem");
  return (
    <CommandItem
      {...rest}
      onSelect={() => {
        controllerOnSelect?.(value);
        onSelect(value);
      }}
    />
  );
}
