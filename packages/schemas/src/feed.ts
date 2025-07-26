import { z } from "zod";

export const ZAsset = z.object({
  url: z.string({ required_error: "url is required" }).url({ message: "url is not a valid url" }),
  type: z.enum(["image", "video", "document"], {
    errorMap: (issue, ctx) => {
      if (issue.code === "invalid_enum_value") {
        return { message: `type must be one of image, video or document` };
      }

      if (issue.code === "invalid_type" && issue.received === "undefined") {
        return { message: `type is required` };
      }

      if (issue.code === "invalid_type") {
        return { message: `type must be a string` };
      }

      return { message: issue.message || ctx.defaultError };
    }
  })
});

export const ZFeedCreate = z.object({
  title: z
    .string({ required_error: "title is required" })
    .min(1, { message: "title is required" })
    .max(50, { message: "title must be less than 50 characters" }),
  content: z
    .string({ message: "content is required" })
    .min(1, { message: "content is required" })
    .max(300, { message: "content must be less than 300 characters" }),
  status: z
    .enum(["OPEN", "CLOSED", "ARCHIVED", "INPROGRESS"], {
      errorMap: (issue, ctx) => {
        if (issue.code === "invalid_enum_value") {
          return { message: `status must be one of OPEN, CLOSED, ARCHIVED, INPROGRESS` };
        }
        return { message: issue.message || ctx.defaultError };
      }
    })
    .default("OPEN"),
  type: z
    .enum(["PUBLIC", "GROUP_ONLY"], {
      errorMap: (issue, ctx) => {
        if (issue.code === "invalid_enum_value") {
          return { message: `type must be one of PUBLIC, GROUP_ONLY` };
        }
        return { message: issue.message || ctx.defaultError };
      }
    })
    .default("PUBLIC"),
  group_id: z.string({ invalid_type_error: "group_id must be a string" }).optional(),
  assets: z.array(ZAsset, { invalid_type_error: "assets must be an array" }).optional(),
  topics: z
    .array(
      z.string({ required_error: "topic is required", invalid_type_error: "topic must be a string" }).min(1, {
        message: "topic is required"
      }),
      {
        invalid_type_error: "topics must be an array",
        required_error: "topics is required"
      }
    )
    .min(1, { message: "at least one topic is required" })
    .max(5, { message: "maximum 5 topics are allowed" })
});

export type TFeedCreate = z.infer<typeof ZFeedCreate>;
