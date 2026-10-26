'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTaskStore } from '@/store/task-store';
import {
  saveTaskToDb,
  deleteTaskFromDb,
  fetchUserTasksFromDb,
} from '@/lib/appwrite/tasks';
import type { Task } from '@/types/task';

export function useTaskSync() {
  const user = useTaskStore((s) => s.user);
  const tasks = useTaskStore((s) => s.tasks);
  const setTasks = useTaskStore((s) => s.setTasks);
  const isSyncing = useTaskStore((s) => s.isSyncing);
  const lastSyncedAt = useTaskStore((s) => s.lastSyncedAt);
  const setIsSyncing = useTaskStore((s) => s.setIsSyncing);
  const setLastSyncedAt = useTaskStore((s) => s.setLastSyncedAt);

  const isInitialSyncRef = useRef(false);
  const prevTasksRef = useRef<Task[]>(tasks);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Performs full two-way reconciliation:
   * 1. Migrates unassigned local tasks to the authenticated user's TablesDB.
   * 2. Pulls all remote tasks from TablesDB.
   * 3. Merges local and remote tasks cleanly by timestamp.
   */
  const reconcile = useCallback(
    async (userId: string) => {
      if (isInitialSyncRef.current) return;
      isInitialSyncRef.current = true;
      setIsSyncing(true);

      try {
        const currentLocal = useTaskStore.getState().tasks;

        // 1. Identify local tasks that need cloud migration (unassigned or belonging to this user)
        const unassignedLocal = currentLocal.filter((t) => !t.userId);
        if (unassignedLocal.length > 0) {
          await Promise.allSettled(
            unassignedLocal.map((task) =>
              saveTaskToDb({ ...task, userId }, userId)
            )
          );
        }

        // 2. Fetch all cloud tasks from TablesDB
        const cloudTasks = await fetchUserTasksFromDb(userId);

        // 3. Merge local + cloud tasks
        const cloudMap = new Map<string, Task>();
        cloudTasks.forEach((ct) => cloudMap.set(ct.id, ct));

        const mergedMap = new Map<string, Task>();

        // Process local tasks
        currentLocal.forEach((lt) => {
          const cloudVersion = cloudMap.get(lt.id);
          if (cloudVersion) {
            // Keep the more recently updated version
            if (cloudVersion.updatedAt > (lt.updatedAt || 0)) {
              mergedMap.set(lt.id, cloudVersion);
            } else {
              mergedMap.set(lt.id, { ...lt, userId });
            }
            cloudMap.delete(lt.id);
          } else {
            mergedMap.set(lt.id, { ...lt, userId });
          }
        });

        // Add any remaining cloud-only tasks
        cloudMap.forEach((ct, id) => {
          mergedMap.set(id, ct);
        });

        const mergedList = Array.from(mergedMap.values()).sort(
          (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
        );

        prevTasksRef.current = mergedList;
        setTasks(mergedList);
        setLastSyncedAt(Date.now());
      } catch (err) {
        console.warn('[Sync] Reconcile error:', err);
      } finally {
        setIsSyncing(false);
        isInitialSyncRef.current = false;
      }
    },
    [setTasks, setIsSyncing, setLastSyncedAt]
  );

  // Trigger reconciliation when user logs in
  useEffect(() => {
    if (user?.id) {
      reconcile(user.id);
    }
  }, [user?.id, reconcile]);

  // Subscribe to subsequent task changes and sync to TablesDB in background
  useEffect(() => {
    if (!user?.id) {
      prevTasksRef.current = tasks;
      return;
    }

    const prevTasks = prevTasksRef.current;
    prevTasksRef.current = tasks;

    // Do not sync during initial migration pull to avoid loop
    if (isInitialSyncRef.current) return;

    const prevMap = new Map<string, Task>();
    prevTasks.forEach((t) => prevMap.set(t.id, t));

    const currentMap = new Map<string, Task>();
    tasks.forEach((t) => currentMap.set(t.id, t));

    // Detect deleted tasks
    const deletedTasks: Task[] = [];
    prevMap.forEach((prevTask, id) => {
      if (!currentMap.has(id)) {
        deletedTasks.push(prevTask);
      }
    });

    // Detect changed or newly added tasks
    const changedTasks: Task[] = [];
    currentMap.forEach((currentTask, id) => {
      const prev = prevMap.get(id);
      if (!prev || prev.updatedAt !== currentTask.updatedAt) {
        changedTasks.push(currentTask);
      }
    });

    // Immediately delete removed tasks from TablesDB
    if (deletedTasks.length > 0) {
      deletedTasks.forEach((dt) => {
        deleteTaskFromDb(dt.id).catch((err) =>
          console.warn(`[Sync] Failed to delete task ${dt.id}:`, err)
        );
      });
    }

    // Debounce pushing changed or added tasks
    if (changedTasks.length > 0) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        setIsSyncing(true);
        try {
          await Promise.allSettled(
            changedTasks.map((ct) => saveTaskToDb(ct, user.id))
          );
          setLastSyncedAt(Date.now());
        } catch (err) {
          console.warn('[Sync] Background sync failed:', err);
        } finally {
          setIsSyncing(false);
        }
      }, 600);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [tasks, user?.id, setIsSyncing, setLastSyncedAt]);

  const syncNow = useCallback(() => {
    if (user?.id) {
      return reconcile(user.id);
    }
    return Promise.resolve();
  }, [user, reconcile]);

  return {
    isSyncing,
    lastSyncedAt,
    syncNow,
  };
}
