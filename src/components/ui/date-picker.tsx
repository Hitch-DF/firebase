
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { fr as frLocale, enUS as enUSLocale } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder: string;
  language: 'fr' | 'en';
  'aria-label'?: string; 
}

export function DatePicker({ date, setDate, placeholder, language, 'aria-label': ariaLabel }: DatePickerProps) {
  const locale = language === 'fr' ? frLocale : enUSLocale;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal', // Changed sm:w-[280px] to w-full to fit grid
            !date && 'text-muted-foreground'
          )}
          aria-label={ariaLabel || placeholder}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP', { locale }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          locale={locale}
        />
      </PopoverContent>
    </Popover>
  );
}
