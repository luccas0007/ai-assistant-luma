
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { ImapFlow } from "npm:imapflow@1.0.62";
import { SMTPClient } from "npm:emailjs@3.2.0";
import * as oauth from "npm:simple-oauth2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailAccount {
  id: string;
  provider: string;
  imap_host: string;
  imap_port: number;
  smtp_host: string;
  smtp_port: number;
  username: string;
  auth_credentials: {
    password?: string;
    refresh_token?: string;
    access_token?: string;
    expires_at?: string;
  };
  is_oauth: boolean;
}

interface FetchEmailsRequest {
  accountId: string;
  account: EmailAccount;
  folder: string;
  limit: number;
  userId: string;
}

interface SendEmailRequest {
  accountId: string;
  account: EmailAccount;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text: string;
  html?: string;
  from: string;
}

async function fetchEmails(request: FetchEmailsRequest) {
  const { account, folder, limit } = request;
  
  try {
    // Create IMAP client
    const client = new ImapFlow({
      host: account.imap_host,
      port: account.imap_port,
      secure: account.imap_port === 993,
      auth: account.is_oauth 
        ? { user: account.username, accessToken: account.auth_credentials.access_token }
        : { user: account.username, pass: account.auth_credentials.password }
    });

    // Connect to server
    await client.connect();
    
    // Select mailbox
    const mailbox = await client.mailboxOpen(folder);
    console.log(`Selected mailbox: ${mailbox.path}, messages: ${mailbox.exists}`);
    
    // Fetch messages
    const messages = [];
    let fetchCount = Math.min(limit, mailbox.exists);
    
    if (fetchCount > 0) {
      const range = `${Math.max(1, mailbox.exists - fetchCount + 1)}:${mailbox.exists}`;
      
      // Fetch messages
      for await (const message of client.fetch(range, { envelope: true, bodyParts: ['text', 'html'] })) {
        const msg = {
          uid: message.uid,
          messageId: message.envelope.messageId,
          from: message.envelope.from[0] ? {
            address: message.envelope.from[0].address,
            name: message.envelope.from[0].name
          } : null,
          to: message.envelope.to?.map(addr => ({ address: addr.address, name: addr.name })) || [],
          subject: message.envelope.subject,
          date: message.envelope.date,
          flags: message.flags,
          bodyText: message.bodyParts.get('text')?.toString(),
          bodyHtml: message.bodyParts.get('html')?.toString(),
        };
        messages.push(msg);
      }
    }
    
    // Close connection
    await client.logout();
    
    return { success: true, messages };
  } catch (error) {
    console.error('Error fetching emails:', error);
    return { success: false, error: error.message };
  }
}

async function sendEmail(request: SendEmailRequest) {
  const { account, to, cc, bcc, subject, text, html, from } = request;
  
  try {
    // Create SMTP client
    const client = new SMTPClient({
      user: account.username,
      password: account.is_oauth ? account.auth_credentials.access_token : account.auth_credentials.password,
      host: account.smtp_host,
      port: account.smtp_port,
      tls: account.smtp_port === 465,
      ssl: account.smtp_port === 465
    });
    
    // Build email
    const message = {
      from,
      to: to.join(','),
      cc: cc?.join(','),
      bcc: bcc?.join(','),
      subject,
      text,
      attachment: html ? [{ data: html, alternative: true }] : []
    };
    
    // Send email
    const info = await client.sendAsync(message);
    
    return { success: true, messageId: info.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { action, ...data } = await req.json();
    
    let result;
    
    switch (action) {
      case 'fetchEmails':
        result = await fetchEmails(data);
        break;
      case 'sendEmail':
        result = await sendEmail(data);
        break;
      default:
        result = { success: false, error: 'Invalid action' };
    }
    
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
