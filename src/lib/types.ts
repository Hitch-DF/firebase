export type SignalCategory = 'crypto' | 'forex' | 'commodities';

export interface Signal {
  id: string;
  ticker: string; // e.g., BTCUSDT, EURUSD, XAUUSD
  price: number; // Price at the time of signal
  time: string; // ISO 8601 timestamp string
  action: 'buy' | 'sell';
  category: SignalCategory;
}

export interface Filters {
  searchTerm: string;
  action: 'all' | 'buy' | 'sell';
  category: 'all' | SignalCategory;
}

export type SortKey = keyof Signal | '';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}
