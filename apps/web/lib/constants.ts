export const VOTEWISE_API = "http://localhost:5001/api";

export const getCommentsKey = (feedId: string) => ["comments", feedId];
export const getRepliesKey = (feedId: string, parentId: string) => ["replies", feedId, parentId];
