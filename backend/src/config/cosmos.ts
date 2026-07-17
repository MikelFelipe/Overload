import { CosmosClient } from '@azure/cosmos';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { Agent } from 'https';

// Keep the local secrets file at the repository root for both ts-node and dist builds.
dotenv.config({ path: resolve(__dirname, '../../../.env') });

const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;
const databaseId = process.env.COSMOS_DATABASE!;

if (!endpoint || !key || !databaseId) {
  throw new Error('COSMOS_ENDPOINT, COSMOS_KEY, and COSMOS_DATABASE must be set in .env');
}

const isLocalEmulator = new URL(endpoint).hostname === 'localhost';

const client = new CosmosClient({
  endpoint,
  key,
  connectionPolicy: { enableEndpointDiscovery: false },
  // The emulator presents a self-signed local certificate. Never disable TLS
  // validation for a remote Cosmos endpoint.
  agent: isLocalEmulator
    ? new Agent({ rejectUnauthorized: false })
    : undefined,
});

const database = client.database(databaseId);
export const usersContainer = database.container('Users');
export const pendingRegistrationsContainer = database.container('PendingRegistrations');
export const authChallengesContainer = database.container('AuthChallenges');
export const splitsContainer = database.container('WorkoutSplits');
export const logsContainer = database.container('SessionLogs');

export const initDatabase = async () => {
  const { database: db } = await client.databases.createIfNotExists({ id: databaseId });
  await db.containers.createIfNotExists({ id: 'Users', partitionKey: '/userId' });
  await db.containers.createIfNotExists({ id: 'PendingRegistrations', partitionKey: '/partitionKey', defaultTtl: -1 });
  await db.containers.createIfNotExists({ id: 'AuthChallenges', partitionKey: '/partitionKey', defaultTtl: -1 });
  await db.containers.createIfNotExists({ id: 'WorkoutSplits', partitionKey: '/userId' });
  await db.containers.createIfNotExists({ id: 'SessionLogs', partitionKey: '/userId' });
  console.log('Cosmos DB containers are ready (emulator)');
};

export default client;
