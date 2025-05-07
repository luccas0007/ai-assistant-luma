
export interface EmailAccount {
  id: string;
  user_id: string;
  account_name: string;
  email_address: string;
  provider: 'gmail' | 'outlook' | 'custom';
  imap_host: string | null;
  imap_port: number | null;
  smtp_host: string | null;
  smtp_port: number | null;
  username: string | null;
  auth_credentials: {
    password?: string;
    refresh_token?: string;
    access_token?: string;
    expires_at?: string;
  } | null;
  is_oauth: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Email {
  id: string;
  account_id: string;
  message_id: string;
  conversation_id: string | null;
  from_address: string;
  from_name: string | null;
  to_addresses: string[];
  cc_addresses: string[] | null;
  bcc_addresses: string[] | null;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  is_read: boolean | null;
  is_starred: boolean | null;
  is_draft: boolean | null;
  sent_at: string | null;
  received_at: string | null;
  folder: string;
  labels: string[] | null;
  has_attachments: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface EmailAttachment {
  id: string;
  email_id: string;
  filename: string;
  content_type: string;
  size: number;
  storage_path: string;
  created_at: string | null;
}

export interface EmailFolder {
  id: string;
  name: string;
  count: number;
  unread?: number;
}

export interface EmailCompose {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  html?: string;
  attachments?: File[];
}
