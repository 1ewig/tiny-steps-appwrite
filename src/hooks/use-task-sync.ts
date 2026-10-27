'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTaskStore } from '@/store/task-store';
import {
  saveTaskToDb,
  deleteTaskFromDb,
  fetchUserTasksFromDb,
} from '@/lib/appwrite/tasks';
import type { Task } from '@/types/task';

let reconcileGeneration = 0;

/**
 * Reconciles local and cloud tasks:
 * 1. Migrates unassigned local tasks to the authenticated user's TablesDB.
 * 2. Pulls all remote tasks from TablesDB.
 * 3. Merges local and remote tasks cleanly by timestamp.
 */
async function performReconcile(userId: string) {
  const currentGen = ++reconcileGeneration;
  const { tasks: currentLocal, setTasks, setIsSyncing, setLastSyncedAt } = useTaskStore.getState();
  setIsSyncing(true);

  try {
    // 1. Identify local tasks that need cloud migration (unassigned tasks created in guest/offline state)
    const unassignedLocal = currentLocal.filter((t) => !t.userId);
    if (unassignedLocal.length > 0) {
      await Promise.allSettled(
        unassignedLocal.map((task) =>
          saveTaskToDb({ ...task, userId }, userId)
        )
      );
    }

    // Abort if another reconcile started or user logged out/switched while saving
    if (currentGen !== reconcileGeneration || useTaskStore.getState().user?.id !== userId) {
      return null;
    }

    // 2. Fetch all cloud tasks from TablesDB
    const cloudTasks = await fetchUserTasksFromDb(userId);

    // Abort if another reconcile started or user logged out/switched while fetching
    if (currentGen !== reconcileGeneration || useTaskStore.getState().user?.id !== userId) {
      return null;
    }

    // 3. Merge local + cloud tasks
    const cloudMap = new Map<string, Task>();
    cloudTasks.forEach((ct) => cloudMap.set(ct.id, ct));

    const mergedMap = new Map<string, Task>();

    // Process local tasks
    currentLocal.forEach((lt) => {
      // NEVER claim tasks belonging to another account
      if (lt.userId && lt.userId !== userId) {
        return;
      }
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

    // Final guard before updating store
    if (currentGen !== reconcileGeneration || useTaskStore.getState().user?.id !== userId) {
      return null;
    }

    setTasks(mergedList);
    setLastSyncedAt(Date.now());
    return mergedList;
  } catch (err) {
    console.warn('[Sync] Reconcile error:', err);
    return null;
  } finally {
    if (currentGen === reconcileGeneration) {
      setIsSyncing(false);
    }
  }
}

/**
 * Root orchestrator hook that runs active background synchronization.
 * MUST be mounted only once at the top-level layout (TasksLayoutClient).
 */
export function useTaskSyncSubscription() {
  const user = useTaskStore((s) => s.user);
  const tasks = useTaskStore((s) => s.tasks);

  const isInitialSyncRef = useRef(false);
  const prevTasksRef = useRef<Task[]>(tasks);
  const pendingTaskIdsRef = useRef<Set<string>>(new Set());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger reconciliation when user logs in
  useEffect(() => {
    if (!user?.id) return;
    if (isInitialSyncRef.current) return;
    isInitialSyncRef.current = true;

    performReconcile(user.id)
      .then((merged) => {
        if (merged) {
          prevTasksRef.current = merged;
        }
      })
      .finally(() => {
        isInitialSyncRef.current = false;
      });
  }, [user?.id]);

  // Subscribe to subsequent task changes and sync to TablesDB in background
  useEffect(() => {
    if (!user?.id) {
      prevTasksRef.current = tasks;
      return;
    }

    const prevTasks = prevTasksRef.current;
    prevTasksRef.current = tasks;

    // Do not sync during initial migration pull to avoid loops
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
    currentMap.forEach((currentTask, id) => {
      const prev = prevMap.get(id);
      if (!prev || prev.updatedAt !== currentTask.updatedAt) {
        pendingTaskIdsRef.current.add(id);
      }
    });

    // Immediately delete removed tasks from TablesDB
    if (deletedTasks.length > 0) {
      deletedTasks.forEach((dt) => {
        pendingTaskIdsRef.current.delete(dt.id);
        deleteTaskFromDb(dt.id).catch((err) =>
          console.warn(`[Sync] Failed to delete task ${dt.id}:`, err)
        );
      });
    }

    // Debounce pushing accumulated changed or added tasks
    if (pendingTaskIdsRef.current.size > 0) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        const taskIdsToSync = Array.from(pendingTaskIdsRef.current);
        pendingTaskIdsRef.current.clear();

        const latestTasks = useTaskStore.getState().tasks;
        const tasksToSave = latestTasks.filter((t) => taskIdsToSync.includes(t.id));

        if (tasksToSave.length === 0) return;

        const { setIsSyncing, setLastSyncedAt } = useTaskStore.getState();
        setIsSyncing(true);
        try {
          const results = await Promise.allSettled(
            tasksToSave.map((ct) => saveTaskToDb(ct, user.id))
          );

          // Check if any fresh ID was returned due to permission conflict
          const idRemaps = new Map<string, string>();
          results.forEach((res, idx) => {
            if (res.status === 'fulfilled' && res.value !== tasksToSave[idx].id) {
              idRemaps.set(tasksToSave[idx].id, res.value);
            }
          });

          if (idRemaps.size > 0) {
            const currentTasks = useTaskStore.getState().tasks;
            useTaskStore.getState().setTasks(
              currentTasks.map((t) => {
                const remappedId = idRemaps.get(t.id);
                return remappedId ? { ...t, id: remappedId } : t;
              })
            );
          }

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
  }, [tasks, user?.id]);
}

/**
 * Hook for consuming sync status and manual sync trigger.
 * Safe to call in any component without triggering duplicate background sync loops.
 */
export function useTaskSync() {
  const isSyncing = useTaskStore((s) => s.isSyncing);
  const lastSyncedAt = useTaskStore((s) => s.lastSyncedAt);
  const user = useTaskStore((s) => s.user);

  const syncNow = useCallback(() => {
    if (user?.id) {
      return performReconcile(user.id).then(() => {});
    }
    return Promise.resolve();
  }, [user]);

  return {
    isSyncing,
    lastSyncedAt,
    syncNow,
  };
}
