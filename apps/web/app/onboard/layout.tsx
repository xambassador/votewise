type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  return (
    <main className="min-h-screen w-screen">
      <div className="w-full min-h-screen grid place-items-center">{props.children}</div>
    </main>
  );
}
