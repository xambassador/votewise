import type { PostStatus } from "@votewise/types";

export const parsePostStatus = (
  status: PostStatus
): "primary" | "secondary" | "success" | "danger" | "warning" | "info" => {
  switch (status) {
    case "OPEN":
      return "success";
    case "ARCHIVED":
      return "warning";
    case "CLOSED":
      return "danger";
    case "INPROGRESS":
      return "success";
    default:
      return "primary";
  }
};
