
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { Mail, Lock } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const { t } = useTranslations();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const formSchema = z.object({
    email: z.string().email({ message: t('auth.invalidEmail') }).min(1, { message: t('auth.fieldRequired')}),
    password: z.string().min(6, { message: t('auth.passwordMinLength') }).min(1, { message: t('auth.fieldRequired')}),
  });

  type LoginFormValues = z.infer<typeof formSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    console.log('Login data:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast({
      title: t('auth.loginSuccessTitle'),
      description: t('auth.loginSuccessDescription'),
    });
    router.push('/dashboard');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                {t('auth.emailLabel')}
              </FormLabel>
              <FormControl>
                <Input type="email" placeholder={t('auth.emailPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                {t('auth.passwordLabel')}
              </FormLabel>
              <FormControl>
                <Input type="password" placeholder={t('auth.passwordPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <LoadingSpinner size={16} className="mr-2" />}
          {t('auth.loginButton')}
        </Button>
      </form>
    </Form>
  );
}
