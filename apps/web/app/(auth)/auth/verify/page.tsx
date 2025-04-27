import { redirect } from "next/navigation";

import { obfuscateEmail } from "@votewise/text";

import { getAuth } from "@/lib/client.server";
import { COOKIE_KEYS, getCookie } from "@/lib/cookie";
import { routes } from "@/lib/routes";

import { OTPForm } from "./_components/form";

export default async function Page() {
  const verificationCode = getCookie(COOKIE_KEYS.verificationCode);
  const email = getCookie(COOKIE_KEYS.email);

  if (!verificationCode || !email) {
    return redirect(routes.auth.logout());
  }

  const auth = getAuth();
  const verificationResponse = await auth.getVerificationSession(email);

  if (!verificationResponse.success) {
    return redirect(routes.auth.logout());
  }

  if (email !== verificationResponse.data.email) {
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
