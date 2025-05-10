
'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define translations
const translations = {
  fr: {
    userName: "Nom de L'utilisateur",
    myAccount: "Mon compte",
    logout: "Déconnexion",
    logoutSuccess: "Déconnexion réussie",
    logoutDescription: "Vous avez été déconnecté.",
  },
  en: {
    userName: "User Name",
    myAccount: "My account",
    logout: "Logout",
    logoutSuccess: "Logout Successful",
    logoutDescription: "You have been logged out.",
  }
};

interface SidebarUserProfileProps {
  language: 'fr' | 'en';
}


export function SidebarUserProfile({ language }: SidebarUserProfileProps) {
  const { toast } = useToast();
  const t = (key: keyof typeof translations.fr) => translations[language][key] || translations.en[key];

  const handleLogout = () => {
    // Simulate logout
    toast({
      title: t('logoutSuccess'),
      description: t('logoutDescription'),
    });
    // In a real app, you would redirect to login or home page
    // router.push('/auth/login');
  };

  return (
    <div className="flex flex-col items-start p-4 bg-muted/20 rounded-lg">
      <div className="flex items-center gap-3 mb-3 w-full">
        <Avatar className="h-10 w-10 border-2 border-sidebar-primary">
          <AvatarImage src="https://picsum.photos/id/237/200/200" alt={t('userName')} data-ai-hint="profile avatar" />
          <AvatarFallback>
            <UserCircle className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">{t('userName')}</span>
          <Link href="/auth" legacyBehavior>
            <a className="text-xs text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:underline">
              {t('myAccount')}
            </a>
          </Link>
        </div>
      </div>
      <Button 
        variant="default" 
        size="sm" 
        className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {t('logout')}
      </Button>
    </div>
  );
}
