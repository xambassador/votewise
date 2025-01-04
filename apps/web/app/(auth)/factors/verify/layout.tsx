import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { routes } from "@/lib/routes";

import { DotBackground } from "@votewise/ui/dot-background";

import { Banner } from "../../_components/banner";

export default function Layout(props: { children: React.ReactNode }) {
  const { user } = auth<true>({ redirect: true });
  if (user.aal === user.user_aal_level) {
    return redirect(routes.app.root());
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 min-h-screen flex flex-col items-end mr-20 justify-center">{props.children}</div>
      <div className="w-full relative overflow-hidden flex-1 flex flex-col justify-center border-l border-nobelBlack-200 min-h-screen">
        <DotBackground className="flex flex-col justify-center">
          {() => <Banner title="Code, Please!" subtitle="Are you really you? Let's find out!" />}
        </DotBackground>
      </div>
    </div>
  );
}
