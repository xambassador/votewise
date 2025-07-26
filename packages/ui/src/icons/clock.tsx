type Props = React.SVGProps<SVGSVGElement>;

export function Clock(props: Props) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10 6.667v2.505a2 2 0 0 1-.586 1.414l-1.08 1.08M17.5 10a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
