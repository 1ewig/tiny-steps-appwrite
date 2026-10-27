import { Query, ID, Permission, Role } from 'appwrite';
import { getBrowserTablesDB } from './client';
import { APPWRITE_CONFIG } from './config';
import type { Task, Step, EnergyLevel } from '@/types/task';

const DB_ID = APPWRITE_CONFIG.databaseId;
const TASKS_TABLE = APPWRITE_CONFIG.tables.tasks;
const STEPS_TABLE = APPWRITE_CONFIG.tables.steps;

/**
 * Saves or updates a task and its steps in Appwrite TablesDB.
 * Returns the effective task ID persisted in the database without mutating the input object.
 */
export async function saveTaskToDb(task: Task, userId: string): Promise<string> {
  const tablesDB = getBrowserTablesDB();

  // Explicit Row-Level Security (RLS): Only this authenticated user can read, update, or delete
  const rowPermissions = [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];

  let effectiveTaskId = task.id;

  // 1. Upsert the task row with strict RLS permissions
  try {
    await tablesDB.upsertRow({
      databaseId: DB_ID,
      tableId: TASKS_TABLE,
      rowId: task.id,
      data: {
        title: (task.title || 'Untitled task').slice(0, 255),
        prompt: (task.prompt || '').slice(0, 2000),
        guidance: (task.guidance || '').slice(0, 1500),
        energyLevel: task.energyLevel || 2,
        introSeen: Boolean(task.introSeen),
        userId: userId.slice(0, 36),
      },
      permissions: rowPermissions,
    });
  } catch (upsertErr: any) {
    // If permissions denied or ID conflict from an earlier session,
    // generate a fresh ID and create row for the authenticated user without mutating caller's object
    if (upsertErr?.code === 401 || upsertErr?.code === 403) {
      const freshId = 'task_' + Date.now();
      effectiveTaskId = freshId;
      await tablesDB.createRow({
        databaseId: DB_ID,
        tableId: TASKS_TABLE,
        rowId: freshId,
        data: {
          title: (task.title || 'Untitled task').slice(0, 255),
          prompt: (task.prompt || '').slice(0, 2000),
          guidance: (task.guidance || '').slice(0, 1500),
          energyLevel: task.energyLevel || 2,
          introSeen: Boolean(task.introSeen),
          userId: userId.slice(0, 36),
        },
        permissions: rowPermissions,
      });
    } else {
      throw upsertErr;
    }
  }

  // 2. Fetch existing step rows for this task
  const existingSteps = await tablesDB.listRows({
    databaseId: DB_ID,
    tableId: STEPS_TABLE,
    queries: [Query.equal('taskId', effectiveTaskId)],
  });

  // 3. Insert current steps FIRST to protect against data-loss if network drops or insert fails
  if (task.steps && task.steps.length > 0) {
    await Promise.all(
      task.steps.map((st, index) => {
        const safeSubSteps = Array.isArray(st.subSteps)
          ? st.subSteps.slice(0, 5).map((sub, sIdx) => ({
              id: typeof sub.id === 'number' ? sub.id : sIdx + 1,
              title: (sub.title || sub.text || 'Step').slice(0, 255),
              text: (sub.text || sub.title || 'Step').slice(0, 255),
              instruction: (sub.instruction || '').slice(0, 500),
              completed: Boolean(sub.completed),
              canSplit: Boolean(sub.canSplit),
            }))
          : [];
        const subStepsStr = JSON.stringify(safeSubSteps);
        return tablesDB.createRow({
          databaseId: DB_ID,
          tableId: STEPS_TABLE,
          rowId: ID.unique(),
          data: {
            taskId: effectiveTaskId,
            title: (st.title || st.text || 'Step').slice(0, 255),
            instruction: (st.instruction || '').slice(0, 500),
            completed: Boolean(st.completed),
            order: index + 1,
            canSplit: st.canSplit ?? true,
            subSteps: subStepsStr,
          },
          permissions: rowPermissions,
        });
      })
    );
  }

  // 4. Remove old step rows now that current steps are safely persisted
  if (existingSteps.rows.length > 0) {
    await Promise.all(
      existingSteps.rows.map((row) =>
        tablesDB.deleteRow({
          databaseId: DB_ID,
          tableId: STEPS_TABLE,
          rowId: row.$id,
        })
      )
    );
  }

  return effectiveTaskId;
}

/**
 * Deletes a task and its linked steps from Appwrite TablesDB.
 */
