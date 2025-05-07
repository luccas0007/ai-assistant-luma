
import { Mail } from 'lucide-react';

/**
 * Email provider configuration interface
 */
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

/**
 * Email provider types
 */
export type EmailProviderType = 'gmail' | 'outlook' | 'yahoo' | 'custom' | string;

/**
 * Provider factory to create provider configurations
 */
export class ProviderFactory {
  /**
   * Create a standard OAuth provider configuration
   */
  static createOAuthProvider(
    name: string,
    imapHost: string,
    smtpHost: string,
    authUrl: string,
    icon?: string
  ): EmailProviderConfig {
    return {
      name,
      icon,
      isOAuth: true,
      requiresPassword: false,
      imap: {
        host: imapHost,
        port: 993, // Standard IMAP SSL port
        secure: true,
      },
      smtp: {
        host: smtpHost,
        port: 587, // Standard SMTP TLS port
        secure: false,
      },
      authUrl,
    };
  }

  /**
   * Create a standard password-based provider configuration
   */
  static createPasswordProvider(
    name: string,
    imapHost: string = '',
    smtpHost: string = '',
    icon?: string
  ): EmailProviderConfig {
    return {
      name,
      icon,
      isOAuth: false,
      requiresPassword: true,
      imap: {
        host: imapHost,
        port: 993,
        secure: true,
      },
      smtp: {
        host: smtpHost,
        port: 587,
        secure: false,
      },
    };
  }

  /**
   * Create a custom provider configuration template
   */
  static createCustomProvider(): EmailProviderConfig {
    return this.createPasswordProvider('Custom');
  }
}

// Define all providers
const providerDefinitions: Record<string, EmailProviderConfig> = {
  gmail: ProviderFactory.createOAuthProvider(
    'Gmail',
    'imap.gmail.com',
    'smtp.gmail.com',
    'https://accounts.google.com/o/oauth2/auth'
  ),
  
  outlook: ProviderFactory.createOAuthProvider(
    'Outlook',
    'outlook.office365.com',
    'smtp.office365.com',
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
  ),
  
  yahoo: ProviderFactory.createOAuthProvider(
    'Yahoo Mail',
    'imap.mail.yahoo.com',
    'smtp.mail.yahoo.com',
    'https://api.login.yahoo.com/oauth2/request_auth'
  ),
  
  custom: ProviderFactory.createCustomProvider()
};

/**
 * Get all available provider configurations
 */
export const emailProviders: Record<string, EmailProviderConfig> = { ...providerDefinitions };

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
 * Get a list of provider options for select inputs
 * @returns Array of provider options with value and label
 */
export function getProviderOptions() {
  return Object.entries(emailProviders)
    .filter(([key]) => key !== 'custom') // Filter out custom as it's typically a separate option
    .map(([key, config]) => ({
      value: key,
      label: config.name
    }));
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
 * Add a new provider configuration
 * @param key Provider identifier
 * @param config Provider configuration
 */
export function addProviderConfig(key: string, config: EmailProviderConfig): void {
  emailProviders[key] = config;
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
