import Constants from 'expo-constants';

const normalize = (value?: string): string | undefined => {
  if (!value || typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim().replace(/\/$/, '');
  if (!trimmed.length) {
    return undefined;
  }

  return trimmed;
};

const resolveBaseUrl = (): string => {
  const envUrl = normalize(process.env.EXPO_PUBLIC_WEB_BASE_URL);
  if (envUrl) {
    return envUrl;
  }

  const extraUrl = normalize((Constants.expoConfig?.extra as any)?.webBaseUrl);
  if (extraUrl) {
    return extraUrl;
  }

  return 'https://zenlit.app';
};

const resolveSupportEmail = (): string => {
  const envEmail = normalize(process.env.EXPO_PUBLIC_SUPPORT_EMAIL);
  if (envEmail) {
    return envEmail;
  }

  const extraEmail = normalize((Constants.expoConfig?.extra as any)?.supportEmail);
  if (extraEmail) {
    return extraEmail;
  }

  return 'support@zenlit.app';
};

export const LEGAL_VERSION = 'v1.0';
export const TERMS_VERSION = LEGAL_VERSION;
export const PRIVACY_VERSION = LEGAL_VERSION;
export const LEGAL_EFFECTIVE_DATE = 'April 3, 2026';
export const LEGAL_LAST_UPDATED = 'April 3, 2026';

export const SUPPORT_EMAIL = resolveSupportEmail();
export const WEB_BASE_URL = resolveBaseUrl();

export const LEGAL_URLS = {
  privacy: `${WEB_BASE_URL}/privacy`,
  terms: `${WEB_BASE_URL}/terms`,
  accountDeletion: `${WEB_BASE_URL}/delete-account`,
} as const;
