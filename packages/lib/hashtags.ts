function removeHashtags(text: string): string {
  const s = text.split(" ");
  const result: string[] = [];
  // To avoid duplicates and links
  s.forEach((word) => {
    if (!word.startsWith("#")) {
      result.push(word);
    }
  });
  return result.join(" ");
}

/**
 * @description Extracts hashtags from a string. It is case insensitive and removes duplicates.
 * @param content String that contains hashtags
 * @returns Object with hashtags and text without hashtags
 */
export function parseHashTags(content: string) {
  const s = content.split(" ");
  const set = new Set<string>();
  // To avoid duplicates and links
  s.forEach((word) => {
    if (word.startsWith("#")) {
      const tranformedWord = word.substring(1).toLowerCase();
      const hashtag = tranformedWord.trim();
      set.add(hashtag);
    }
  });

  return {
    hashtags: Array.from(set),
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
