type Props = React.SVGProps<SVGSVGElement>;

export function Logout(props: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m16 17 5-5-5-5m5 5H9m0 9H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
      />
    </svg>
  );
}
