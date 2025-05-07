
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { addEmailAccount } from '@/services/emailService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmailProviderConfig, getProviderConfig } from '@/utils/emailProviders';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

export default function EmailAccountSetup({ onComplete }: { onComplete: () => void }) {
  const [accountType, setAccountType] = useState<'gmail' | 'outlook' | 'custom'>('gmail');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: 'gmail' as const,
      account_name: '',
      email_address: '',
      username: '',
      password: '',
      imap_host: '',
      imap_port: 993,
      smtp_host: '',
      smtp_port: 587,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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

      // For MVP, we'll handle simple authentication only
      // In a real app, we would handle OAuth2 flow here
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

  const updateProvider = (provider: 'gmail' | 'outlook' | 'custom') => {
    setAccountType(provider);
    form.setValue('provider', provider);
    
    if (provider !== 'custom') {
      // When switching to OAuth providers, set username to email address
      const currentEmail = form.getValues('email_address');
      if (currentEmail) {
        form.setValue('username', currentEmail);
      }
      
      // Set default server settings from provider config
      const config = getProviderConfig(provider);
      form.setValue('imap_host', config.imap.host);
      form.setValue('imap_port', config.imap.port);
      form.setValue('smtp_host', config.smtp.host);
      form.setValue('smtp_port', config.smtp.port);
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Add Email Account</CardTitle>
        <CardDescription>Connect your email account to manage messages</CardDescription>
      </CardHeader>
      <CardContent>
        {formError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
      
        <Tabs defaultValue="gmail" onValueChange={(value) => updateProvider(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gmail">Gmail</TabsTrigger>
            <TabsTrigger value="outlook">Outlook</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="account_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Personal Gmail" {...field} />
                      </FormControl>
                      <FormDescription>
                        A friendly name to identify this account
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="you@example.com" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            // Auto-update username to match email for OAuth providers
                            if (accountType !== 'custom') {
                              form.setValue('username', e.target.value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {accountType === 'custom' && (
                  <>
                    <Separator className="my-4" />
                    <h3 className="text-lg font-medium mb-4">Account Credentials</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator className="my-4" />
                    <h3 className="text-lg font-medium mb-4">Server Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="imap_host"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IMAP Host</FormLabel>
                            <FormControl>
                              <Input placeholder="imap.example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="imap_port"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IMAP Port</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="smtp_host"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Host</FormLabel>
                            <FormControl>
                              <Input placeholder="smtp.example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="smtp_port"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Port</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
                
                {accountType !== 'custom' && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">
                      For this MVP, we're simulating OAuth authentication. In a real application,
                      you would be redirected to the provider's login page to authenticate.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding Account...' : 'Add Account'}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
