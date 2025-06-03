"use client";

import type { Placement } from "@floating-ui/react";

import { cloneElement, createContext, forwardRef, isValidElement, useContext, useMemo, useRef, useState } from "react";
import {
  arrow,
  autoUpdate,
  flip,
  FloatingArrow,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useMergeRefs,
  useRole,
  useTransitionStyles
} from "@floating-ui/react";

export interface TooltipOptions {
  initialOpen?: boolean;
  placement?: Placement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useTooltip(props: TooltipOptions = {}) {
  const { initialOpen = false, placement = "top", open: controlledOpen, onOpenChange: setControlledOpen } = props;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const arrowRef = useRef(null);

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      flip({
        crossAxis: placement.includes("-"),
        fallbackAxisSideDirection: "start",
        padding: 5
      }),
      shift({ padding: 5 }),
      arrow({ element: arrowRef })
    ]
  });

  const context = data.context;

  const transition = useTransitionStyles(context, {
    initial: { opacity: 0, transform: "translate3d(0, -8px, 0)" },
    open: { opacity: 1, transform: "translate3d(0, 0, 0)" },
    close: { opacity: 0, transform: "translate3d(0, -8px, 0)" }
  });
  const hover = useHover(context, {
    move: false,
    enabled: controlledOpen == null,
    delay: 300
  });
  const focus = useFocus(context, {
    enabled: controlledOpen == null
  });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const interactions = useInteractions([hover, focus, dismiss, role]);

  return useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
      transition,
      arrowRef
    }),
    [open, setOpen, interactions, data, transition]
  );
}

type ContextType = ReturnType<typeof useTooltip> | null;

const TooltipContext = createContext<ContextType>(null);

export const useTooltipContext = () => {
  const context = useContext(TooltipContext);

  if (context == null) {
    throw new Error("Tooltip components must be wrapped in <Tooltip />");
  }

  return context;
};

export function Tooltip({ children, ...options }: { children: React.ReactNode } & TooltipOptions) {
  const tooltip = useTooltip(options);
  return <TooltipContext.Provider value={tooltip}>{children}</TooltipContext.Provider>;
}

export const TooltipTrigger = forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & { asChild?: boolean }>(
  function TooltipTrigger({ children, asChild = false, ...props }, propRef) {
    const context = useTooltipContext();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childrenRef = (children as any).ref;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

    // `asChild` allows the user to pass any element as the anchor
    if (asChild && isValidElement(children)) {
      return cloneElement(
        children,
        context.getReferenceProps({
          ref,
          ...props,
          ...children.props,
          "data-state": context.open ? "open" : "closed"
        })
      );
    }

    return (
      <button ref={ref} data-state={context.open ? "open" : "closed"} {...context.getReferenceProps(props)}>
        {children}
      </button>
    );
  }
);

type TooltipContentProps = React.HTMLProps<HTMLDivElement> & {
  arrowProps?: React.ComponentProps<typeof FloatingArrow>;
};
export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(function TooltipContent(
  { style, arrowProps, ...props },
  propRef
) {
  const context = useTooltipContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  return (
    <FloatingPortal>
      {context.transition.isMounted && (
        <div
          ref={ref}
          style={{
            ...context.floatingStyles,
            ...style
          }}
          className="text-nobelBlack-200"
        >
          <div style={context.transition.styles} {...context.getFloatingProps(props)}>
            {props.children}
            <FloatingArrow ref={context.arrowRef} context={context.context} fill="currentColor" {...arrowProps} />
          </div>
        </div>
      )}
    </FloatingPortal>
  );
});
