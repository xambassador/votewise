import { OnboardForm } from "./_components/form";

export default function Page() {
  return (
    <div className="w-full min-h-screen grid place-items-center">
      <div className="max-w-[calc((500/16)*1rem)] min-w-[calc((500/16)*1rem)] flex flex-col gap-10">
        <header className="flex flex-col gap-2 text-gray-300">
          <span className="text-xl">Hello 👋, John</span>
          <h1 className="text-3xl font-medium">Tell us more about you</h1>
        </header>
        <OnboardForm />
      </div>
    </div>
  );
}
