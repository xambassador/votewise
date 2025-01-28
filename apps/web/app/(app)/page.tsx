import { FlashMessage } from "@/components/flash";

import { getFlashMessage } from "@/lib/cookie";

import { FeedList } from "./_components/feed-list";

export default async function Home() {
  const flash = getFlashMessage();

  return (
    <>
      {flash && <FlashMessage title={flash.title} message={flash.message} type={flash.type} />}
      <FeedList />
    </>
  );
}
