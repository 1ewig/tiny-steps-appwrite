import { Query, ID } from 'appwrite';
import { getBrowserTablesDB } from './client';
import { APPWRITE_CONFIG } from './config';
import type { Task, Step, EnergyLevel } from '@/types/task';

const DB_ID = APPWRITE_CONFIG.databaseId;
const TASKS_TABLE = APPWRITE_CONFIG.tables.tasks;
const STEPS_TABLE = APPWRITE_CONFIG.tables.steps;

/**
 * Saves or updates a task and its steps in Appwrite TablesDB.
 */
export async function saveTaskToDb(task: Task, userId: string): Promise<void> {
  const tablesDB = getBrowserTablesDB();

  // 1. Upsert the task row
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
  });

  // 2. Fetch existing step rows for this task
  const existingSteps = await tablesDB.listRows({
    databaseId: DB_ID,
    tableId: STEPS_TABLE,
    queries: [Query.equal('taskId', task.id)],
  });

  // 3. Remove old step rows to avoid orphaned or duplicated steps
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

  // 4. Insert current steps
  if (task.steps && task.steps.length > 0) {
    await Promise.all(
      task.steps.map((st, index) => {
        const subStepsStr = st.subSteps ? JSON.stringify(st.subSteps) : '[]';
        return tablesDB.createRow({
          databaseId: DB_ID,
          tableId: STEPS_TABLE,
          rowId: ID.unique(),
          data: {
            taskId: task.id,
            title: (st.title || st.text || 'Step').slice(0, 255),
            instruction: (st.instruction || '').slice(0, 500),
            completed: Boolean(st.completed),
            order: index + 1,
            canSplit: st.canSplit ?? true,
            subSteps: subStepsStr.slice(0, 5000),
          },
        });
      })
    );
  }
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

        steps = stepsResponse.rows.map((stRow: any, idx: number) => {
          let subSteps: Step[] | undefined = undefined;
          if (stRow.subSteps) {
            try {
              const parsed = JSON.parse(stRow.subSteps);
              if (Array.isArray(parsed) && parsed.length > 0) {
                subSteps = parsed;
              }
            } catch {
              subSteps = undefined;
            }
          }

          return {
            id: stRow.order ?? idx + 1,
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
