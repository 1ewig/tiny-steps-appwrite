import type { Metadata } from 'next';
import { TasksLayoutClient } from '@/components/shared/layout/tasks-layout-client';

export const instant = false;

export const metadata: Metadata = {
  title: 'Tiny Steps — Low-Friction AI Task Companion',
  description: 'Empathetic, zero-pressure task breakdown for ADHD paralysis, burnout, and executive dysfunction.',
};

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TasksLayoutClient>{children}</TasksLayoutClient>;
}