export async function deleteTaskFromDb(taskId: string): Promise<void> {
  const tablesDB = getBrowserTablesDB();

  // Delete all steps first
  try {
    const existingSteps = await tablesDB.listRows({
      databaseId: DB_ID,
      tableId: STEPS_TABLE,
      queries: [Query.equal('taskId', taskId)],
    });

    if (existingSteps.rows.length > 0) {
      await Promise.all(
        existingSteps.rows.map((row) =>
          tablesDB.deleteRow({
            databaseId: DB_ID,
            tableId: STEPS_TABLE,
            rowId: row.$id,
          })
        )
      );
    }
  } catch (err) {
    console.warn(`[TablesDB] Could not delete steps for task ${taskId}:`, err);
  }

  // Delete the task row
  try {
    await tablesDB.deleteRow({
      databaseId: DB_ID,
      tableId: TASKS_TABLE,
      rowId: taskId,
    });
  } catch (err) {
    console.warn(`[TablesDB] Could not delete task row ${taskId}:`, err);
  }
}

/**
 * Reassigns tasks and steps in Appwrite TablesDB from an anonymous user ID to a permanent user ID.
 * Calls the server migration API endpoint (which has admin privileges) or falls back gracefully.
 */
export async function reassignGuestTasksInDb(
  fromUserId: string,
  toUserId: string,
  sessionSecret?: string
): Promise<void> {
  if (!fromUserId || !toUserId || fromUserId === toUserId) return;

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionSecret) {
      headers['x-appwrite-session'] = sessionSecret;
    }

    const res = await fetch('/api/auth/reassign', {
      method: 'POST',
      headers,
      body: JSON.stringify({ fromUserId, toUserId }),
    });

    if (!res.ok) {
      console.warn('[Sync] Server reassign returned status:', res.status);
    }
  } catch (err) {
    console.warn('[Sync] Failed to reassign tasks via server route:', err);
  }
}

/**
 * Fetches all tasks and their associated steps for a given user from Appwrite TablesDB.
 */
export async function fetchUserTasksFromDb(userId: string): Promise<Task[]> {
  const tablesDB = getBrowserTablesDB();

  // 1. Query all tasks belonging to userId
  const tasksResponse = await tablesDB.listRows({
    databaseId: DB_ID,
    tableId: TASKS_TABLE,
    queries: [Query.equal('userId', userId), Query.orderDesc('$createdAt')],
  });

  if (tasksResponse.total === 0) {
    return [];
  }

  // 2. Fetch steps for each task
  const tasksWithSteps: Task[] = await Promise.all(
    tasksResponse.rows.map(async (row: any) => {
      let steps: Step[] = [];

      try {
        const stepsResponse = await tablesDB.listRows({
          databaseId: DB_ID,
          tableId: STEPS_TABLE,
          queries: [Query.equal('taskId', row.$id), Query.orderAsc('order')],
        });

        // Deduplicate step rows by order in case previous concurrent syncs created duplicates
        const seenOrders = new Set<number>();
        const uniqueStepRows = stepsResponse.rows.filter((stRow: any) => {
          const ord = typeof stRow.order === 'number' ? stRow.order : null;
          if (ord !== null) {
            if (seenOrders.has(ord)) return false;
            seenOrders.add(ord);
          }
          return true;
        });

        steps = uniqueStepRows.map((stRow: any, idx: number) => {
          let subSteps: Step[] | undefined = undefined;
          if (stRow.subSteps) {
            try {
              const parsed = JSON.parse(stRow.subSteps);
              if (Array.isArray(parsed) && parsed.length > 0) {
                subSteps = parsed.map((s: any, sIdx: number) => ({
                  id: typeof s.id === 'number' ? s.id : sIdx + 1,
                  title: typeof s.title === 'string' ? s.title : 'Micro action',
                  text: typeof s.text === 'string' ? s.text : (s.title || 'Micro action'),
                  instruction: typeof s.instruction === 'string' ? s.instruction : '',
                  completed: Boolean(s.completed),
                  canSplit: Boolean(s.canSplit),
                }));
              }
            } catch {
              subSteps = undefined;
            }
          }

          const stepId = typeof stRow.order === 'number' && stRow.order > 0 ? stRow.order : idx + 1;

          return {
            id: stepId,
            title: stRow.title,
            text: stRow.title,
            instruction: stRow.instruction || '',
            completed: Boolean(stRow.completed),
            canSplit: Boolean(stRow.canSplit),
            subSteps,
          };
        });
      } catch (err) {
        console.warn(`[TablesDB] Failed to fetch steps for task ${row.$id}:`, err);
      }

      const task: Task = {
        id: row.$id,
        title: row.title || 'Untitled task',
        prompt: row.prompt || '',
        guidance: row.guidance || '',
        energyLevel: (row.energyLevel as EnergyLevel) || 2,
        createdAt: Date.parse(row.$createdAt) || Date.now(),
        updatedAt: Date.parse(row.$updatedAt) || Date.now(),
        introSeen: Boolean(row.introSeen),
        userId: row.userId,
        steps,
      };

      return task;
    })
  );

  return tasksWithSteps;
}
