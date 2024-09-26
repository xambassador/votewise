type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  return <main className="min-h-screen w-screen">{props.children}</main>;
}
