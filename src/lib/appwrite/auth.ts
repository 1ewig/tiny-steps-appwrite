import { OAuthProvider } from 'appwrite';
import { getAccount } from './client';
import type { AuthUser } from '@/types/task';

/**
 * Returns the current authenticated user session, or null if unauthenticated.
 * Never throws an error when no session is present.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const account = getAccount();
    const user = await account.get();
    return {
      id: user.$id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
    };
  } catch {
    return null;
  }
}

/**
 * Initiates Google OAuth sign-in flow using the OAuth2 token flow (createOAuth2Token).
 * Navigates the browser to Google OAuth without relying on third-party cookies.
 */
export async function loginWithGoogle(): Promise<void> {
  const account = getAccount();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const success = `${origin}/auth/success`;
  const failure = `${origin}/auth/failure`;

  await account.createOAuth2Token({
    provider: OAuthProvider.Google,
    success,
    failure,
  });
}

/**
 * Handles the OAuth2 success callback by exchanging the returned userId & secret
 * for an active first-party Appwrite session.
 */
export async function handleOAuthSuccess(userId: string, secret: string): Promise<AuthUser> {
  const account = getAccount();
  await account.createSession({ userId, secret });
  const user = await account.get();
  return {
    id: user.$id,
    email: user.email,
    name: user.name || user.email.split('@')[0],
  };
}

/**
 * Signs out the current user session.
 */
export async function logoutUser(): Promise<void> {
  try {
    const account = getAccount();
    await account.deleteSession({ sessionId: 'current' });
  } catch {
    // Session already absent
  }
}
