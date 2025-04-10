const avatarCache = new Map<string, string>();

export function getModelAvatar(name: string) {
  const key = name;
  if (!avatarCache.has(key)) {
    const url = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(
      key
    )}`;
    avatarCache.set(key, url);
  }
  return avatarCache.get(key)!;
}
