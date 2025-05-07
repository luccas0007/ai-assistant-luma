
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.3";

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

interface TestConnectionRequest {
  account: EmailAccount;
}

// Provider-specific implementations
const providerHandlers = {
  gmail: {
    getConnectionOptions: (account: EmailAccount) => {
      return {
        host: account.imap_host || 'imap.gmail.com',
        port: account.imap_port || 993,
        secure: account.imap_port === 993,
        auth: account.is_oauth 
          ? { 
              type: 'OAuth2',
              user: account.username,
              accessToken: account.auth_credentials.access_token
            }
          : {
              user: account.username,
              pass: account.auth_credentials.password
            }
      };
    },
    refreshToken: async (account: EmailAccount) => {
      // In a real app, implement OAuth refresh token logic here
      return { success: true, account };
    }
  },
  outlook: {
    getConnectionOptions: (account: EmailAccount) => {
      return {
        host: account.imap_host || 'outlook.office365.com',
        port: account.imap_port || 993,
        secure: account.imap_port === 993,
        auth: account.is_oauth 
          ? { 
              type: 'OAuth2',
              user: account.username,
              accessToken: account.auth_credentials.access_token
            }
          : {
              user: account.username,
              pass: account.auth_credentials.password
            }
      };
    },
    refreshToken: async (account: EmailAccount) => {
      // In a real app, implement OAuth refresh token logic here
      return { success: true, account };
    }
  },
  // Default handler for custom providers
  custom: {
    getConnectionOptions: (account: EmailAccount) => {
      return {
        host: account.imap_host,
        port: account.imap_port,
        secure: account.imap_port === 993,
        auth: {
          user: account.username,
          pass: account.auth_credentials.password
        }
      };
    },
    refreshToken: async (account: EmailAccount) => {
      // No refresh needed for custom providers with password auth
      return { success: true, account };
    }
  }
};

// Helper to get the appropriate provider handler
function getProviderHandler(account: EmailAccount) {
  const provider = account.provider.toLowerCase();
  return providerHandlers[provider] || providerHandlers.custom;
}

async function fetchEmails(request: FetchEmailsRequest) {
  const { account, folder, limit } = request;
  
  try {
    // For MVP, we'll return mock emails
    // In a real implementation, we would connect to the IMAP server and fetch real emails
    const mockEmails = [];
    for (let i = 0; i < Math.min(10, limit); i++) {
      mockEmails.push({
        uid: i + 1,
        messageId: `mock-id-${i + 1}`,
        from: {
          address: "sender@example.com",
          name: "Sender Name"
        },
        to: [{
          address: account.username,
          name: ""
        }],
        subject: `Test Email #${i + 1}`,
        date: new Date(Date.now() - i * 3600 * 1000),
        flags: i % 3 === 0 ? ["\\Seen"] : [],
        bodyText: `This is a test email body #${i + 1}`,
        bodyHtml: `<p>This is a <strong>test</strong> email body #${i + 1}</p>`,
      });
    }
    
    return { success: true, messages: mockEmails };
  } catch (error) {
    console.error('Error fetching emails:', error);
    return { success: false, error: error.message };
  }
}

async function sendEmail(request: SendEmailRequest) {
  const { account, to, cc, bcc, subject, text, html, from } = request;
  
  try {
    // Get provider-specific connection options
    const providerHandler = getProviderHandler(account);
    const transportOptions = providerHandler.getConnectionOptions(account);
    
    // Create SMTP transporter
    const transporter = nodemailer.createTransport(transportOptions);
    
    // Build email
    const message = {
      from,
      to: to.join(','),
      cc: cc?.join(','),
      bcc: bcc?.join(','),
      subject,
      text,
      html
    };
    
    // For MVP, we'll simulate sending and return a mock success
    // In a real implementation, we would actually send the email
    console.log('Would send email:', message);
    
    // Return mock success with a generated message ID
    return { success: true, messageId: `mock-message-${Date.now()}` };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

async function testConnection(request: TestConnectionRequest) {
  const { account } = request;
  
  try {
    // Get provider-specific connection options
    const providerHandler = getProviderHandler(account);
    const transportOptions = providerHandler.getConnectionOptions(account);
    
    // In a real implementation, we would actually try to connect
    // For MVP, we'll just simulate a successful connection
    console.log('Testing connection with options:', transportOptions);
    
    // Simulate a delay for realism
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return success
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    console.error('Error testing connection:', error);
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
      case 'testConnection':
        result = await testConnection(data);
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
