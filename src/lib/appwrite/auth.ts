import { ID, OAuthProvider } from 'appwrite';
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
 * Initiates Google OAuth sign-in flow via Appwrite.
 * Automatically redirects to Google, then returns to the success/failure URL.
 */
export function loginWithGoogle(redirectPath: string = '/tasks'): void {
  const account = getAccount();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const successUrl = `${origin}${redirectPath}?auth=success`;
  const failureUrl = `${origin}${redirectPath}?auth=failed`;

  account.createOAuth2Session(OAuthProvider.Google, successUrl, failureUrl);
}

/**
 * Signs in a user using email and password.
 */
export async function loginWithEmail(email: string, password: string): Promise<AuthUser> {
  const account = getAccount();
  const trimmedEmail = email.trim();

  // If already logged in, check if it's the same user or clear session
  try {
    const current = await account.get();
    if (current) {
      if (current.email.toLowerCase() === trimmedEmail.toLowerCase()) {
        return {
          id: current.$id,
          email: current.email,
          name: current.name || current.email.split('@')[0],
        };
      }
      await account.deleteSession('current');
    }
  } catch {
    // No active session
  }

  const session = await account.createEmailPasswordSession(trimmedEmail, password);

  try {
    const user = await account.get();
    return {
      id: user.$id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
    };
  } catch {
    return {
      id: session.userId,
      email: trimmedEmail,
      name: trimmedEmail.split('@')[0],
    };
  }
}

/**
 * Registers a new account with email, password, and optional name, then creates an active session.
 */
export async function registerWithEmail(
  email: string,
  password: string,
  name?: string
): Promise<AuthUser> {
  const account = getAccount();
  const trimmedEmail = email.trim();
  const cleanName = name?.trim() || trimmedEmail.split('@')[0];

  const createdUser = await account.create(ID.unique(), trimmedEmail, password, cleanName);
  await account.createEmailPasswordSession(trimmedEmail, password);

  return {
    id: createdUser.$id,
    email: createdUser.email,
    name: createdUser.name || cleanName,
  };
}

/**
 * Signs out the current user session.
 */
export async function logoutUser(): Promise<void> {
  try {
    const account = getAccount();
    await account.deleteSession('current');
  } catch {
    // Session already absent
  }
}
