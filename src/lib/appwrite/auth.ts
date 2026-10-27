import { OAuthProvider } from 'appwrite';
import { getAccount } from './client';
import { APPWRITE_CONFIG } from './config';
import type { AuthUser } from '@/types/task';

/**
 * Returns the current authenticated or anonymous user session, or null if unauthenticated.
 * Never throws an error when no session is present.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const account = getAccount();
    const user = await account.get();
    const isAnonymous = !user.email || user.email === '';
    return {
      id: user.$id,
      email: user.email || '',
      name: user.name || (isAnonymous ? 'Guest' : user.email.split('@')[0]),
      isAnonymous,
    };
  } catch {
    return null;
  }
}

/**
 * Ensures an active session exists (anonymous or permanent).
 * If no session exists, creates an anonymous session so guest tasks
 * can be immediately saved to Appwrite TablesDB.
 */
export async function ensureSession(): Promise<AuthUser | null> {
  // 1. Check if an active session already exists
  const existing = await getCurrentUser();
  if (existing) {
    return existing;
  }

  // 2. If no session exists, attempt to initialize an anonymous session
  try {
    if (!APPWRITE_CONFIG.projectId) {
      return null;
    }
    const account = getAccount();
    await account.createAnonymousSession();
    const user = await account.get();
    return {
      id: user.$id,
      email: '',
      name: 'Guest',
      isAnonymous: true,
    };
  } catch (err) {
    console.warn('[Auth] Anonymous session initialization skipped:', err);
    return null;
  }
}

/**
 * Initiates Google OAuth sign-in flow using the OAuth2 token flow (createOAuth2Token).
 * Stashes any active anonymous user ID for post-login task reassignment.
 */
export async function loginWithGoogle(): Promise<void> {
  const account = getAccount();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const success = `${origin}/auth/success`;
  const failure = `${origin}/auth/failure`;

  // Stash anonymous userId if present to allow reassigning guest tasks after OAuth completes
  if (typeof window !== 'undefined') {
    try {
      const current = await getCurrentUser();
      if (current?.isAnonymous && current.id) {
        sessionStorage.setItem('tinysteps_anon_migration_id', current.id);
        // Delete the anonymous session before starting OAuth.
        // If an anonymous session is active, Appwrite attempts to convert/link it,
        // which throws a 409 user_already_exists error when signing into an existing Google account.
        try {
          await account.deleteSession({ sessionId: 'current' });
        } catch {
          // Session delete error ignored
        }
      }
    } catch {
      // Ignore
    }
  }

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
    isAnonymous: false,
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
