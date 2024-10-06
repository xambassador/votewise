export function SeparatorWithLabel(props: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-px bg-black-400 rounded-full" />
      <span className="text-gray-400 text-xs">{props.children}</span>
      <div className="flex-1 h-px bg-black-400 rounded-full" />
    </div>
  );
}
