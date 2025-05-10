
'use client';

import type { Signal, SortConfig, SortKey, SignalCategory } from '@/lib/types';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SignalAge } from './signal-age';
import Link from 'next/link';
import { ExternalLink, ArrowUpDown, TrendingUp, TrendingDown, Tag, Star } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { PaginationControls } from './pagination-controls'; // Added import

interface SignalTableProps {
  signals: Signal[];
  isLoading: boolean;
  error: Error | null;
  onToggleFavorite: (signalId: string) => void;
  language: 'fr' | 'en';
  loadingText: string;
  noSignalsText: string;
  errorLoadingText: string;
  isHistoryView?: boolean;
  // Pagination props
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

const translations = {
  fr: {
    favHeader: "Fav.",
    assetHeader: "Actif",
    priceHeader: "Prix",
    dateTimeHeader: "Date et Heure",
    ageHeader: "Âge du Signal",
    signalHeader: "Signal",
    categoryHeader: "Catégorie",
    chartHeader: "Graphique",
    buyAction: "Achat",
    sellAction: "Vente",
    viewChartButton: "Voir",
    categoryCrypto: "Crypto",
    categoryForex: "Forex",
    categoryCommodities: "Matières Prem.",
    removeFromWatchlist: "Retirer de la watchlist globale",
    addToWatchlist: "Ajouter à la watchlist globale",
  },
  en: {
    favHeader: "Fav.",
    assetHeader: "Asset",
    priceHeader: "Price",
    dateTimeHeader: "Date & Time",
    ageHeader: "Signal Age",
    signalHeader: "Signal",
    categoryHeader: "Category",
    chartHeader: "Chart",
    buyAction: "Buy",
    sellAction: "Sell",
    viewChartButton: "View",
    categoryCrypto: "Crypto",
    categoryForex: "Forex",
    categoryCommodities: "Commodities",
    removeFromWatchlist: "Remove from global watchlist",
    addToWatchlist: "Add to global watchlist",
  }
};

type TranslationKey = keyof typeof translations.fr;

const SortableHeader = ({
  children,
  onClick,
  sortKey,
  currentSortKey,
  currentSortDirection,
}: {
  children: React.ReactNode;
  onClick: () => void;
  sortKey: SortKey;
  currentSortKey: SortKey;
  currentSortDirection: string;
}) => (
  <TableHead onClick={onClick} className="cursor-pointer hover:bg-muted/50 transition-colors">
    <div className="flex items-center gap-2">
      {children}
      {currentSortKey === sortKey && (currentSortDirection === 'asc' ? '▲' : '▼')}
      {currentSortKey !== sortKey && <ArrowUpDown className="h-4 w-4 opacity-50" />}
    </div>
  </TableHead>
);


export function SignalTable({ 
  signals, 
  isLoading, 
  error, 
  onToggleFavorite, 
  language,
  loadingText,
  noSignalsText,
  errorLoadingText,
  isHistoryView = false, 
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: SignalTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'time', direction: 'desc' });
  
  const t = useCallback((key: TranslationKey) => translations[language][key] || translations.fr[key], [language]);

  const categoryDisplay: Record<SignalCategory, string> = {
    crypto: t('categoryCrypto'),
    forex: t('categoryForex'),
    commodities: t('categoryCommodities'),
  };

  const sortedSignals = useMemo(() => {
    let sortableItems = [...signals]; // Use the full signals list passed from parent
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === 'isFavorite') {
            const valA = a.isFavorite ? 1 : 0;
            const valB = b.isFavorite ? 1 : 0;
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return new Date(b.time).getTime() - new Date(a.time).getTime();
        }

        const valA = a[sortConfig.key as keyof Omit<Signal, 'isFavorite'>];
        const valB = b[sortConfig.key as keyof Omit<Signal, 'isFavorite'>];

        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [signals, sortConfig]);

