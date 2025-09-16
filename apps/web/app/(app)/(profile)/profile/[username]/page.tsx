import { Profile } from "../_components/profile";
import { ProfileFetcher } from "../_components/profile-fetcher";

type Props = { params: { username: string } };

export default function Page(props: Props) {
  return (
    <ProfileFetcher username={props.params.username}>
      {(profile) => <Profile profile={profile} username={props.params.username} />}
    </ProfileFetcher>
  );
}
