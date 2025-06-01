import type { BucketService } from "../bucket.service";

export const mockBucketService = {
  getUrlForType: jest.fn().mockImplementation((url: string, type: "avatar" | "background") => {
    if (type === "avatar") {
      return `https://example.com/avatar/${url}`;
    }
    return `https://example.com/background/${url}`;
  })
} as unknown as jest.Mocked<BucketService>;
