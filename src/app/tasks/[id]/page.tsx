import type { Metadata } from 'next';
import { TaskBreakdownClient } from '@/components/task-breakdown/task-breakdown-client';

export const instant = false;

export const metadata: Metadata = {
  title: 'Task Breakdown — Tiny Steps',
  description: 'Your gentle, living task checklist.',
};

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TaskBreakdownClient taskId={id} />;
}
