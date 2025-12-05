export enum Category {
  Episode = 'Episode',
  OVA = 'OVA',
  Uncensored = 'Uncensored',
}

export interface AnimeRelease {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  releaseDate: string; // ISO String
  category: Category;
  source: string;
  episodeNumber?: number;
  rating: number;
  tags: string[];
  trailerUrl?: string;
}

export enum ViewMode {
  Grid = 'Grid',
  List = 'List',
}

export interface FilterState {
  category: Category | 'All';
  searchQuery: string;
}