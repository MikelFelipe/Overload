"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = exports.logsContainer = exports.splitsContainer = exports.authChallengesContainer = exports.pendingRegistrationsContainer = exports.usersContainer = void 0;
const cosmos_1 = require("@azure/cosmos");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
const https_1 = require("https");
// Keep the local secrets file at the repository root for both ts-node and dist builds.
dotenv_1.default.config({ path: (0, path_1.resolve)(__dirname, '../../../.env') });
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE;
if (!endpoint || !key || !databaseId) {
    throw new Error('COSMOS_ENDPOINT, COSMOS_KEY, and COSMOS_DATABASE must be set in .env');
}
const isLocalEmulator = new URL(endpoint).hostname === 'localhost';
const client = new cosmos_1.CosmosClient({
    endpoint,
    key,
    connectionPolicy: { enableEndpointDiscovery: false },
    // The emulator presents a self-signed local certificate. Never disable TLS
    // validation for a remote Cosmos endpoint.
    agent: isLocalEmulator
        ? new https_1.Agent({ rejectUnauthorized: false })
        : undefined,
});
const database = client.database(databaseId);
exports.usersContainer = database.container('Users');
exports.pendingRegistrationsContainer = database.container('PendingRegistrations');
exports.authChallengesContainer = database.container('AuthChallenges');
exports.splitsContainer = database.container('WorkoutSplits');
exports.logsContainer = database.container('SessionLogs');
const initDatabase = async () => {
    const { database: db } = await client.databases.createIfNotExists({ id: databaseId });
    await db.containers.createIfNotExists({ id: 'Users', partitionKey: '/userId' });
    await db.containers.createIfNotExists({ id: 'PendingRegistrations', partitionKey: '/partitionKey', defaultTtl: -1 });
    await db.containers.createIfNotExists({ id: 'AuthChallenges', partitionKey: '/partitionKey', defaultTtl: -1 });
    await db.containers.createIfNotExists({ id: 'WorkoutSplits', partitionKey: '/userId' });
    await db.containers.createIfNotExists({ id: 'SessionLogs', partitionKey: '/userId' });
    console.log('Cosmos DB containers are ready (emulator)');
};
exports.initDatabase = initDatabase;
exports.default = client;
