import type { Metadata } from 'next';
import { TaskBreakdownClient } from '@/components/task-breakdown/task-breakdown-client';

export const instant = false;

export const metadata: Metadata = {
  title: 'Task Breakdown',
  description: 'Your gentle, living task checklist.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TaskBreakdownClient taskId={id} />;
}
