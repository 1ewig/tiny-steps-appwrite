import type { Metadata } from 'next';
import { StartClient } from '@/components/start/start-client';

export const instant = false;

export const metadata: Metadata = {
  title: 'Start a Gentle Task — Tiny Steps',
  description: 'Tell me what feels heavy right now. Break down avoidance and burnout into microscopic, zero-guilt steps.',
};

export default function TasksPage() {
  return <StartClient />;
}
