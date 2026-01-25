export class BucketService {
  /**
   * @deprecated
   */
  public async getUrlForType(url: string, _type: "avatar" | "background") {
    return url;
  }

  /**
   * @deprecated
   */
  public generatePublicUrl(url: string, _type: "avatar" | "background") {
    return url;
  }
}
