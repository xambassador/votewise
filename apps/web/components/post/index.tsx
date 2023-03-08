import Link from "next/link";

import type { ReactNode } from "react";
import React from "react";

import { Avatar, Clock, MapPin, Message, Sent, Upvote } from "@votewise/ui";

function Location({
  location,
  className = "flex items-center gap-1",
}: {
  location: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <span>
        <MapPin />
      </span>
      <span>{location}</span>
    </div>
  );
}

function TimeAgo({ time, className = "flex items-center gap-1" }: { time: string; className?: string }) {
  return (
    <div className={className}>
      <span>
        <Clock />
      </span>
      <span>{time}</span>
    </div>
  );
}

function PostTitle({ className = "text-2xl font-semibold text-gray-600" }) {
  return (
    <h1 className={className}>
      <Link href="/">This is Naoimi’s Cool Idea to save environment</Link>
    </h1>
  );
}

function PostText({ className = "text-black-900 leading-6" }) {
  return (
    <p className={className}>
      The chair sat in the corner where it had been for over 25 years. The only difference was there was
      someone actually sitting in it. How long had it been since someone had done that? Ten years or more he
      imagined. Yet there was no denying the presence in the chair now.{" "}
    </p>
  );
}

function HashTags({ className = "text-blue-700" }) {
  return <p className={className}>#cool #coolidea #uiux #frontend</p>;
}

function ButtonGroup({ className = "flex gap-2", children }: { className?: string; children: ReactNode }) {
  return <div className={className}>{children}</div>;
}

export function Post() {
  return (
    <div className="flex max-w-[calc((774/16)*1rem)] flex-col gap-5 rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex">
        <Avatar src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" />
        <div className="ml-4 flex flex-col">
          <h3 className="text-black-900 text-xl font-semibold">Naomi Yoshida</h3>
          <div className="mt-2 flex gap-2 text-gray-600">
            <Location location="Japan" />
            <TimeAgo time="2 hours ago" />
          </div>
        </div>
      </div>

      <PostTitle />
      <PostText />
      <HashTags />

      <div className="flex items-center gap-7">
        <ButtonGroup>
          <button type="button">
            <Upvote />
          </button>
          <span className="text-sm text-gray-600">840</span>
        </ButtonGroup>

        <ButtonGroup>
          <button type="button">
            <Message />
          </button>
          <span className="text-sm text-gray-600">Comments</span>
        </ButtonGroup>

        <ButtonGroup>
          <button type="button">
            <Sent />
          </button>
          <span className="text-sm text-gray-600">Share</span>
        </ButtonGroup>
      </div>
    </div>
  );
}
