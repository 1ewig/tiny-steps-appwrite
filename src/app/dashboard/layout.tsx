import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Account & Sync',
  description: 'View your account and Appwrite TablesDB cloud sync status.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
