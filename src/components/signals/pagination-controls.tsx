
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  totalItems: number;
  language: 'fr' | 'en';
}

const translations = {
  fr: {
    itemsPerPageLabel: "Signaux par page :",
    previousPage: "Précédent",
    nextPage: "Suivant",
    pageInfo: "Page {currentPage} sur {totalPages}",
    totalItemsInfo: "{totalItems} signaux au total",
    itemsPerPagePlaceholder: "Par page",
  },
  en: {
    itemsPerPageLabel: "Signals per page:",
    previousPage: "Previous",
    nextPage: "Next",
    pageInfo: "Page {currentPage} of {totalPages}",
    totalItemsInfo: "{totalItems} total signals",
    itemsPerPagePlaceholder: "Per page",
  }
};

type TranslationKey = keyof typeof translations.fr;

const ITEMS_PER_PAGE_OPTIONS = [10, 15, 25, 50, 100];

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
  language,
}: PaginationControlsProps) {
  const t = useCallback((key: TranslationKey, replacements?: Record<string, string | number>) => {
    let text = translations[language][key] || translations.en[key];
    if (replacements) {
      Object.keys(replacements).forEach(pKey => {
        text = text.replace(`{${pKey}}`, String(replacements[pKey]));
      });
    }
    return text;
  }, [language]);

  if (totalItems === 0 &&totalPages === 0) { // if totalItems is 0, totalPages will be 0 if calculated as Math.ceil(0/X) or 1 if Math.ceil(0/X) is forced to 1. Let's ensure it's 0.
     // No items to paginate, don't show controls or show a minimal message
    return null; 
  }


  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 my-4 p-4 border rounded-lg shadow-sm bg-card">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t('itemsPerPageLabel')}</span>
        <Select
          value={String(itemsPerPage)}
          onValueChange={(value) => onItemsPerPageChange(Number(value))}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder={t('itemsPerPagePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {ITEMS_PER_PAGE_OPTIONS.map(option => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {t('pageInfo', { currentPage, totalPages: totalPages > 0 ? totalPages : 1 })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label={t('previousPage')}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">{t('previousPage')}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label={t('nextPage')}
        >
          <span className="hidden sm:inline mr-1">{t('nextPage')}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-sm text-muted-foreground">
        {t('totalItemsInfo', { totalItems })}
      </div>
    </div>
  );
}
