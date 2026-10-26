import {
  Client as ServerClient,
  TablesDB as ServerTablesDB,
  Databases as ServerDatabases,
} from 'node-appwrite';
import { APPWRITE_CONFIG } from './config';

// Server-side admin instances (using API key)
export function getServerTablesDB(): ServerTablesDB {
  const client = new ServerClient()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

  if (APPWRITE_CONFIG.apiKey) {
    client.setKey(APPWRITE_CONFIG.apiKey);
  }

  return new ServerTablesDB(client);
}

export function getServerDatabases(): ServerDatabases {
  const client = new ServerClient()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

  if (APPWRITE_CONFIG.apiKey) {
    client.setKey(APPWRITE_CONFIG.apiKey);
  }

  return new ServerDatabases(client);
}
