function removeHashtags(text: string): string {
  const hashtags = text.match(/#[a-zA-Z0-9_]+/g);
  if (hashtags) {
    hashtags.forEach((hashtag) => {
      text = text.replace(hashtag, "");
    });
  }

  return text.trim();
}

/**
 * @description Extracts hashtags from a string. It is case insensitive and removes duplicates.
 * @param content String that contains hashtags
 * @returns Object with hashtags and text without hashtags
 */
export function parseHashTags(content: string) {
  return {
    hashtags: extractHashtags(content),
    text: removeHashtags(content),
  };
}

/**
 * @description Extracts hashtags from a string
 * @param text String that contains hashtags
 * @returns Array of hashtags
 */
export function extractHashtags(text: string): string[] {
  const hashtags = text.match(/#[a-zA-Z0-9_]+/g);
  return hashtags ? hashtags.map((hashtag) => hashtag.substring(1)) : [];
}
