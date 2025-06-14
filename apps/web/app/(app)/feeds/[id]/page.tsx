import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import {
  Comment,
  CommentActions,
  CommentAuthor,
  CommentConnectorLine,
  CommentContent,
  CommentDate,
  CommentHeader,
  CommentInput,
  CommentList,
  CommentReplyButton,
  CommentReplyInput,
  Comments,
  CommentText
} from "@votewise/ui/cards/comment";
import {
  Feed,
  FeedContent,
  FeedContentTags,
  FeedContentText,
  FeedHeader,
  FeedTimeAgo,
  FeedTitle,
  FeedUserHandle,
  FeedUserName,
  Voters,
  VotersCount,
  VotersStack
} from "@votewise/ui/cards/feed";
import { ZigZagList } from "@votewise/ui/image-card";
import { VoteButton, VoteCount, VoteProvider } from "@votewise/ui/vote-button";

export default function Page() {
  return (
    <Feed className="gap-5 flex-col">
      <FeedHeader>
        <Avatar className="size-12">
          <AvatarFallback name="John doe" />
          <AvatarImage
            src="https://cdn.jsdelivr.net/gh/alohe/memojis/png/toon_8.png"
            alt="Avatar"
            className="object-cover"
          />
        </Avatar>
        <div className="flex gap-3">
          <div className="flex flex-col">
            <FeedUserName>John Doe</FeedUserName>
            <FeedUserHandle>@johndoe</FeedUserHandle>
          </div>
          <FeedTimeAgo className="pt-1">2 hours ago</FeedTimeAgo>
        </div>
      </FeedHeader>
      <FeedTitle className="pb-4 border-b border-nobelBlack-200">
        What is your favorite programming language and why?
      </FeedTitle>
      <FeedContent className="pb-7 border-b border-nobelBlack-200">
        <FeedContentText className="text-base font-normal text-gray-200">
          I&apos;ve been coding for about 3 years now and have tried several languages. Currently I&apos;m really
          enjoying TypeScript for its type safety and great ecosystem. What about you?
        </FeedContentText>
        <FeedContentTags>#programming #startups</FeedContentTags>
        <ZigZagList images={images} className="mt-4" />
      </FeedContent>

      <div className="flex flex-col gap-8 pb-4 border-b border-nobelBlack-200">
        <VoteProvider className="w-full max-w-full" count={100}>
          <VoteButton className="w-full max-w-full bg-nobelBlack-50" showCount>
            <VoteCount variant="minimal" />
          </VoteButton>
        </VoteProvider>
        <VotersStack>
          <span className="text-sm text-black-200 inline-block mr-3">Voters:</span>
          <Voters>
            {images.map((image) => (
              <Avatar className="size-8" key={image.id}>
                <AvatarFallback name="Jane Smith" />
                <AvatarImage src={image.url} alt="Avatar" className="object-cover" />
              </Avatar>
            ))}
          </Voters>
          <VotersCount>+10</VotersCount>
        </VotersStack>
      </div>

      <Comments>
        <CommentInput />
        <CommentList>
          <Comment>
            <Avatar className="size-8">
              <AvatarFallback name="John Doe" />
              <AvatarImage
                src="https://cdn.jsdelivr.net/gh/alohe/memojis/png/toon_8.png"
                alt="Avatar"
                className="object-cover"
              />
            </Avatar>
            <CommentContent>
              <CommentHeader>
                <CommentAuthor>Jane Smith</CommentAuthor>
                <CommentDate>1 hour ago</CommentDate>
              </CommentHeader>
              <CommentText>
                I love Python for its simplicity and readability. The vast ecosystem of libraries makes it perfect for
                almost any project!
              </CommentText>
              <CommentActions>
                <CommentReplyButton />
              </CommentActions>
              <CommentReplyInput />
            </CommentContent>
            <CommentConnectorLine />
          </Comment>
        </CommentList>
      </Comments>
    </Feed>
  );
}

const images = [
  {
    name: "avatar1",
    url: "https://i.pinimg.com/736x/e3/24/f7/e324f790cfe0a51d76f98356475cc408.jpg",
    etag: "1",
    path: "",
    id: "1"
  },
  {
    name: "avatar2",
    url: "https://i.pinimg.com/736x/39/6d/f5/396df568a4325fe46c4a4801e198e7ef.jpg",
    etag: "2",
    path: "",
    id: "2"
  },
  {
    name: "avatar3",
    url: "https://assets.tiltify.com/uploads/media_type/image/203025/blob-09636982-a21a-494b-bbe4-3692c2720ae3.jpeg",
    etag: "3",
    path: "",
    id: "3"
  },
  {
    name: "avatar4",
    url: "https://i0.wp.com/katzenworld.co.uk/wp-content/uploads/2019/06/funny-cat.jpeg?fit=1020%2C1020&ssl=1",
    etag: "4",
    path: "",
    id: "4"
  },
  {
    name: "avatar5",
    url: "https://media.istockphoto.com/id/1128004359/photo/close-up-scottish-fold-cat-head-with-shocking-face-and-wide-open-eyes-frighten-or-surprised.jpg?s=612x612&w=0&k=20&c=HglQ8Nf1PslTuI91T-dfhkln-iEbchjqfhGKCWTbaxg=",
    etag: "5",
    path: "",
    id: "5"
  },
  {
    name: "avatar6",
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjSKoyOjhKTNOkbuXv8zhtxMwtpt39UaMmLA&s",
    etag: "6",
    path: "",
    id: "6"
  }
];
