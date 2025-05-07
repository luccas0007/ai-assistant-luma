import { supabase } from '@/integrations/supabase/client';
import { EmailAccount, Email, EmailCompose } from '@/types/email';
import { getProviderConfig } from '@/utils/emailProviders';

// Account management
export const getEmailAccounts = async (): Promise<EmailAccount[]> => {
  const { data, error } = await supabase
    .from('email_accounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching email accounts:', error);
    throw error;
  }

  return (data || []) as EmailAccount[];
};

export const addEmailAccount = async (account: any): Promise<EmailAccount> => {
  // Ensure required fields are present
  if (!account.account_name || !account.email_address || !account.provider || !account.user_id) {
    throw new Error('Missing required fields for email account');
  }

  const { data, error } = await supabase
    .from('email_accounts')
    .insert(account)
    .select()
    .single();

  if (error) {
    console.error('Error adding email account:', error);
    throw error;
  }

  return data as EmailAccount;
};

export const testEmailConnection = async (accountData: Partial<EmailAccount>): Promise<boolean> => {
  try {
    // For custom accounts, ensure we have all required fields
    if (accountData.provider === 'custom') {
      if (!accountData.username || !accountData.auth_credentials?.password || 
          !accountData.imap_host || !accountData.smtp_host) {
        throw new Error('Missing required fields for testing connection');
      }
    } else {
      // For OAuth accounts, apply default settings from provider config
      const providerConfig = getProviderConfig(accountData.provider!);
      accountData.imap_host = providerConfig.imap.host;
      accountData.imap_port = providerConfig.imap.port;
      accountData.smtp_host = providerConfig.smtp.host;
      accountData.smtp_port = providerConfig.smtp.port;
    }

    // Call the edge function to test connection
    const response = await supabase.functions.invoke('email-operations', {
      body: {
        action: 'testConnection',
        account: accountData
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to test connection');
    }

    return true;
  } catch (error) {
    console.error('Error testing email connection:', error);
    throw error;
  }
};

export const updateEmailAccount = async (id: string, updates: Partial<EmailAccount>): Promise<EmailAccount> => {
  const { data, error } = await supabase
    .from('email_accounts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating email account:', error);
    throw error;
  }

  return data as EmailAccount;
};

export const deleteEmailAccount = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('email_accounts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting email account:', error);
    throw error;
  }
};

// Email management
export const getEmails = async (accountId: string, folder: string = 'inbox'): Promise<Email[]> => {
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .eq('account_id', accountId)
    .eq('folder', folder)
    .order('received_at', { ascending: false });

  if (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }

  return data as Email[] || [];
};

export const getEmail = async (id: string): Promise<Email> => {
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching email:', error);
    throw error;
  }

  // Mark as read
  await markEmailAsRead(id);

  return data as Email;
};

export const markEmailAsRead = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('emails')
    .update({ is_read: true })
    .eq('id', id);

  if (error) {
    console.error('Error marking email as read:', error);
    throw error;
  }
};

export const toggleStarEmail = async (id: string, starred: boolean): Promise<void> => {
  const { error } = await supabase
    .from('emails')
    .update({ is_starred: starred })
    .eq('id', id);

  if (error) {
    console.error('Error toggling star on email:', error);
    throw error;
  }
};

export const moveEmailToFolder = async (id: string, folder: string): Promise<void> => {
  const { error } = await supabase
    .from('emails')
    .update({ folder })
    .eq('id', id);

  if (error) {
    console.error('Error moving email to folder:', error);
    throw error;
  }
};

// Email synchronization
export const syncEmails = async (accountId: string, folder: string = 'inbox'): Promise<Email[]> => {
  try {
    // Get account details
    const { data: account, error: accountError } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      throw new Error('Failed to fetch account details');
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Call edge function to fetch emails
    const response = await supabase.functions.invoke('email-operations', {
      body: {
        action: 'fetchEmails',
        accountId,
        account,
        folder,
        limit: 50, // Fetch latest 50 emails
        userId: user.id
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch emails');
    }

    // Process and store emails in database
    const emails = response.data.messages;
    const processedEmails = emails.map((msg: any) => ({
      account_id: accountId,
      message_id: msg.messageId,
      from_address: msg.from?.address || '',
      from_name: msg.from?.name || null,
      to_addresses: msg.to.map((to: any) => to.address || ''),
      subject: msg.subject || null,
      body_text: msg.bodyText || null,
      body_html: msg.bodyHtml || null,
      is_read: !msg.flags?.includes('\\Seen'),
      is_starred: msg.flags?.includes('\\Flagged'),
      received_at: msg.date ? new Date(msg.date).toISOString() : null,
      folder: folder,
      has_attachments: false, // We'll handle attachments separately
    }));

    // Upsert emails
    if (processedEmails.length > 0) {
      const { data: savedEmails, error: insertError } = await supabase
        .from('emails')
        .upsert(processedEmails, {
          onConflict: 'account_id,message_id',
          ignoreDuplicates: false,
        })
        .select();

      if (insertError) {
        console.error('Error storing emails:', insertError);
        throw insertError;
      }

      return savedEmails as Email[];
    }

    return [];
  } catch (error) {
    console.error('Error syncing emails:', error);
    throw error;
  }
};

// Compose and send email
export const sendEmail = async (accountId: string, emailData: EmailCompose): Promise<string> => {
  try {
    // Get account details
    const { data: account, error: accountError } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      throw new Error('Failed to fetch account details');
    }

    // Call edge function to send email
    const response = await supabase.functions.invoke('email-operations', {
      body: {
        action: 'sendEmail',
        accountId,
        account,
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        text: emailData.body,
        html: emailData.html,
        from: `${account.account_name} <${account.email_address}>`
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to send email');
    }

    // Store the sent email in the database
    const sentEmail = {
      account_id: accountId,
      message_id: response.data.messageId || `sent-${Date.now()}`,
      from_address: account.email_address,
      from_name: account.account_name,
      to_addresses: emailData.to,
      cc_addresses: emailData.cc.length > 0 ? emailData.cc : null,
      bcc_addresses: emailData.bcc.length > 0 ? emailData.bcc : null,
      subject: emailData.subject,
      body_text: emailData.body,
      body_html: emailData.html || null,
      is_read: true,
      is_draft: false,
      sent_at: new Date().toISOString(),
      folder: 'sent',
      has_attachments: false, // We'll handle attachments in a future enhancement
    };

    const { data: savedEmail, error: insertError } = await supabase
      .from('emails')
      .insert(sentEmail)
      .select()
      .single();

    if (insertError) {
      console.error('Error storing sent email:', insertError);
      throw insertError;
    }

    return savedEmail.id;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
