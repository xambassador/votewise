export const getCommentsKey = (feedId: string) => ["comments", feedId];
export const getRepliesKey = (feedId: string, parentId: string) => ["replies", feedId, parentId];
export const getGroupsKey = () => ["groups"];
