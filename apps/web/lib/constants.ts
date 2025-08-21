export const getCommentsKey = (feedId: string) => ["comments", feedId];
export const getRepliesKey = (feedId: string, parentId: string) => ["replies", feedId, parentId];
export const getGroupsKey = () => ["groups"];
export const getFeedsKey = () => ["feeds"];
export const getMyGroupsKey = () => ["my-groups"];
export const getFeedKey = (id: string) => ["feed", id];
