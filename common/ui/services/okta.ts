import { OktaAuth } from '@okta/okta-auth-js';

let oktaAuthInstance: OktaAuth | null = null;

export function isOktaConfigured(): boolean {
  return !!(import.meta.env.VITE_OKTA_DOMAIN && import.meta.env.VITE_OKTA_CLIENT_ID);
}

export function getOktaAuth(): OktaAuth {
  if (!oktaAuthInstance) {
    const domain = import.meta.env.VITE_OKTA_DOMAIN;
    const clientId = import.meta.env.VITE_OKTA_CLIENT_ID;

    if (!domain || !clientId) {
      throw new Error(
        'Okta configuration missing. Set VITE_OKTA_DOMAIN and VITE_OKTA_CLIENT_ID environment variables.',
      );
    }

    oktaAuthInstance = new OktaAuth({
      issuer: `https://${domain}/oauth2/default`,
      clientId,
      redirectUri: `${window.location.origin}/callback`,
      scopes: ['openid', 'profile', 'email'],
      pkce: true,
    });
  }
  return oktaAuthInstance;
}

export function isOktaCallback(): boolean {
  return (
    window.location.pathname === '/callback' &&
    new URLSearchParams(window.location.search).has('code')
  );
}
