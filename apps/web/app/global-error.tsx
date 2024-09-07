"use client";

type Props = {
  error: Error & { digest?: string };
  reset?: () => void;
};

const Error = (props: Props) => {
  const { error } = props;
  return <div>{error.message}</div>;
};

export default Error;
