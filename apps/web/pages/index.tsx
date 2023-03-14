import type { GetServerSidePropsContext } from "next";
import Link from "next/link";

import React from "react";

import { FiMessageCircle as Message, FiSend as Sent, FiThumbsUp as Upvote } from "@votewise/ui/icons";

import {
  ButtonGroup,
  Layout,
  Post,
  PostFooter,
  PostGallary,
  PostHashTags,
  PostText,
  PostTitle,
  PostUserPill,
} from "components";

import { getServerSession } from "server/lib/getServerSession";

const imgs = [
  { src: "https://images.unsplash.com/photo-1677869274156-d3da0d0addb5" },
  { src: "https://images.unsplash.com/photo-1672745256937-4e60a4534413" },
  { src: "https://images.unsplash.com/photo-1666627830631-4e3d18bb9f73" },
  { src: "https://images.unsplash.com/photo-1677432658720-3d84f9d657b4" },
];

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <Post>
          <PostUserPill
            avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
            location="Japan"
            timeAgo="2 hours ago"
            userName="Naomi Yoshida"
          />
          <PostTitle>
            <Link href="/">This is Naoimi’s Cool Idea to save environment</Link>
          </PostTitle>
          <PostText>
            The chair sat in the corner where it had been for over 25 years. The only difference was there was
            someone actually sitting in it. How long had it been since someone had done that? Ten years or
            more he imagined. Yet there was no denying the presence in the chair now.
          </PostText>
          <PostHashTags>#cool #coolidea #uiux #frontend</PostHashTags>
          <PostFooter>
            <ButtonGroup>
              <span>
                <Upvote />
              </span>
              <span className="text-sm text-gray-600">802</span>
            </ButtonGroup>
            <ButtonGroup>
              <span>
                <Message />
              </span>
              <span className="text-sm text-gray-600">38 Comments</span>
            </ButtonGroup>
            <ButtonGroup>
              <span>
                <Sent />
              </span>
              <span className="text-sm text-gray-600">Share</span>
            </ButtonGroup>
          </PostFooter>
        </Post>

        <Post>
          <PostUserPill
            avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
            location="Japan"
            timeAgo="2 hours ago"
            userName="Naomi Yoshida"
          />
          <PostTitle>
            <Link href="/">This is Naoimi’s Cool Idea to save environment</Link>
          </PostTitle>
          <PostGallary images={imgs} />
          <PostText>
            The chair sat in the corner where it had been for over 25 years. The only difference was there was
            someone actually sitting in it. How long had it been since someone had done that? Ten years or
            more he imagined. Yet there was no denying the presence in the chair now.
          </PostText>
          <PostHashTags>#cool #coolidea #uiux #frontend</PostHashTags>
          <PostFooter>
            <ButtonGroup>
              <span>
                <Upvote />
              </span>
              <span className="text-sm text-gray-600">802</span>
            </ButtonGroup>
            <ButtonGroup>
              <span>
                <Message />
              </span>
              <span className="text-sm text-gray-600">38 Comments</span>
            </ButtonGroup>
            <ButtonGroup>
              <span>
                <Sent />
              </span>
              <span className="text-sm text-gray-600">Share</span>
            </ButtonGroup>
          </PostFooter>
        </Post>
      </div>
    </Layout>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { req, res } = context;

  const session = await getServerSession({ req, res });

  if (!session) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
