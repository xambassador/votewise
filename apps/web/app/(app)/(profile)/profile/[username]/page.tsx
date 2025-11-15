import { redirect } from "next/navigation";

import { Authorized } from "@/components/auth";

import { routes } from "@/lib/routes";

import { ProfileFetcher } from "../_components/profile-fetcher";
import { Profile } from "./_components/profile";

type Props = { params: { username: string } };

export default function Page(props: Props) {
  return (
    <Authorized>
      {({ user }) => {
        if (user.user_name === props.params.username) {
          return redirect(routes.user.me());
        }
        return (
          <ProfileFetcher username={props.params.username}>
            {(profile) => <Profile profile={profile} username={props.params.username} />}
          </ProfileFetcher>
        );
      }}
    </Authorized>
  );
}
