import 'server-only';
import type { MediaItem } from '@/src/types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const FALLBACK_TMDB_KEY = 'addfba41d0cb5aba2ebaae12ac92b671';

const getApiKey = (): string => {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY?.trim();
  return key && !key.startsWith('your_') ? key : FALLBACK_TMDB_KEY;
};

export async function getServerMediaDetails(
  id: number,
  mediaType: 'movie' | 'tv',
): Promise<MediaItem | null> {
  const response = await fetch(
    `${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${encodeURIComponent(getApiKey())}&language=en-US&append_to_response=credits,videos,similar,reviews`,
    { next: { revalidate: 3600 } },
  );

  if (!response.ok) return null;

  const item = await response.json();
  const videos = item.videos?.results || [];
  const trailer = videos.find(
    (video: { site?: string; type?: string; official?: boolean }) =>
      video.site === 'YouTube' && video.type === 'Trailer' && video.official !== false,
  ) || videos.find((video: { site?: string; type?: string }) => video.site === 'YouTube' && video.type === 'Trailer');

  return {
    id: item.id,
    title: item.title || item.name,
    name: item.name || item.title,
    original_title: item.original_title,
    original_name: item.original_name,
    overview: item.overview || 'Discover more about this title.',
    poster_path: item.poster_path || null,
    backdrop_path: item.backdrop_path || null,
    vote_average: Number(item.vote_average || 0),
    vote_count: Number(item.vote_count || 0),
    release_date: item.release_date || item.first_air_date,
    first_air_date: item.first_air_date,
    media_type: mediaType,
    genre_ids: item.genres?.map((genre: { id: number }) => genre.id) || [],
    genres: item.genres,
    runtime: item.runtime || item.episode_run_time?.[0],
    number_of_seasons: item.number_of_seasons,
    number_of_episodes: item.number_of_episodes,
    tagline: item.tagline,
    status: item.status,
    trailer_key: trailer?.key,
    popularity: item.popularity,
    cast: item.credits?.cast?.slice(0, 12),
    similar: item.similar?.results?.slice(0, 6),
    reviews: item.reviews?.results?.slice(0, 5),
  };
}

export async function getServerTrendingMedia(): Promise<MediaItem[]> {
  const response = await fetch(
    `${TMDB_BASE_URL}/trending/all/week?api_key=${encodeURIComponent(getApiKey())}&language=en-US`,
    { next: { revalidate: 1800 } },
  );

  if (!response.ok) return [];

  const data = await response.json();
  return (data.results || [])
    .filter((item: { id?: number; media_type?: string; poster_path?: string; backdrop_path?: string }) =>
      item.id && (item.media_type === 'movie' || item.media_type === 'tv') && (item.poster_path || item.backdrop_path),
    )
    .slice(0, 50)
    .map((item: MediaItem) => ({
      ...item,
      media_type: item.media_type as 'movie' | 'tv',
      overview: item.overview || '',
      poster_path: item.poster_path || null,
      backdrop_path: item.backdrop_path || null,
      vote_average: Number(item.vote_average || 0),
      vote_count: Number(item.vote_count || 0),
      genre_ids: item.genre_ids || [],
    }));
}
