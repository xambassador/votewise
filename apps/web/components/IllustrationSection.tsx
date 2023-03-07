import Image from "next/image";

import React from "react";

export function IllustrationSection() {
  return (
    <div className="relative flex h-full flex-1 flex-col bg-blue-800 pt-11">
      <figure className="mx-auto h-fit w-fit">
        <Image src="/space.svg" alt="Space" width={420} height={386} />
      </figure>
      <div className="mx-auto mt-14 max-w-[calc((545/16)*1rem)] text-center">
        <h3 className="mb-5 text-3xl font-bold text-blue-50">Join the idea exchange</h3>
        <p className="text-base leading-6">
          Welcome to our idea sharing app! Join our community of innovators, share your ideas, get feedback,
          and connect with like-minded individuals. Sign up today and bring your vision to life!
        </p>
      </div>
      <div className="mt-auto flex items-end justify-between">
        <figure className="h-fit w-fit">
          <Image src="/palm-tree.svg" alt="Illustration" width={240} height={300} />
        </figure>
        <figure className="h-fit w-fit">
          <Image src="/palm-trees.svg" alt="Illustration" width={320} height={450} />
        </figure>
      </div>
    </div>
  );
}
