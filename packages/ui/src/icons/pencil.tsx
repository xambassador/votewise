type Props = React.SVGProps<SVGSVGElement>;

export function Pencil(props: Props) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10.8334 5.8335L3.91916 12.7477C3.54409 13.1228 3.33337 13.6315 3.33337 14.1619V14.6668C3.33337 15.7714 4.2288 16.6668 5.33337 16.6668H5.83828C6.36871 16.6668 6.87742 16.4561 7.25249 16.081L14.1667 9.16683M10.8334 5.8335L11.9192 4.74771C12.7002 3.96666 13.9665 3.96666 14.7476 4.74771L15.2525 5.25262C16.0335 6.03366 16.0335 7.3 15.2525 8.08104L14.1667 9.16683M10.8334 5.8335L14.1667 9.16683"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
