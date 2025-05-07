
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
});

// Combined schema
const formSchema = z.discriminatedUnion('provider', [
  customEmailSchema,
  oauthEmailSchema,
]);

export default function EmailAccountSetup({ onComplete }: { onComplete: () => void }) {
  const [accountType, setAccountType] = useState<'gmail' | 'outlook' | 'custom'>('gmail');
  const { toast } = useToast();

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
      const accountData: any = {
        account_name: values.account_name,
        email_address: values.email_address,
        provider: values.provider,
        user_id: user.id,
        is_oauth: values.provider !== 'custom',
      };
      
      if (values.provider === 'custom') {
        accountData.username = values.username;
        accountData.auth_credentials = { password: values.password };
        accountData.imap_host = values.imap_host;
        accountData.imap_port = values.imap_port;
        accountData.smtp_host = values.smtp_host;
        accountData.smtp_port = values.smtp_port;
      } else {
        // For OAuth providers, we use the email address as the username
        // This is safe to add to the accountData directly since we're using 'any' type
        accountData.username = values.email_address;
        accountData.auth_credentials = { /* OAuth would store tokens here */ };
        accountData.imap_host = values.provider === 'gmail' ? 'imap.gmail.com' : 'outlook.office365.com';
        accountData.imap_port = 993;
        accountData.smtp_host = values.provider === 'gmail' ? 'smtp.gmail.com' : 'smtp.office365.com';
        accountData.smtp_port = 587;
      }
      
      await addEmailAccount(accountData);
      toast({
        title: "Account added successfully",
        description: `${values.account_name} has been added to your email accounts.`,
      });
      
      onComplete();
    } catch (error) {
      console.error('Error adding email account:', error);
      toast({
        title: "Failed to add account",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    }
  };

  const updateProvider = (provider: 'gmail' | 'outlook' | 'custom') => {
    setAccountType(provider);
    form.setValue('provider', provider);
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Add Email Account</CardTitle>
        <CardDescription>Connect your email account to manage messages</CardDescription>
      </CardHeader>
      <CardContent>
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
                        <Input type="email" placeholder="you@example.com" {...field} />
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
                <Button type="submit">Add Account</Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
