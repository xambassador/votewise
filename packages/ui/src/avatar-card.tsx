import { ClearButton, ImageBackCards, ImageCard } from "./image-card";

type Props = React.ComponentProps<typeof ImageCard>;

export function AvatarCard(props: Props) {
  return <ImageCard {...props} />;
}

export function AvatarBackCards() {
  return <ImageBackCards />;
}

export function AvatarClearButton(props: React.ComponentProps<typeof ClearButton>) {
  return <ClearButton {...props} />;
}
