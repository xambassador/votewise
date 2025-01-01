import { FlashMessage } from "@/components/flash";

import { auth } from "@/lib/auth";
import { getFlashMessage } from "@/lib/cookie";

import { FeedList } from "./_components/feed-list";

export default function Home() {
  const flash = getFlashMessage();
  auth<true>({ redirect: true });

  return (
    <>
      {flash && <FlashMessage title={flash.title} message={flash.message} type={flash.type} />}
      <FeedList />
    </>
  );
}
