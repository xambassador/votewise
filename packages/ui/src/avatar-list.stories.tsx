import type { Meta, StoryObj } from "@storybook/react";

import { AvatarList } from "./avatar-list";

const data = [
  {
    name: "avatar1",
    url: "https://i.pinimg.com/736x/e3/24/f7/e324f790cfe0a51d76f98356475cc408.jpg",
    etag: "1",
    path: ""
  },
  {
    name: "avatar2",
    url: "https://i.pinimg.com/736x/39/6d/f5/396df568a4325fe46c4a4801e198e7ef.jpg",
    etag: "2",
    path: ""
  },
  {
    name: "avatar3",
    url: "https://assets.tiltify.com/uploads/media_type/image/203025/blob-09636982-a21a-494b-bbe4-3692c2720ae3.jpeg",
    etag: "3",
    path: ""
  },
  {
    name: "avatar4",
    url: "https://i0.wp.com/katzenworld.co.uk/wp-content/uploads/2019/06/funny-cat.jpeg?fit=1020%2C1020&ssl=1",
    etag: "4",
    path: ""
  },
  {
    name: "avatar5",
    url: "https://media.istockphoto.com/id/1128004359/photo/close-up-scottish-fold-cat-head-with-shocking-face-and-wide-open-eyes-frighten-or-surprised.jpg?s=612x612&w=0&k=20&c=HglQ8Nf1PslTuI91T-dfhkln-iEbchjqfhGKCWTbaxg=",
    etag: "5",
    path: ""
  },
  {
    name: "avatar6",
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjSKoyOjhKTNOkbuXv8zhtxMwtpt39UaMmLA&s",
    etag: "6",
    path: ""
  }
];

const meta = {
  title: "ui/AvatarList",
  component: AvatarList,
  args: {
    // eslint-disable-next-line no-console
    onSelect: (avatar) => console.log(avatar)
  },
  render: (args) => <AvatarList {...args} avatarList={data} />
} satisfies Meta<typeof AvatarList>;

export default meta;

type Story = StoryObj<typeof AvatarList>;

export const Default: Story = {};