  const paginatedSignals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedSignals.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedSignals, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    onPageChange(1); // Reset to first page on sort
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-muted-foreground">{loadingText}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 px-4 bg-destructive/10 border border-destructive rounded-lg">
        <p className="text-destructive font-semibold">{errorLoadingText}</p>
        <p className="text-destructive/80">{error.message}</p>
      </div>
    );
  }
  
  if (totalItems === 0) { // Check totalItems instead of sortedSignals.length for pagination
    return <div className="text-center py-10 px-4 bg-card border rounded-lg shadow-sm"><p className="text-muted-foreground">{noSignalsText}</p></div>;
  }

  return (
    <>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages > 0 ? totalPages : 1}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(newSize) => {
          onItemsPerPageChange(newSize);
          onPageChange(1); // Reset to first page
        }}
        totalItems={totalItems}
        language={language}
      />
      <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader onClick={() => requestSort('isFavorite')} sortKey="isFavorite" currentSortKey={sortConfig.key} currentSortDirection={sortConfig.direction}>{t('favHeader')}</SortableHeader>
              <SortableHeader onClick={() => requestSort('ticker')} sortKey="ticker" currentSortKey={sortConfig.key} currentSortDirection={sortConfig.direction}>{t('assetHeader')}</SortableHeader>
              <SortableHeader onClick={() => requestSort('price')} sortKey="price" currentSortKey={sortConfig.key} currentSortDirection={sortConfig.direction}>{t('priceHeader')}</SortableHeader>
              <SortableHeader onClick={() => requestSort('time')} sortKey="time" currentSortKey={sortConfig.key} currentSortDirection={sortConfig.direction}>{t('dateTimeHeader')}</SortableHeader>
              {!isHistoryView && <TableHead>{t('ageHeader')}</TableHead>}
              <SortableHeader onClick={() => requestSort('action')} sortKey="action" currentSortKey={sortConfig.key} currentSortDirection={sortConfig.direction}>{t('signalHeader')}</SortableHeader>
              <SortableHeader onClick={() => requestSort('category')} sortKey="category" currentSortKey={sortConfig.key} currentSortDirection={sortConfig.direction}>{t('categoryHeader')}</SortableHeader>
              {!isHistoryView && <TableHead>{t('chartHeader')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSignals.map((signal) => (
              <TableRow key={signal.id} data-testid={`signal-row-${signal.id}`} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  <Star
                    className={cn(
                      "h-5 w-5 cursor-pointer transition-all duration-150 ease-in-out",
                      signal.isFavorite 
                        ? "fill-yellow-400 text-yellow-500 scale-110" 
                        : "text-muted-foreground hover:text-yellow-400 hover:scale-110"
                    )}
                    onClick={() => onToggleFavorite(signal.id)}
                    aria-label={signal.isFavorite ? t('removeFromWatchlist') : t('addToWatchlist')}
                  />
                </TableCell>
                <TableCell className="font-medium">{signal.ticker}</TableCell>
                <TableCell>${signal.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}</TableCell>
                <TableCell>{new Date(signal.time).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}</TableCell>
                {!isHistoryView && (
                  <TableCell>
                    <SignalAge timestamp={signal.time} language={language} />
                  </TableCell>
                )}
                <TableCell>
                  <Badge
                    variant={signal.action === 'buy' ? 'default' : 'destructive'}
                    className={cn(
                      "font-semibold",
                      signal.action === 'buy' ? 'bg-green-500/20 text-green-700 border-green-500/30 dark:bg-green-700/30 dark:text-green-300 dark:border-green-700/40' 
                                            : 'bg-red-500/20 text-red-700 border-red-500/30 dark:bg-red-700/30 dark:text-red-300 dark:border-red-700/40'
                    )}
                  >
                    {signal.action === 'buy' ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
                    {signal.action === 'buy' ? t('buyAction') : t('sellAction')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {categoryDisplay[signal.category] || signal.category}
                  </Badge>
                </TableCell>
                {!isHistoryView && (
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`https://www.tradingview.com/chart/?symbol=${signal.ticker}`} target="_blank" rel="noopener noreferrer">
                        {t('viewChartButton')} <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      { totalItems > 0 && ( // Only show bottom pagination if there are items
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages > 0 ? totalPages : 1}
          onPageChange={onPageChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(newSize) => {
            onItemsPerPageChange(newSize);
            onPageChange(1); // Reset to first page
          }}
          totalItems={totalItems}
          language={language}
        />
      )}
    </>
  );
}
