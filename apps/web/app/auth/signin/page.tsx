import { SignInForm } from "./_components/form";

export default function Page() {
  return (
    <div className="flex flex-col gap-7">
      <h1 className="text-lg">Account</h1>
      <SignInForm />
    </div>
  );
}
