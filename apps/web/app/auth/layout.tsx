type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  return <main className="w-screen min-h-screen">{props.children}</main>;
}
