type Props = React.SVGProps<SVGSVGElement>;

export function ChevronUpTiny(props: Props) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M16 13.3334L12.6402 10.5335C12.2693 10.2245 11.7307 10.2245 11.3598 10.5335L8 13.3334"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
