import { Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { ToastOptions } from "react-hot-toast";

type ToastProps = {
  message: string;
  visible: boolean;
};

function ToastTransition({ children, show }: { children: React.ReactNode; show: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [show]);

  return (
    <Transition
      as={React.Fragment}
      show={visible}
      enter="transform transition ease-out duration-300"
      enterFrom="opacity-0 translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="transition ease-in duration-300"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-1"
    >
      {children}
    </Transition>
  );
}

export function SuccessToast({ message, visible }: ToastProps) {
  return (
    <ToastTransition show={visible}>
      <div className="mb-2 flex h-auto items-center space-x-2 rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:max-w-sm">
        <span>
          <CheckCircleIcon className="h-6 w-6 text-green-400" />
        </span>
        <p className="text-sm font-medium text-gray-800">{message}</p>
      </div>
    </ToastTransition>
  );
}

export function ErrorToast({ message, visible }: ToastProps) {
  return (
    <ToastTransition show={visible}>
      <div className="mb-2 flex h-auto items-center space-x-2 rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:max-w-sm">
        <span>
          <XCircleIcon className="h-6 w-6 text-red-600" />
        </span>
        <p className="text-sm font-medium text-gray-800">{message}</p>
      </div>
    </ToastTransition>
  );
}

export function WarningToast({ message, visible }: ToastProps) {
  return (
    <ToastTransition show={visible}>
      <div className="mb-2 flex h-auto items-center space-x-2 rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:max-w-sm">
        <span>
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
        </span>
        <p className="text-sm font-medium text-gray-800">{message}</p>
      </div>
    </ToastTransition>
  );
}

export function InfoToast({ message, visible }: ToastProps) {
  return (
    <ToastTransition show={visible}>
      <div className="mb-2 flex h-auto items-center space-x-2 rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:max-w-sm">
        <span>
          <InformationCircleIcon className="h-6 w-6 text-blue-400" />
        </span>
        <p className="text-sm font-medium text-gray-800">{message}</p>
      </div>
    </ToastTransition>
  );
}

const DEFAULT_DURATION = 3000;

export function makeToast(
  message: string,
  type: "success" | "warning" | "error" | "info",
  options?: ToastOptions
) {
  const defaultOptions: ToastOptions = {
    duration: DEFAULT_DURATION,
    ...options,
  };

  switch (type) {
    case "success":
      toast.custom((t) => <SuccessToast message={message} visible={t.visible} />, defaultOptions);
      break;
    case "warning":
      toast.custom((t) => <WarningToast message={message} visible={t.visible} />, defaultOptions);
      break;
    case "error":
      toast.custom((t) => <ErrorToast message={message} visible={t.visible} />, defaultOptions);
      break;
    case "info":
      toast.custom((t) => <InfoToast message={message} visible={t.visible} />, defaultOptions);
      break;
    default:
      toast.custom((t) => <SuccessToast message={message} visible={t.visible} />, defaultOptions);
      break;
  }
}
