type Props = React.SVGProps<SVGSVGElement>;

export function UserMinus(props: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M13 15h-2a6 6 0 0 0-6 6m16-2h-4M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
      />
    </svg>
  );
}
