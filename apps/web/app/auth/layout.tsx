type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  return <div className="w-screen min-h-screen">{props.children}</div>;
}
