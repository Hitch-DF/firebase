'use client';

import type { Filters } from '@/lib/types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter as FilterIcon } from 'lucide-react';

interface SignalFiltersProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters: Filters;
}

export function SignalFilters({ onFilterChange, initialFilters }: SignalFiltersProps) {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...initialFilters, searchTerm: event.target.value });
  };

  const handleActionChange = (value: 'all' | 'buy' | 'sell') => {
    onFilterChange({ ...initialFilters, action: value });
  };

  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4 p-4 border rounded-lg shadow-sm bg-card">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher par crypto (ex. BTCUSDT)"
          value={initialFilters.searchTerm}
          onChange={handleSearchChange}
          className="pl-10"
          aria-label="Rechercher par crypto"
        />
      </div>
      <div className="flex items-center gap-2">
        <FilterIcon className="h-5 w-5 text-muted-foreground" />
        <Select value={initialFilters.action} onValueChange={handleActionChange}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filtrer par type de signal">
            <SelectValue placeholder="Type de signal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les signaux</SelectItem>
            <SelectItem value="buy">Achat (Buy)</SelectItem>
            <SelectItem value="sell">Vente (Sell)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
