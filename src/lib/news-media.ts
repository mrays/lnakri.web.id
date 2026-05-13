export function getYouTubeVideoId(input: string): string | null {
  if (!input) return null;

  try {
    const url = new URL(input);
    const hostname = url.hostname.replace(/^www\./, '').toLowerCase();

    if (hostname === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id || null;
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com' || hostname === 'music.youtube.com') {
      if (url.pathname === '/watch') {
        return url.searchParams.get('v');
      }

      const parts = url.pathname.split('/').filter(Boolean);
      const embedIndex = parts.indexOf('embed');
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        return parts[embedIndex + 1];
      }

      const shortsIndex = parts.indexOf('shorts');
      if (shortsIndex >= 0 && parts[shortsIndex + 1]) {
        return parts[shortsIndex + 1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function isYouTubeUrl(input: string): boolean {
  return Boolean(getYouTubeVideoId(input));
}

export function getYouTubeEmbedUrl(input: string): string | null {
  const videoId = getYouTubeVideoId(input);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

export function getYouTubeThumbnailUrl(input: string): string | null {
  const videoId = getYouTubeVideoId(input);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}

export function isLikelyImageUrl(input: string): boolean {
  if (!input) return false;
  if (isYouTubeUrl(input)) return false;

  return /^https?:\/\/.+/i.test(input) || /^\/.+/.test(input);
}
