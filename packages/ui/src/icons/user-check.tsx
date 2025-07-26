type Props = React.SVGProps<SVGSVGElement>;

export function UserCheck(props: Props) {
  return (
    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M8.667 10H7.333a4 4 0 0 0-4 4M10 12.667l1.528 1.528c.26.26.683.26.943 0l2.862-2.862m-4.666-6.666a2.667 2.667 0 1 1-5.334 0 2.667 2.667 0 0 1 5.334 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
