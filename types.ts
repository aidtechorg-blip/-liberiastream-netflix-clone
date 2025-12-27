
export type ContentRating = 'G' | 'PG' | 'PG-13' | 'R';

export interface Episode {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  videoUrl: string;
  episodeNumber: number;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  banner: string;
  category: string;
  rating: ContentRating;
  year: number;
  duration: string;
  isNew?: boolean;
  isFeatured?: boolean;
  match?: number;
  type: 'movie' | 'series' | 'music-video';
  videoUrl?: string;
  episodes?: number;
  episodeData?: Episode[];
  currentEpisode?: number;
  cast?: string;
  director?: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  maxRating: ContentRating;
  watchlist: string[]; // Movie IDs
  history: string[];   // Movie IDs
}

export interface Download {
  movieId: string;
  downloadedAt: number;
  expiryAt: number;
}

export interface Category {
  id: string;
  title: string;
  movies: Movie[];
}
