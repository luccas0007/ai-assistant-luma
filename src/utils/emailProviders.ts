
export interface EmailProviderConfig {
  name: string;
  icon?: string;
  isOAuth: boolean;
  requiresPassword: boolean;
  imap: {
    host: string;
    port: number;
    secure: boolean;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
  };
  authUrl?: string;
}

// Default configurations for common email providers
export const emailProviders: Record<string, EmailProviderConfig> = {
  gmail: {
    name: 'Gmail',
    isOAuth: true,
    requiresPassword: false,
    imap: {
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
    },
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
    },
    authUrl: 'https://accounts.google.com/o/oauth2/auth',
  },
  outlook: {
    name: 'Outlook',
    isOAuth: true,
    requiresPassword: false,
    imap: {
      host: 'outlook.office365.com',
      port: 993,
      secure: true,
    },
    smtp: {
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
    },
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  },
  yahoo: {
    name: 'Yahoo Mail',
    isOAuth: true,
    requiresPassword: false,
    imap: {
      host: 'imap.mail.yahoo.com',
      port: 993,
      secure: true,
    },
    smtp: {
      host: 'smtp.mail.yahoo.com',
      port: 587,
      secure: false,
    },
    authUrl: 'https://api.login.yahoo.com/oauth2/request_auth',
  },
  custom: {
    name: 'Custom',
    isOAuth: false,
    requiresPassword: true,
    imap: {
      host: '',
      port: 993,
      secure: true,
    },
    smtp: {
      host: '',
      port: 587,
      secure: false,
    },
  },
};

/**
 * Get the configuration for a specific email provider
 * @param provider The provider identifier
 * @returns The provider configuration
 */
export function getProviderConfig(provider: string): EmailProviderConfig {
  return emailProviders[provider] || emailProviders.custom;
}

/**
 * Get a list of all available email providers
 * @returns Array of provider configurations
 */
export function getAvailableProviders(): EmailProviderConfig[] {
  return Object.values(emailProviders);
}

/**
 * Check if a provider requires OAuth authentication
 * @param provider The provider identifier
 * @returns True if the provider requires OAuth
 */
export function isOAuthProvider(provider: string): boolean {
  return getProviderConfig(provider).isOAuth;
}

/**
 * Get the default server settings for a provider
 * @param provider The provider identifier
 * @returns Object containing IMAP and SMTP settings
 */
export function getDefaultServerSettings(provider: string) {
  const config = getProviderConfig(provider);
  return {
    imap: config.imap,
    smtp: config.smtp,
  };
}
