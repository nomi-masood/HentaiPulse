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
  trailerUrl?: string; // New field for video previews
  releaseDate: string; // ISO String
  category: Category;
  source: string;
  episodeNumber?: number;
  rating: number;
  tags: string[];
}

export enum ViewMode {
  Grid = 'Grid',
  List = 'List',
}

export interface FilterState {
  category: Category | 'All';
  searchQuery: string;
}