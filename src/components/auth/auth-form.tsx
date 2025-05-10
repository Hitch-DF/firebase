
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn, UserPlus, Loader2, Phone } from 'lucide-react'; // Added Phone icon

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }), // Updated to EN
  password: z.string().min(1, { message: "Password is required." }), // Min 1 for demo, Updated to EN
});

const signupSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }), // Updated to EN
  email: z.string().email({ message: "Invalid email address." }), // Updated to EN
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format (e.g., +1234567890)." }), // Added phone number, Updated to EN
  password: z.string().min(6, { message: "Password must be at least 6 characters." }), // Updated to EN
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

// Translations for form (can be moved to a separate file if larger)
const formTranslations = {
  fr: {
    welcome: "Bienvenue !",
    joinUs: "Rejoignez-nous !",
    loginToAccess: "Connectez-vous pour accéder à vos signaux.",
    createAccountToStart: "Créez un compte pour commencer à utiliser SignalStream.",
    loginTab: "Se connecter",
    signupTab: "S'inscrire",
    emailLabel: "Adresse e-mail",
    emailPlaceholder: "exemple@domaine.com",
    passwordLabel: "Mot de passe",
    passwordPlaceholder: "••••••••",
    hidePassword: "Cacher le mot de passe",
    showPassword: "Montrer le mot de passe",
    loginButton: "Se connecter",
    loggingInButton: "Connexion...",
    usernameLabel: "Nom d'utilisateur",
    usernamePlaceholder: "VotrePseudo123",
    phoneNumberLabel: "Numéro de téléphone",
    phoneNumberPlaceholder: "+33612345678",
    createAccountButton: "Créer un compte",
    creatingAccountButton: "Création...",
    noAccount: "Pas encore de compte ?",
    alreadyAccount: "Déjà un compte ?",
    loginSuccessTitle: "Connexion (Simulation)",
    loginSuccessDescription: (email: string) => `Vous êtes connecté en tant que ${email}.`,
    signupSuccessTitle: "Inscription (Simulation)",
    signupSuccessDescription: (username: string, email: string, phoneNumber: string) => `Compte créé pour ${username} avec l'e-mail ${email} et le téléphone ${phoneNumber}.`,
  },
  en: {
    welcome: "Welcome!",
    joinUs: "Join Us!",
    loginToAccess: "Log in to access your signals.",
    createAccountToStart: "Create an account to start using SignalStream.",
    loginTab: "Login",
    signupTab: "Sign Up",
    emailLabel: "Email address",
    emailPlaceholder: "example@domain.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    hidePassword: "Hide password",
    showPassword: "Show password",
    loginButton: "Login",
    loggingInButton: "Logging in...",
    usernameLabel: "Username",
    usernamePlaceholder: "YourUsername123",
    phoneNumberLabel: "Phone number",
    phoneNumberPlaceholder: "+1234567890",
    createAccountButton: "Create account",
    creatingAccountButton: "Creating account...",
    noAccount: "Don't have an account yet?",
    alreadyAccount: "Already have an account?",
    loginSuccessTitle: "Login (Simulation)",
    loginSuccessDescription: (email: string) => `You are logged in as ${email}.`,
    signupSuccessTitle: "Signup (Simulation)",
    signupSuccessDescription: (username: string, email: string, phoneNumber: string) => `Account created for ${username} with email ${email} and phone ${phoneNumber}.`,
  }
};

// TODO: Integrate with LanguageContext if needed, for now using a fixed 'en' or 'fr'
const currentLanguage = 'fr'; // Or 'en', or dynamically set
const t = (key: keyof typeof formTranslations.fr, ...args: any[]) => {
    const translationFunction = formTranslations[currentLanguage][key] || formTranslations.en[key];
    return typeof translationFunction === 'function' ? translationFunction(...args) : translationFunction;
};


export function AuthForm() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      phoneNumber: '',
      password: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Login data:', data);
    toast({
      title: t('loginSuccessTitle'),
      description: t('loginSuccessDescription', data.email),
    });
    loginForm.reset();
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Signup data:', data);
    toast({
      title: t('signupSuccessTitle'),
      description: t('signupSuccessDescription', data.username, data.email, data.phoneNumber),
    });
    signupForm.reset();
  };
  
  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <Card className="w-full max-w-md shadow-xl rounded-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">
          {activeTab === 'login' ? t('welcome') : t('joinUs')}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {activeTab === 'login'
            ? t('loginToAccess')
            : t('createAccountToStart')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="py-2.5">
              <LogIn className="mr-2 h-4 w-4" /> {t('loginTab')}
            </TabsTrigger>
            <TabsTrigger value="signup" className="py-2.5">
              <UserPlus className="mr-2 h-4 w-4" /> {t('signupTab')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('emailLabel')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t('emailPlaceholder')} {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('passwordLabel')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} placeholder={t('passwordPlaceholder')} {...field} className="h-11 pr-10" />
                           <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={toggleShowPassword}
                            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loginForm.formState.isSubmitting}>
                  {loginForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loginForm.formState.isSubmitting ? t('loggingInButton') : t('loginButton')}
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="signup">
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
                <FormField
                  control={signupForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('usernameLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('usernamePlaceholder')} {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('emailLabel')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t('emailPlaceholder')} {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phoneNumberLabel')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input type="tel" placeholder={t('phoneNumberPlaceholder')} {...field} className="h-11 pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('passwordLabel')}</FormLabel>
                      <FormControl>
                         <div className="relative">
                          <Input type={showPassword ? "text" : "password"} placeholder={t('passwordPlaceholder')} {...field} className="h-11 pr-10" />
                           <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={toggleShowPassword}
                            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={signupForm.formState.isSubmitting}>
                  {signupForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {signupForm.formState.isSubmitting ? t('creatingAccountButton') : t('createAccountButton')}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {activeTab === 'login' ? (
            <>
              {t('noAccount')}{' '}
              <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => setActiveTab('signup')}>
                {t('signupTab')}
              </Button>
            </>
          ) : (
            <>
              {t('alreadyAccount')}{' '}
              <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => setActiveTab('login')}>
                {t('loginTab')}
              </Button>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
