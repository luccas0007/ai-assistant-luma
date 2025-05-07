
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmailAccount } from '@/types/email';
import { sendEmail } from '@/services/emailService';
import { useToast } from '@/hooks/use-toast';

// Validation schema
const formSchema = z.object({
  account_id: z.string().min(1, 'Please select an account'),
  to: z.string().min(1, 'Recipient is required'),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().min(1, 'Message cannot be empty'),
});

interface EmailComposeProps {
  accounts: EmailAccount[];
  onClose: () => void;
  onSent: () => void;
}

export default function EmailCompose({ accounts, onClose, onSent }: EmailComposeProps) {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account_id: accounts.length > 0 ? accounts[0].id : '',
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      body: '',
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (accounts.length === 0) {
      toast({
        title: "No email accounts",
        description: "Please add an email account before sending messages.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSending(true);
      
      // Process email addresses
      const toAddresses = values.to.split(',').map(email => email.trim());
      const ccAddresses = values.cc ? values.cc.split(',').map(email => email.trim()) : [];
      const bccAddresses = values.bcc ? values.bcc.split(',').map(email => email.trim()) : [];
      
      await sendEmail(values.account_id, {
        to: toAddresses,
        cc: ccAddresses,
        bcc: bccAddresses,
        subject: values.subject || '(No subject)',
        body: values.body,
      });
      
      toast({
        title: "Email sent",
        description: "Your message has been sent successfully.",
      });
      
      onSent();
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };
  
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Compose Email</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="account_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={accounts.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.account_name} ({account.email_address})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <Input placeholder="recipient@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cc</FormLabel>
                    <FormControl>
                      <Input placeholder="cc@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bcc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bcc</FormLabel>
                    <FormControl>
                      <Input placeholder="bcc@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea rows={12} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" disabled={sending || accounts.length === 0}>
              {sending ? "Sending..." : "Send"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
