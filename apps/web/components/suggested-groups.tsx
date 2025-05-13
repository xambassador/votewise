import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import * as SuggestedGroupCard from "@votewise/ui/cards/suggested-group";
import { MoreItemsWithSummary } from "@votewise/ui/more-items";

const groups = [
  {
    id: "group_1",
    name: "Naomi’s ideas",
    description: "My room where I share ideas on something very nonsense",
    user: {
      name: "Naomi",
      handle: "@naomi",
      avatar:
        "http://minio.votewise.orb.local:9000/avatars/avatar_99.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ZVB9lMyse6x1YBz8kHQz%2F20241229%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241229T061036Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=3a3f228b7449c67f865163c3ee3f2aa0739a799ce376c78a4964b905f735dcce"
    }
  },
  {
    id: "group_2",
    name: "Justin’s ideas",
    description: "My room where I share ideas on something very nonsense",
    user: {
      name: "Justin",
      handle: "@justin",
      avatar:
        "http://minio.votewise.orb.local:9000/avatars/avatar_98.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ZVB9lMyse6x1YBz8kHQz%2F20241229%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241229T061036Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=6e436f7ce68778da49655a14552cd51ebf45ba2bb2a1ddc9e5a5de420a1a34a4"
    }
  },
  {
    id: "group_3",
    name: "Cara’s ideas",
    description: "My room where I share ideas on something very nonsense",
    user: {
      name: "Cara",
      handle: "@cara",
      avatar:
        "http://minio.votewise.orb.local:9000/avatars/avatar_97.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ZVB9lMyse6x1YBz8kHQz%2F20241229%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241229T061036Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=1852910aad229df7e70f1d5e6856b5267f000dd4e5fe2ef7dd828f067e6998e9"
    }
  }
];

export function SuggestedGroups() {
  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-nobelBlack-200">
      <span className="text-sm font-medium text-gray-300">Suggested Groups</span>
      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <SuggestedGroupCard.SuggestedGroupCard key={group.id}>
            <SuggestedGroupCard.Header>
              <div className="flex-1 flex gap-1">
                <Avatar className="rounded size-10">
                  <AvatarFallback name={group.user.name} />
                  <AvatarImage src={group.user.avatar} alt={group.user.name} />
                </Avatar>
                <div className="flex flex-col">
                  <SuggestedGroupCard.GroupName>{group.name}</SuggestedGroupCard.GroupName>
                  <SuggestedGroupCard.GroupCreatorHandle>{group.user.handle}</SuggestedGroupCard.GroupCreatorHandle>
                </div>
              </div>
              <SuggestedGroupCard.GroupJoinButton />
            </SuggestedGroupCard.Header>
            <SuggestedGroupCard.GroupDescription>{group.description}</SuggestedGroupCard.GroupDescription>
          </SuggestedGroupCard.SuggestedGroupCard>
        ))}

        <MoreItemsWithSummary
          count={groups.length}
          avatars={groups.map((group) => ({ name: group.user.name, url: group.user.avatar }))}
          avatarProps={{ className: "rounded" }}
        />
      </div>
    </div>
  );
}
