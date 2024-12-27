import { redirect } from "next/navigation";
import { client } from "@/lib/client.server";
import { COOKIE_KEYS, getCookie } from "@/lib/cookie";
import { routes } from "@/lib/routes";

import { obfuscateEmail } from "@votewise/text";

import { OTPForm } from "./_components/form";

type VerificationSessionResponse = { user_id: string; ttl: number; total: number; email: string };

export default async function Page() {
  const userId = getCookie(COOKIE_KEYS.userId);
  const verificationCode = getCookie(COOKIE_KEYS.verificationCode);

  if (!userId || !verificationCode) {
    return redirect(routes.auth.logout());
  }

  const verificationResponse = await client.get<VerificationSessionResponse>(`/v1/auth/verify/${verificationCode}`);

  if (!verificationResponse.success) {
    return redirect(routes.auth.logout());
  }

  if (userId !== verificationResponse.data.user_id) {
    return redirect(routes.auth.logout());
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl leading-10 text-gray-300 font-semibold mb-2">Verify your email</h1>
        <p className="text-sm text-gray-300">
          We have send an OTP to {obfuscateEmail(verificationResponse.data.email)}
        </p>
      </div>
      <OTPForm total={verificationResponse.data.total} ttl={verificationResponse.data.ttl} />
    </div>
  );
}
