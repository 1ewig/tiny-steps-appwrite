import {
  Client as ServerClient,
  TablesDB as ServerTablesDB,
  Databases as ServerDatabases,
  Users as ServerUsers,
} from 'node-appwrite';
import { APPWRITE_CONFIG } from './config';

const SERVER_API_KEY = process.env.APPWRITE_API_KEY || '';

// Server-side admin instances (using API key)
export function getServerTablesDB(): ServerTablesDB {
  const client = new ServerClient()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

  if (SERVER_API_KEY) {
    client.setKey(SERVER_API_KEY);
  }

  return new ServerTablesDB(client);
}

export function getServerDatabases(): ServerDatabases {
  const client = new ServerClient()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

  if (SERVER_API_KEY) {
    client.setKey(SERVER_API_KEY);
  }

  return new ServerDatabases(client);
}

export function getServerUsers(): ServerUsers {
  const client = new ServerClient()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

  if (SERVER_API_KEY) {
    client.setKey(SERVER_API_KEY);
  }

  return new ServerUsers(client);
}

