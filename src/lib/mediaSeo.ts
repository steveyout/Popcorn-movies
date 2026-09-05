import type { MediaItem } from '@/src/types';

export type MediaRouteType = 'movie' | 'tv';

export const slugifyMediaTitle = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'untitled';

export const getMediaYear = (media: Pick<MediaItem, 'release_date' | 'first_air_date'>): string => {
  const date = media.release_date || media.first_air_date;
  return date?.slice(0, 4) || 'unknown';
};

export const getMediaSlug = (media: Pick<MediaItem, 'id' | 'title' | 'name' | 'release_date' | 'first_air_date'>): string => {
  const title = media.title || media.name || 'untitled';
  return `${slugifyMediaTitle(title)}-${getMediaYear(media)}-${media.id}`;
};

export const getMediaPath = (media: Pick<MediaItem, 'id' | 'title' | 'name' | 'release_date' | 'first_air_date' | 'media_type'>): string =>
  `/${media.media_type}/${getMediaSlug(media)}`;

export const getMediaIdFromSlug = (slug: string): number | null => {
  const match = slug.match(/-(\d+)$/);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) ? id : null;
};

export const getMediaTitle = (media: Pick<MediaItem, 'title' | 'name'>): string =>
  media.title || media.name || 'Untitled';
