export const APPWRITE_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6adcab1e0015bdfc0ac4',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6adcab35002115a2741a',
  tables: {
    tasks: 'tasks',
    steps: 'steps',
  },
} as const;
