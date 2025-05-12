import { fetch } from "@/lib/fetch";

export class MLService {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public async getUserRecommendations(params: { user_id: string; top_n?: number }) {
    const { user_id, top_n = 5 } = params;
    const url = `${this.baseUrl}/recommend/users`;
    const result = await fetch<{ user_id: string; recommended_users: string[] }>(url, {
      method: "POST",
      body: JSON.stringify({ user_id, top_n })
    });
    return result;
  }

  public async getGroupRecommendations(params: { user_id: string; top_n?: number }) {
    const { user_id, top_n = 5 } = params;
    const url = `${this.baseUrl}/recommend/groups`;
    const result = await fetch<{ user_id: string; recommended_groups: string[] }>(url, {
      method: "POST",
      body: JSON.stringify({ user_id, top_n })
    });
    return result;
  }
}
