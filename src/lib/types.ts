export interface Signal {
  id: string;
  ticker: string; // e.g., BTCUSDT
  price: number; // Price at the time of signal
  time: string; // ISO 8601 timestamp string
  action: 'buy' | 'sell';
}

export interface Filters {
  searchTerm: string;
  action: 'all' | 'buy' | 'sell';
}

export type SortKey = keyof Signal | '';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}
