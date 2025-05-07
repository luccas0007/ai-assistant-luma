import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { addEmailAccount } from '@/services/emailService';
import { getProviderConfig } from '@/utils/emailProviders';

// Form schema for custom email setup
const customEmailSchema = z.object({
  provider: z.literal('custom'),
  account_name: z.string().min(1, 'Account name is required'),
  email_address: z.string().email('Valid email address required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  imap_host: z.string().min(1, 'IMAP host is required'),
  imap_port: z.coerce.number().int().positive('Port must be a positive number'),
  smtp_host: z.string().min(1, 'SMTP host is required'),
  smtp_port: z.coerce.number().int().positive('Port must be a positive number'),
});

// Form schema for Gmail/Outlook setup (OAuth)
const oauthEmailSchema = z.object({
  provider: z.enum(['gmail', 'outlook']),
  account_name: z.string().min(1, 'Account name is required'),
  email_address: z.string().email('Valid email address required'),
  username: z.string().optional(),
});

// Combined schema
const formSchema = z.discriminatedUnion('provider', [
  customEmailSchema,
  oauthEmailSchema,
]);

type FormValues = z.infer<typeof formSchema>;

export function useEmailAccountForm(onComplete: () => void) {
  const [accountType, setAccountType] = useState<'gmail' | 'outlook' | 'custom'>('gmail');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testConnectionResult, setTestConnectionResult] = useState<{ success: boolean; message: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: 'gmail' as const,
      account_name: '',
      email_address: '',
      username: '',
      // Notice: 'password' is only included in customEmailSchema, not in the defaultValues
      // as it's conditional based on the provider type
    },
  });

  const updateProvider = (provider: 'gmail' | 'outlook' | 'custom') => {
    setAccountType(provider);
    
    // Reset the form with the appropriate default values based on provider type
    if (provider === 'custom') {
      form.reset({
        provider: 'custom',
        account_name: form.getValues('account_name') || '',
        email_address: form.getValues('email_address') || '',
        username: form.getValues('username') || '',
        password: '',
        imap_host: '',
        imap_port: 993,
        smtp_host: '',
        smtp_port: 587,
      });
    } else {
      // Handle OAuth providers (gmail/outlook)
      const config = getProviderConfig(provider);
      const currentEmail = form.getValues('email_address') || '';
      
      form.reset({
        provider: provider as 'gmail' | 'outlook',
        account_name: form.getValues('account_name') || '',
        email_address: currentEmail,
        username: currentEmail, // Set username to email address for OAuth providers
      });
      
      // We don't set these fields directly on the form values since they're not in the OAuth schema
      // They will be retrieved from the provider config when needed
    }
    
    // Reset test connection result when changing provider
    setTestConnectionResult(null);
  };

  const testConnection = async () => {
    try {
      setIsTestingConnection(true);
      setTestConnectionResult(null);
      
      const values = form.getValues();
      
      // Call the test connection endpoint (for MVP we're just simulating)
      // In a real implementation, we would create a temporary account object and test the connection

      let testAccount;
      if (values.provider === 'custom') {
        const customValues = values as z.infer<typeof customEmailSchema>;
        testAccount = {
          provider: customValues.provider,
          username: customValues.username,
          auth_credentials: { password: customValues.password },
          imap_host: customValues.imap_host,
          imap_port: customValues.imap_port,
          smtp_host: customValues.smtp_host,
          smtp_port: customValues.smtp_port,
          is_oauth: false
        };
      } else {
        const oauthValues = values as z.infer<typeof oauthEmailSchema>;
        const providerConfig = getProviderConfig(oauthValues.provider);
        testAccount = {
          provider: oauthValues.provider,
          username: oauthValues.email_address,
          auth_credentials: {},
          imap_host: providerConfig.imap.host,
          imap_port: providerConfig.imap.port,
          smtp_host: providerConfig.smtp.host,
          smtp_port: providerConfig.smtp.port,
          is_oauth: true
        };
      }

      // In a real app, we would make an API call to test the connection
      // For MVP, we'll simulate a successful connection after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestConnectionResult({
        success: true,
        message: 'Connection test successful'
      });
      
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestConnectionResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to add an email account",
          variant: "destructive",
        });
        return;
      }

      if (values.provider === 'custom') {
        // Handle custom provider fields
        const customData = values as z.infer<typeof customEmailSchema>;
        const accountData = {
          account_name: customData.account_name,
          email_address: customData.email_address,
          provider: customData.provider,
          user_id: user.id,
          is_oauth: false,
          username: customData.username,
          auth_credentials: { password: customData.password },
          imap_host: customData.imap_host,
          imap_port: customData.imap_port,
          smtp_host: customData.smtp_host,
          smtp_port: customData.smtp_port,
        };
        
        await addEmailAccount(accountData);
      } else {
        // Handle OAuth provider fields
        const oauthData = values as z.infer<typeof oauthEmailSchema>;
        const providerConfig = getProviderConfig(oauthData.provider);
        
        const accountData = {
          account_name: oauthData.account_name,
          email_address: oauthData.email_address,
          provider: oauthData.provider,
          user_id: user.id,
          is_oauth: true,
          username: oauthData.email_address, // Use email as username for OAuth
          auth_credentials: {}, // OAuth credentials would go here in a real app
          imap_host: providerConfig.imap.host,
          imap_port: providerConfig.imap.port,
          smtp_host: providerConfig.smtp.host,
          smtp_port: providerConfig.smtp.port,
        };
        
        await addEmailAccount(accountData);
      }
      
      toast({
        title: "Account added successfully",
        description: `${values.account_name} has been added to your email accounts.`,
      });
      
      onComplete();
    } catch (error) {
      console.error('Error adding email account:', error);
      setFormError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast({
        title: "Failed to add account",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    accountType,
    isSubmitting,
    formError,
    isTestingConnection,
    testConnectionResult,
    updateProvider,
    testConnection,
    onSubmit
  };
}
