// src/lib/favorites.ts

const GLOBAL_FAVORITE_TICKERS_KEY = 'globalFavoriteTickersOnlySignals'; // Changed Suffix

function getGlobalFavoriteTickers(): Set<string> {
  if (typeof window === 'undefined') {
    return new Set();
  }
  try {
    const stored = localStorage.getItem(GLOBAL_FAVORITE_TICKERS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch (error) {
    console.error("Error reading global favorite tickers from localStorage:", error);
    // Fallback to empty set or clear corrupted data
    localStorage.removeItem(GLOBAL_FAVORITE_TICKERS_KEY);
  }
  return new Set();
}

function setGlobalFavoriteTickers(tickers: Set<string>): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(GLOBAL_FAVORITE_TICKERS_KEY, JSON.stringify(Array.from(tickers)));
  } catch (error) {
    console.error("Error writing global favorite tickers to localStorage:", error);
  }
}

export function isTickerGloballyFavorited(ticker: string): boolean {
  if (!ticker) return false;
  return getGlobalFavoriteTickers().has(ticker);
}

export function addGlobalFavoriteTicker(ticker: string): void {
  if (!ticker) return;
  const tickers = getGlobalFavoriteTickers();
  tickers.add(ticker);
  setGlobalFavoriteTickers(tickers);
}

export function removeGlobalFavoriteTicker(ticker: string): void {
  if (!ticker) return;
  const tickers = getGlobalFavoriteTickers();
  tickers.delete(ticker);
  setGlobalFavoriteTickers(tickers);
}
