import type { Metadata } from 'next';
import { StartClient } from '@/components/start/start-client';

export const instant = false;

export const metadata: Metadata = {
  title: 'Start a Gentle Task',
  description: 'Tell me what feels heavy right now. Break down avoidance and burnout into microscopic, zero-guilt steps.',
  alternates: {
    canonical: '/tasks',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TasksPage() {
  return <StartClient />;
}
