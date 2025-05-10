
'use client';

import type { Filters, FilterCategoryOption } from '@/lib/types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter as FilterIcon, Tag, Star, CalendarDays } from 'lucide-react';
import { useCallback } from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SignalFiltersProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters: Filters;
  language: 'fr' | 'en';
}

const translations = {
  fr: {
    searchPlaceholder: "Rechercher par crypto/paire (ex. BTCUSDT)",
    searchLabel: "Rechercher par ticker",
    signalTypePlaceholder: "Type de signal",
    filterBySignalTypeLabel: "Filtrer par type de signal",
    allSignals: "Tous les signaux",
    buySignals: "Achat (Buy)",
    sellSignals: "Vente (Sell)",
    categoryPlaceholder: "Catégorie",
    filterByCategoryLabel: "Filtrer par catégorie",
    allCategories: "Toutes catégories",
    watchlist: "Watchlist",
    crypto: "Crypto",
    forex: "Forex",
    commodities: "Matières premières",
    dateFilterLabel: "Filtrer par date",
    datePickerPlaceholder: "Sélectionner une date",
    clearDateFilter: "Effacer la date",
  },
  en: {
    searchPlaceholder: "Search by crypto/pair (e.g. BTCUSDT)",
    searchLabel: "Search by ticker",
    signalTypePlaceholder: "Signal type",
    filterBySignalTypeLabel: "Filter by signal type",
    allSignals: "All signals",
    buySignals: "Buy",
    sellSignals: "Sell",
    categoryPlaceholder: "Category",
    filterByCategoryLabel: "Filter by category",
    allCategories: "All categories",
    watchlist: "Watchlist",
    crypto: "Crypto",
    forex: "Forex",
    commodities: "Commodities",
    dateFilterLabel: "Filter by date",
    datePickerPlaceholder: "Select a date",
    clearDateFilter: "Clear date",
  }
};

type TranslationKey = keyof typeof translations.fr;

export function SignalFilters({ onFilterChange, initialFilters, language }: SignalFiltersProps) {
  const t = useCallback((key: TranslationKey) => translations[language][key] || translations.fr[key], [language]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...initialFilters, searchTerm: event.target.value });
  };

  const handleActionChange = (value: 'all' | 'buy' | 'sell') => {
    onFilterChange({ ...initialFilters, action: value });
  };

  const handleCategoryChange = (value: FilterCategoryOption) => {
    onFilterChange({ ...initialFilters, category: value });
  };

  const handleDateChange = (date: Date | undefined) => {
    onFilterChange({ ...initialFilters, selectedDate: date });
  };

  const clearDate = () => {
    onFilterChange({ ...initialFilters, selectedDate: undefined });
  };

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg shadow-sm bg-card">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={initialFilters.searchTerm}
          onChange={handleSearchChange}
          className="pl-10"
          aria-label={t('searchLabel')}
        />
      </div>
      <div className="flex items-center gap-2">
        <FilterIcon className="h-5 w-5 text-muted-foreground" />
        <Select value={initialFilters.action} onValueChange={handleActionChange}>
          <SelectTrigger className="w-full" aria-label={t('filterBySignalTypeLabel')}>
            <SelectValue placeholder={t('signalTypePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allSignals')}</SelectItem>
            <SelectItem value="buy">{t('buySignals')}</SelectItem>
            <SelectItem value="sell">{t('sellSignals')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Tag className="h-5 w-5 text-muted-foreground" />
        <Select value={initialFilters.category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full" aria-label={t('filterByCategoryLabel')}>
            <SelectValue placeholder={t('categoryPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allCategories')}</SelectItem>
            <SelectItem value="watchlist">
                <div className="flex items-center">
                    <Star className="mr-2 h-4 w-4 text-yellow-400 fill-yellow-400" /> {t('watchlist')}
                </div>
            </SelectItem>
            <SelectItem value="crypto">{t('crypto')}</SelectItem>
            <SelectItem value="forex">{t('forex')}</SelectItem>
            <SelectItem value="commodities">{t('commodities')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-muted-foreground" />
        <div className="flex-grow">
          <DatePicker
            date={initialFilters.selectedDate}
            setDate={handleDateChange}
            placeholder={t('datePickerPlaceholder')}
            language={language}
            aria-label={t('dateFilterLabel')}
          />
        </div>
        {initialFilters.selectedDate && (
          <Button variant="ghost" size="icon" onClick={clearDate} aria-label={t('clearDateFilter')} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
