import React from "react";

import { classNames } from "@votewise/lib";

type SkeletonBaseProps = {
  className?: string;
};

interface SkeletonContainerProps {
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
  className?: string;
}

export const SkeletonContainer: React.FC<SkeletonContainerProps> = ({ as, children, className }) => {
  const Component = as || "div";
  return <Component className={classNames("animate-pulse", className)}>{children}</Component>;
};

export const SkeletonButton: React.FC<SkeletonBaseProps> = ({ className }) => (
  <SkeletonContainer>
    <div className={classNames(`rounded-md bg-gray-200`, className)} />
  </SkeletonContainer>
);

type SkeletonProps<T> = {
  as: keyof JSX.IntrinsicElements | React.FC;
  className?: string;
  children?: React.ReactNode;
  loading?: boolean;
  waitForTranslation?: boolean;
  loadingClassName?: string;
} & (T extends React.FC<infer P>
  ? P
  : T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T]
  : never);

export const Skeleton = <T extends keyof JSX.IntrinsicElements | React.FC>({
  as,
  className = "",
  children,
  loading = false,
  waitForTranslation = true,
  loadingClassName = "",
  ...rest
}: SkeletonProps<T>) => {
  const isLoading = !!waitForTranslation || loading;
  const Component = as;
  return (
    <Component
      className={classNames(
        isLoading
          ? classNames("font-size-0 animate-pulse rounded-md bg-gray-300 text-transparent", loadingClassName)
          : "",
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
};
