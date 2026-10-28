import { sql } from "@votewise/db";

/**
 * A post is visible when it has no group, or its group is public, or the viewer is an active member of the group.
 */
export function isPostVisibleTo(viewerId: string) {
  return sql<boolean>`(
    p.group_id IS NULL
    OR EXISTS (SELECT 1 FROM "Group" vg WHERE vg.id = p.group_id AND vg.type = 'PUBLIC')
    OR EXISTS (
      SELECT 1 FROM "GroupMember" vgm
      WHERE vgm.group_id = p.group_id AND vgm.user_id = ${viewerId} AND vgm.is_removed = false
    )
  )`;
}
