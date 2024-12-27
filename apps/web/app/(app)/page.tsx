import { auth } from "@/lib/auth";
import { getFlashMessage } from "@/lib/cookie";

import { FlashMessage } from "@/components/flash";

export default function Home() {
  const flash = getFlashMessage();
  auth<true>({ redirect: true });

  return (
    <div>
      {flash && <FlashMessage title={flash.title} message={flash.message} type={flash.type} />}
      <h1>Votewise</h1>
    </div>
  );
}
