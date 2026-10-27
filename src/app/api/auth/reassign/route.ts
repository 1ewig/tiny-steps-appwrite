import { NextRequest, NextResponse } from 'next/server';
import { Query, Permission, Role } from 'node-appwrite';
import { getServerTablesDB } from '@/lib/appwrite/server';
import { APPWRITE_CONFIG } from '@/lib/appwrite/config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fromUserId, toUserId } = body || {};

    if (!fromUserId || !toUserId || typeof fromUserId !== 'string' || typeof toUserId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid fromUserId or toUserId' },
        { status: 400 }
      );
    }

    if (!process.env.APPWRITE_API_KEY) {
      // In environments without server API key, client-side reconciliation claims and upserts the tasks
      return NextResponse.json({
        ok: true,
        note: 'Server API key absent; migration handled via client reconciliation',
      });
    }

    const serverTablesDB = getServerTablesDB();
    const DB_ID = APPWRITE_CONFIG.databaseId;
    const TASKS_TABLE = APPWRITE_CONFIG.tables.tasks;
    const STEPS_TABLE = APPWRITE_CONFIG.tables.steps;

    // 1. Fetch all tasks belonging to fromUserId
    const tasksRes = await serverTablesDB.listRows({
      databaseId: DB_ID,
      tableId: TASKS_TABLE,
      queries: [Query.equal('userId', fromUserId)],
    });

    if (tasksRes.rows.length === 0) {
      return NextResponse.json({ ok: true, migratedCount: 0 });
    }

    const newPermissions = [
      Permission.read(Role.user(toUserId)),
      Permission.update(Role.user(toUserId)),
      Permission.delete(Role.user(toUserId)),
    ];

    // 2. Reassign each task and its steps with the new owner's RLS permissions
    for (const taskRow of tasksRes.rows) {
      await serverTablesDB.updateRow({
        databaseId: DB_ID,
        tableId: TASKS_TABLE,
        rowId: taskRow.$id,
        data: {
          userId: toUserId,
        },
        permissions: newPermissions,
      });

      // Update steps for this task
      try {
        const stepsRes = await serverTablesDB.listRows({
          databaseId: DB_ID,
          tableId: STEPS_TABLE,
          queries: [Query.equal('taskId', taskRow.$id)],
        });

        for (const stepRow of stepsRes.rows) {
          await serverTablesDB.updateRow({
            databaseId: DB_ID,
            tableId: STEPS_TABLE,
            rowId: stepRow.$id,
            permissions: newPermissions,
          });
        }
      } catch (stepErr) {
        console.warn(`[Reassign API] Failed updating steps for task ${taskRow.$id}:`, stepErr);
      }
    }

    return NextResponse.json({ ok: true, migratedCount: tasksRes.rows.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Migration failed';
    console.error('[Reassign API] Error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
