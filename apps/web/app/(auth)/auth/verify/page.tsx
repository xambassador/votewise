import { redirect } from "next/navigation";

import { obfuscateEmail } from "@votewise/text";

import { getAuthClient } from "@/lib/client.server";
import { COOKIE_KEYS, getCookie } from "@/lib/cookie";
import { routes } from "@/lib/routes";

import { OTPForm } from "./_components/form";

export default async function Page() {
  const verificationCode = getCookie(COOKIE_KEYS.verificationCode);
  const email = getCookie(COOKIE_KEYS.email);

  if (!verificationCode || !email) {
    return redirect(routes.auth.logout());
  }

  const auth = getAuthClient();
  const verificationResponse = await auth.getVerificationSession(email);

  if (!verificationResponse.success) {
    return redirect(routes.auth.logout());
  }

  if (email !== verificationResponse.data.email) {
    return redirect(routes.auth.logout());
  }

  return (
    <div className="flex flex-col gap-10 w-full max-w-[calc((450/16)*1rem)] sm:w-fit px-6 sm:px-0">
      <div>
        <h1 className="md:text-3xl text-xl md:leading-10 text-gray-300 font-semibold mb-2">Verify your email</h1>
        <p className="text-sm text-gray-300">
          We have send an OTP to {obfuscateEmail(verificationResponse.data.email)}
        </p>
      </div>
      <OTPForm total={verificationResponse.data.total} ttl={verificationResponse.data.ttl} />
    </div>
  );
}
