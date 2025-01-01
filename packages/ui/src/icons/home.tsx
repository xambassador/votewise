type Props = React.SVGProps<SVGSVGElement>;

export function Home(props: Props) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10 17H14M18 21H6C4.34315 21 3 19.6569 3 18V12C3 11.2044 3.31607 10.4413 3.87868 9.87868L9.87868 3.87868C11.0503 2.70711 12.9497 2.70711 14.1213 3.87868L20.1213 9.87868C20.6839 10.4413 21 11.2044 21 12V18C21 19.6569 19.6569 21 18 21Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
