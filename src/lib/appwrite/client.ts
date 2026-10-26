import {
  Client as BrowserClient,
  Account,
  TablesDB as BrowserTablesDB,
  Databases as BrowserDatabases,
} from 'appwrite';
import {
  Client as ServerClient,
  TablesDB as ServerTablesDB,
  Databases as ServerDatabases,
} from 'node-appwrite';
import { APPWRITE_CONFIG } from './config';

// Browser / Client-side singleton instances
let browserClient: BrowserClient | null = null;
let browserAccount: Account | null = null;
let browserTablesDB: BrowserTablesDB | null = null;
let browserDatabases: BrowserDatabases | null = null;

export function getBrowserClient(): BrowserClient {
  if (!browserClient) {
    browserClient = new BrowserClient()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);
  }
  return browserClient;
}

export function getAccount(): Account {
  if (!browserAccount) {
    browserAccount = new Account(getBrowserClient());
  }
  return browserAccount;
}

export function getBrowserTablesDB(): BrowserTablesDB {
  if (!browserTablesDB) {
    browserTablesDB = new BrowserTablesDB(getBrowserClient());
  }
  return browserTablesDB;
}

export function getBrowserDatabases(): BrowserDatabases {
  if (!browserDatabases) {
    browserDatabases = new BrowserDatabases(getBrowserClient());
  }
  return browserDatabases;
}

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
