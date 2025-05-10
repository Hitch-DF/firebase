
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { OnlySignalsLogo } from '@/components/common/only-signals-logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, History, Users, MessageSquare, ExternalLink, Settings2 } from 'lucide-react';
import { SidebarUserProfile } from './sidebar-user-profile';
import { cn } from '@/lib/utils';

// Define translations
const translations = {
  fr: {
    version: "v1.0",
    onlySignalsAI: "OnlySignals AI",
    signalHistory: "Historique Signaux",
    communitySignal: "Signaux Communauté",
    soon: "Bientôt",
    problemIdea: "Un problème ou une idée pour améliorer notre platforme ?",
    contactMe: "Contactez-moi",
    lastUpdate: "Dernière MàJ : 07.05.25", // Example date
    settings: "Paramètres"
  },
  en: {
    version: "v1.0",
    onlySignalsAI: "OnlySignals AI",
    signalHistory: "Signal History",
    communitySignal: "Community Signals",
    soon: "Soon",
    problemIdea: "A problem or an idea to improve our platform?",
    contactMe: "Contact me",
    lastUpdate: "Last Update: 05/07/25", // Example date (MM/DD/YY)
    settings: "Settings"
  }
};

interface AppSidebarProps {
  language: 'fr' | 'en';
}

export function AppSidebar({ language }: AppSidebarProps) {
  const pathname = usePathname();
  const t = (key: keyof typeof translations.fr) => translations[language][key] || translations.en[key];

  const menuItems = [
    { href: '/', label: t('onlySignalsAI'), icon: BarChart3, activePath: /^\/$/ }, // Matches exactly "/"
    { href: '/history', label: t('signalHistory'), icon: History, activePath: /^\/history(\/.*)?$/ }, // Matches "/history" or "/history/..."
    { href: '#', label: t('communitySignal'), icon: Users, soon: true, activePath: /^\/community(\/.*)?$/ }, // Placeholder
  ];

  // Convert French mobile number to international format for WhatsApp link
  const whatsappNumber = "33659778228"; // Assuming +33 country code for France

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-1">
          <OnlySignalsLogo height={32} />
          {/* Removed text "OnlySignals" */}
        </div>
        <span className="text-xs text-sidebar-foreground/70">{t('version')}</span>
      </SidebarHeader>

      <SidebarContent className="p-2 flex flex-col justify-between">
        <div>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={item.activePath.test(pathname)}
                  className={cn(
                    item.activePath.test(pathname) && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground",
                    "justify-start" 
                  )}
                  tooltip={{ content: item.label, side: 'right', align: 'center' }}
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    {item.soon && (
                      <Badge variant="default" className="ml-auto bg-green-500 text-white group-data-[collapsible=icon]:hidden">
                        {t('soon')}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        
          <SidebarSeparator className="my-4" />

          <div className="px-2 space-y-3 group-data-[collapsible=icon]:hidden">
            <p className="text-xs text-sidebar-foreground/70">
              {t('problemIdea')}
            </p>
            <Button 
              variant="outline" 
              className="w-full justify-start text-sidebar-foreground bg-sidebar-accent/10 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-sidebar-accent/50"
              asChild
            >
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-2 h-4 w-4" />
                {t('contactMe')}
                <ExternalLink className="ml-auto h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-auto group-data-[collapsible=icon]:hidden">
           <SidebarSeparator className="my-4" />
            <p className="text-xs text-center text-sidebar-foreground/70 px-2">
              {t('lastUpdate')}
            </p>
        </div>

      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <SidebarUserProfile language={language} />
      </SidebarFooter>
    </Sidebar>
  );
}
