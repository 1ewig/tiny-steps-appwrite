const DRAFT_PREFIX = 'tinysteps:draft:v1:';
const TASK_DRAFT_PREFIX = `${DRAFT_PREFIX}task:`;

export const START_DRAFT_KEY = `${DRAFT_PREFIX}start`;

export function getTaskDraftKey(taskId: string): string {
  return `${TASK_DRAFT_PREFIX}${taskId}`;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readChatDraft(key: string): string {
  const storage = getStorage();
  if (!storage) return '';
  try {
    return storage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

export function writeChatDraft(key: string, text: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    if (!text.trim()) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, text);
    }
  } catch {
    // Storage may be full or unavailable; drafts are best-effort.
  }
}

export function removeChatDraft(key: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}
