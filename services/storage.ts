import { AnimeRelease } from '../types';

const WATCHLIST_KEY = 'hentaipulse_watchlist';

export const getWatchlist = (): string[] => {
  try {
    const data = localStorage.getItem(WATCHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const toggleWatchlist = (id: string): boolean => {
  const current = getWatchlist();
  let updated: string[];
  let isAdded = false;

  if (current.includes(id)) {
    updated = current.filter((item) => item !== id);
  } else {
    updated = [...current, id];
    isAdded = true;
  }

  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
  
  // Audit Log (Simulated)
  console.log(`[Audit] Watchlist ${isAdded ? 'Add' : 'Remove'}: ${id} at ${new Date().toISOString()}`);
  
  return isAdded;
};

export const isInWatchlist = (id: string): boolean => {
  const current = getWatchlist();
  return current.includes(id);
};