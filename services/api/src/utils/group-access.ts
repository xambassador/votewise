import type { AppContext } from "@/context";

/**
 * Blocks access to a post that belongs to a non-public group when the user is not a member of that group.
 */
export async function assertCanAccessGroupPost(
  ctx: AppContext,
  props: { groupId: string | null | undefined; userId: string; notFoundMessage: string; errorCode?: number }
) {
  const { groupId, userId, notFoundMessage, errorCode } = props;
  if (!groupId) return;

  const group = await ctx.repositories.group.findById(groupId);
  ctx.assert.resourceNotFound(!group, notFoundMessage, errorCode);
  if (group!.type === "PUBLIC") return;

  const isMember = await ctx.repositories.group.groupMember.isMember(groupId, userId);
  ctx.assert.resourceNotFound(!isMember, notFoundMessage, errorCode);
}
