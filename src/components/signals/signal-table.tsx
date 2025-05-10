'use client';

import type { Signal, SortConfig, SortKey } from '@/lib/types';
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
import { ExternalLink, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useMemo } from 'react';

interface SignalTableProps {
  signals: Signal[];
  isLoading: boolean;
  error: Error | null;
}

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


export function SignalTable({ signals, isLoading, error }: SignalTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'time', direction: 'desc' });

  const sortedSignals = useMemo(() => {
    let sortableItems = [...signals];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key as keyof Signal];
        const valB = b[sortConfig.key as keyof Signal];

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

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-muted-foreground">Chargement des signaux...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 px-4 bg-destructive/10 border border-destructive rounded-lg">
        <p className="text-destructive font-semibold">Erreur de chargement des signaux:</p>
        <p className="text-destructive/80">{error.message}</p>
      </div>
    );
  }
  
  if (sortedSignals.length === 0) {
    return <div className="text-center py-10 px-4 bg-card border rounded-lg shadow-sm"><p className="text-muted-foreground">Aucun signal à afficher pour le moment.</p></div>;
  }

  return (
    <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader onClick={() => requestSort('ticker')} sortKey="ticker" currentSortKey={sortConfig.key} currentSortDirection={sortConfig.direction}>Crypto</SortableHeader>
            <SortableHeader onClick={() => requestSort('price')} sortKey="price" currentSortKey={sortConfig.key} currentSortDirection={sortConfig.direction}>Prix</SortableHeader>
            <SortableHeader onClick={() => requestSort('time')} sortKey="time" currentSortKey={sortConfig.key} currentSortDirection={sortConfig.direction}>Date et Heure</SortableHeader>
            <TableHead>Âge du Signal</TableHead>
            <SortableHeader onClick={() => requestSort('action')} sortKey="action" currentSortKey={sortConfig.key} currentSortDirection={sortConfig.direction}>Signal</SortableHeader>
            <TableHead>Graphique</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSignals.map((signal) => (
            <TableRow key={signal.id} data-testid={`signal-row-${signal.id}`} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium">{signal.ticker}</TableCell>
              <TableCell>${signal.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}</TableCell>
              <TableCell>{new Date(signal.time).toLocaleString('fr-FR')}</TableCell>
              <TableCell>
                <SignalAge timestamp={signal.time} />
              </TableCell>
              <TableCell>
                <Badge
                  variant={signal.action === 'buy' ? 'default' : 'destructive'}
                  className={signal.action === 'buy' ? 'bg-green-500/20 text-green-700 border-green-500/30 dark:bg-green-700/30 dark:text-green-300 dark:border-green-700/40' : 'bg-red-500/20 text-red-700 border-red-500/30 dark:bg-red-700/30 dark:text-red-300 dark:border-red-700/40'}
                >
                  {signal.action === 'buy' ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
                  {signal.action === 'buy' ? 'Achat' : 'Vente'}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`https://www.tradingview.com/chart/?symbol=${signal.ticker}`} target="_blank" rel="noopener noreferrer">
                    Voir <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
