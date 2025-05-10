
'use client';

import type { ReactNode } from 'react';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AiConnectionStatus } from '@/components/common/ai-connection-status';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { LanguageToggle } from '@/components/common/language-toggle';
import { Button } from '@/components/ui/button';
import { UserCircle } from 'lucide-react';
import { OnlySignalsLogo } from '@/components/common/only-signals-logo';

// Define translations for the header within this layout
const headerTranslations = {
  fr: {
    pageSubtitle: "Vos signaux de trading en temps réel",
    authButton: "Connexion / Inscription",
  },
  en: {
    pageSubtitle: "Your real-time trading signals",
    authButton: "Login / Sign Up",
  }
};

type HeaderTranslationKey = keyof typeof headerTranslations.fr;

// This Header will be used within the SidebarInset
function AppHeader({ language, onToggleLanguage }: { language: 'fr' | 'en', onToggleLanguage: () => void}) {
  const tHeader = useCallback((key: HeaderTranslationKey) => headerTranslations[language][key] || headerTranslations.fr[key], [language]);

  return (
    <header className="bg-card shadow-sm sticky top-0 z-30 border-b">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
           <SidebarTrigger className="md:hidden" /> {/* Only show on mobile for off-canvas */}
           {/* Logo can be hidden here if it's prominent in sidebar, or kept for branding consistency */}
           {/* <OnlySignalsLogo height={30} className="hidden sm:block" />  */}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <LanguageToggle currentLanguage={language} onToggleLanguage={onToggleLanguage} />
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/auth">
                <UserCircle className="mr-2 h-4 w-4" />
                {tHeader('authButton')}
              </Link>
            </Button>
          </div>
           <p className="text-xs sm:text-sm text-muted-foreground text-right">
            {tHeader('pageSubtitle')}
          </p>
          <div className="mt-1 sm:mt-0 w-full flex justify-end">
             <AiConnectionStatus language={language} />
          </div>
        </div>
      </div>
    </header>
  );
}


export default function AppLayout({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');

  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'fr' ? 'en' : 'fr');
  };

  return (
    <SidebarProvider defaultOpen={true}> {/* DefaultOpen true for desktop, mobile handled by Sheet */}
      <div className="flex min-h-screen bg-background">
        <AppSidebar language={language} />
        <SidebarInset className="flex-1 flex flex-col">
          <AppHeader language={language} onToggleLanguage={toggleLanguage} />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="text-center py-4 text-sm text-muted-foreground border-t">
            © {new Date().getFullYear()} OnlySignals. {language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
