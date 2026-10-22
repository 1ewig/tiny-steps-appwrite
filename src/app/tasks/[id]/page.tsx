import type { Metadata } from 'next';
import { TaskWorkspaceClient } from '@/components/task-workspace-client';

export const instant = false;

export const metadata: Metadata = {
  title: 'Task Workspace — Tiny Steps',
  description: 'Your gentle, living task checklist.',
};

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TaskWorkspaceClient sessionId={id} />;
}
