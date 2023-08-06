import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useRef } from "react";
import type { ReactNode, RefObject } from "react";

import classNames from "@votewise/lib/classnames";

type ModalTitleProps = React.ComponentProps<typeof Dialog.Title>;
export function ModalTitle(props: ModalTitleProps) {
  const { className, ...rest } = props;
  return <Dialog.Title className={classNames("text-3xl font-bold text-gray-600", className)} {...rest} />;
}

export function Modal({
  open,
  setOpen,
  children,
  className = "",
}: {
  open: boolean;
  className?: string;
  setOpen: (open: boolean) => void;
  children: ReactNode | ((cancelButtonRef: RefObject<HTMLButtonElement>) => ReactNode);
}) {
  const cancelButtonRef = useRef(null);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-y-0 left-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={classNames("relative transform overflow-hidden transition-all", className)}
              >
                {children instanceof Function ? children(cancelButtonRef) : children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
