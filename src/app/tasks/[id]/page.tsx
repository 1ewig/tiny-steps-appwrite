import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TaskWorkspaceClient } from '@/components/task-workspace-client';

export const instant = false;

export const metadata: Metadata = {
  title: 'Task Workspace — Tiny Steps',
  description: 'Your gentle, living task checklist.',
};

async function TaskContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TaskWorkspaceClient sessionId={id} />;
}

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center text-text-tertiary">
          <span className="w-6 h-6 rounded-full bg-accent/20 orb-pulse flex items-center justify-center text-xs">
            🌱
          </span>
        </div>
      }
    >
      <TaskContent params={params} />
    </Suspense>
  );
}
