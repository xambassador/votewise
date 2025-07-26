type Props = React.SVGProps<SVGSVGElement>;

export function UserCross(props: Props) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M8.667 10H7.333a4 4 0 0 0-4 4m7.334-3.333 2 2m0 0 2 2m-2-2 2-2m-2 2-2 2m0-10a2.667 2.667 0 1 1-5.334 0 2.667 2.667 0 0 1 5.334 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
