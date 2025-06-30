type Props = React.SVGProps<SVGSVGElement>;

export function AlertTriangle(props: Props) {
  return (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.31 3.087c.95-1.727 3.43-1.727 4.38 0l5.67 10.306c1.221 2.222-.386 4.94-2.922 4.94H5.561c-2.535 0-4.142-2.718-2.92-4.94zM11.332 7.5a.833.833 0 1 0-1.666 0v3.333a.833.833 0 1 0 1.666 0zm-.833 5.833a.833.833 0 1 0 0 1.667h.008a.833.833 0 0 0 0-1.667z"
        fill="currentColor"
      />
    </svg>
  );
}
