#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = path.resolve(__dirname, '..');
const docsPath = path.join(rootDir, 'Overload_Documentation.md');
const statePath = path.join(rootDir, 'scripts', 'docs-state.json');
const manualStart = '<!-- MANUAL SECTION START -->';
const manualEnd = '<!-- MANUAL SECTION END -->';
const ignoredDirs = new Set(['.git', 'node_modules', 'backend/dist', 'frontend/build', 'frontend/coverage', 'frontend/node_modules', 'backend/node_modules']);
const ignoredFiles = new Set(['Overload_Documentation.md', 'scripts/docs-state.json']);

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function walkFiles(dirPath, files = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = normalizePath(path.relative(rootDir, fullPath));
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name) || ignoredDirs.has(relPath)) continue;
      walkFiles(fullPath, files);
      continue;
    }
    if (ignoredFiles.has(relPath)) continue;
    files.push(relPath);
  }
  return files.sort();
}

function sha1(value) {
  return crypto.createHash('sha1').update(value).digest('hex');
}

function snapshotFiles(files) {
  const snapshot = {};
  for (const relPath of files) {
    const absPath = path.join(rootDir, relPath);
    const stats = fs.statSync(absPath);
    snapshot[relPath] = {
      size: stats.size,
      modifiedAt: stats.mtime.toISOString(),
      hash: sha1(readText(absPath)),
    };
  }
  return snapshot;
}

function parsePackage(filePath) {
  try {
    const pkg = JSON.parse(readText(filePath));
    return {
      name: pkg.name || path.basename(path.dirname(filePath)),
      version: pkg.version || 'unknown',
      dependencies: Object.keys(pkg.dependencies || {}),
      devDependencies: Object.keys(pkg.devDependencies || {}),
      scripts: Object.keys(pkg.scripts || {}),
    };
  } catch {
    return null;
  }
}

function extractSymbols(filePath) {
  const content = readText(filePath);
  const symbols = [];
  const symbolRegex = /export\s+(?:const|class|function|interface|type)\s+([A-Za-z0-9_]+)/g;
  let match;
  while ((match = symbolRegex.exec(content)) !== null) {
    symbols.push(match[1]);
  }
  return symbols;
}

function extractRoutes(filePath) {
  const content = readText(filePath);
  const routes = [];
  const routeRegex = /router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g;
  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    routes.push({ method: match[1].toUpperCase(), path: match[2] });
  }
  return routes;
}

function extractEnvVars(filePath) {
  const content = readText(filePath);
  return Array.from(content.matchAll(/^([A-Z0-9_]+)=/gm)).map((match) => match[1]);
}

function buildArchitectureDiagram() {
  return [
    '```mermaid',
    'flowchart TD',
    '  U[User] --> FE[React Frontend]',
    '  FE --> BE[Express Backend]',
    '  BE --> DB[(Azure Cosmos DB)]',
    '  BE --> SMTP[SMTP / Email Service]',
    '  FE --> Auth[Auth Pages & Context]',
    '  BE --> JWT[JWT Session Cookie]',
    '```',
  ].join('\n');
}

function buildAuthDiagram() {
  return [
    '```mermaid',
    'sequenceDiagram',
    '  actor User',
    '  participant FE as Frontend',
    '  participant BE as Backend',
    '  participant DB as Cosmos DB',
    '  participant Mail as SMTP',
    '  User->>FE: Register / Login',
    '  FE->>BE: Submit credentials',
    '  BE->>DB: Validate user / pending registration',
    '  BE->>Mail: Send verification or OTP',
    '  Mail-->>User: Email with link/code',
    '  User->>FE: Complete verification',
    '  FE->>BE: Verify token / OTP',
    '  BE->>DB: Activate account / issue session',
    '```',
  ].join('\n');
}

function buildDataModelDiagram() {
  return [
    '```mermaid',
    'erDiagram',
    '  User ||--o{ AuthChallenge : receives',
    '  PendingRegistration ||--o| User : becomes',
    '  User {',
    '    string userId',
    '    string email',
    '    string passwordHash',
    '    bool emailVerified',
    '    int failedLoginCount',
    '  }',
    '  PendingRegistration {',
    '    string email',
    '    string verificationTokenHash',
    '    string verificationTokenExpiresAt',
    '  }',
    '  AuthChallenge {',
    '    string email',
    '    string codeHash',
    '    bool used',
    '  }',
    '```',
  ].join('\n');
}

function buildFolderTree(files) {
  const tree = [];
  for (const relPath of files) {
    const parts = relPath.split('/');
    let current = tree;
    for (let index = 0; index < parts.length; index += 1) {
      const part = parts[index];
      const isFile = index === parts.length - 1;
      if (!current.some((entry) => entry.name === part)) {
        current.push(isFile ? { name: part, type: 'file' } : { name: part, type: 'dir', children: [] });
      }
      const entry = current.find((item) => item.name === part);
      if (!isFile) current = entry.children;
    }
  }
  const render = (entries, indent = '') => entries.map((entry) => `${indent}- ${entry.name}${entry.type === 'dir' ? '/' : ''}${entry.type === 'dir' ? '\n' + render(entry.children, indent + '  ') : ''}`).join('');
  return render(tree);
}

function buildChangeLog(previousState, currentState) {
  if (!previousState || Object.keys(previousState).length === 0) {
    return [];
  }
  const events = [];
  const previousPaths = new Set(Object.keys(previousState));
  const currentPaths = new Set(Object.keys(currentState));

  for (const relPath of Array.from(currentPaths).filter((pathName) => !previousPaths.has(pathName))) {
    events.push({ type: 'Created', path: relPath, summary: 'New file introduced in the codebase.' });
  }

  for (const relPath of Array.from(previousPaths).filter((pathName) => !currentPaths.has(pathName))) {
    events.push({ type: 'Deleted', path: relPath, summary: 'File removed from the repository.' });
  }

  for (const relPath of Array.from(currentPaths).filter((pathName) => previousPaths.has(pathName))) {
    const prev = previousState[relPath];
    const curr = currentState[relPath];
    if (!prev || prev.hash !== curr.hash || prev.modifiedAt !== curr.modifiedAt) {
      events.push({ type: 'Updated', path: relPath, summary: 'File content or metadata changed.' });
    }
  }

  return events.sort((left, right) => left.path.localeCompare(right.path)).slice(0, 20);
}

function inferKnownIssues(files) {
  const issues = [];
  if (files.includes('backend/src/config/cosmos.ts')) {
    issues.push('Cosmos DB requires a configured emulator or cloud endpoint and credentials before backend startup.');
  }
  if (files.includes('frontend/src/pages/Dashboard.tsx')) {
    issues.push('The dashboard currently contains placeholder cards for an active split and nearby gyms.');
  }
  if (files.includes('frontend/src/App.test.tsx')) {
    issues.push('The test suite is minimal and focuses on the unauthenticated login screen.');
  }
  if (!files.some((filePath) => filePath.includes('backend/src/services/'))) {
    issues.push('No additional backend services were detected beyond authentication.');
  }
  return issues;
}

function readExistingManualContent() {
  if (!fs.existsSync(docsPath)) return '';
  const content = readText(docsPath);
  const pattern = new RegExp(`${manualStart}([\\s\\S]*?)${manualEnd}`);
  const match = content.match(pattern);
  return match ? match[1].trim() : '';
}

function buildDocumentation(files, currentState, previousState) {
  const backendPackage = parsePackage(path.join(rootDir, 'backend', 'package.json'));
  const frontendPackage = parsePackage(path.join(rootDir, 'frontend', 'package.json'));
  const envVars = [
    ...extractEnvVars(path.join(rootDir, '.env')).map((name) => ({ file: '.env', name })),
    ...extractEnvVars(path.join(rootDir, 'frontend', '.env')).map((name) => ({ file: 'frontend/.env', name })),
  ];
  const authServiceSymbols = extractSymbols(path.join(rootDir, 'backend/src/services/auth.service.ts'));
  const backendRoutes = files.filter((filePath) => filePath.startsWith('backend/src/routes/')).flatMap((filePath) => extractRoutes(path.join(rootDir, filePath)));
  const knownIssues = inferKnownIssues(files);
  const changeLog = buildChangeLog(previousState, currentState);
  const manualContent = readExistingManualContent() || 'Add your custom notes here.';
  const timestamp = new Date().toISOString();

  return `# Overload Documentation

- Project name: Overload
- Last generated: ${timestamp}
- Last updated: ${timestamp}
- Documentation version: 1.0.0

## Project Overview

Overload is a full-stack authentication-focused web app with a React frontend and an Express backend backed by Azure Cosmos DB. The current implementation provides account registration, email verification, OTP-based sign-in, and a protected dashboard shell.

## System Architecture

${buildArchitectureDiagram()}

### Architecture Notes
- The frontend is a React + TypeScript SPA that routes users through login, registration, verification, OTP, and dashboard screens.
- The backend exposes auth routes and stores user data in Azure Cosmos DB while issuing JWT-backed session cookies.
- Email delivery uses nodemailer with a development fallback to JSON transport when SMTP is not configured.

## Technology Stack

- Node.js / TypeScript
- Express.js
- React 19 + TypeScript
- React Router
- Tailwind CSS
- Azure Cosmos DB SDK
- Argon2 password hashing
- Nodemailer and JWT

### Backend dependencies
- ${backendPackage?.dependencies?.join(', ') || 'N/A'}

### Frontend dependencies
- ${frontendPackage?.dependencies?.join(', ') || 'N/A'}

## Folder and File Structure

${buildFolderTree(files)}

## Database Configuration and Schema

The backend uses Azure Cosmos DB via the Cosmos client in [backend/src/config/cosmos.ts](backend/src/config/cosmos.ts). The configured database is expected to be available through the emulator or a reachable Azure account.

### Containers
- Users: stores user account records, email verification flags, and lockout state.
- PendingRegistrations: stores short-lived unverified registration data.
- AuthChallenges: stores one-time password challenge records.
- WorkoutSplits and SessionLogs: reserved for future workout-domain data.

### Data models
- [backend/src/models/user.model.ts](backend/src/models/user.model.ts) defines the 'User' and 'PendingRegistration' shapes.
- 'User' includes fields such as 'userId', 'email', 'passwordHash', 'emailVerified', 'failedLoginCount', and optional lockout metadata.
- 'PendingRegistration' includes the email, name, phone number, password hash, verification token hash, and expiry timestamps.

${buildDataModelDiagram()}

## Authentication and Authorization Flow

${buildAuthDiagram()}

### Current flow
1. The user registers with first and last name, email, phone number, and password.
2. A pending registration is created and a verification email is sent.
3. The verification link activates the account and writes the verified user record to Cosmos DB.
4. The user logs in with email and password, then completes OTP verification.
5. A JWT is issued in an HTTP-only cookie for protected routes.

### Security controls implemented
- Argon2id password hashing
- Email verification before activation
- OTP expiry and resend limits
- Account lockout after repeated failed login attempts
- HTTP-only and same-site session cookies

## API Endpoints and Routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | /api/health | Health check |
| POST | /api/auth/register | Create a pending registration and send a verification email |
| GET | /api/auth/verify | Verify an email token and activate the account |
| POST | /api/auth/verification/resend | Resend a verification email |
| POST | /api/auth/login | Validate credentials and send an OTP |
| POST | /api/auth/otp/verify | Validate OTP and issue a session cookie |
| POST | /api/auth/otp/resend | Resend the OTP |
| GET | /api/auth/session | Return the authenticated user |
| POST | /api/auth/logout | Clear the session cookie |

The route definitions are derived from [backend/src/routes/auth.routes.ts](backend/src/routes/auth.routes.ts).

## Frontend Pages, Layouts, and Components

### Pages
- [frontend/src/pages/Login.tsx](frontend/src/pages/Login.tsx): login page with password visibility and navigation to OTP.
- [frontend/src/pages/Register.tsx](frontend/src/pages/Register.tsx): two-step registration flow with client validation.
- [frontend/src/pages/Verify.tsx](frontend/src/pages/Verify.tsx): verification page and resend flow.
- [frontend/src/pages/Otp.tsx](frontend/src/pages/Otp.tsx): OTP entry and resend UI.
- [frontend/src/pages/Dashboard.tsx](frontend/src/pages/Dashboard.tsx): authenticated dashboard shell.

### Shared abstractions
- [frontend/src/components/PrivateRoute.tsx](frontend/src/components/PrivateRoute.tsx): guards protected routes.
- [frontend/src/context/AuthContext.tsx](frontend/src/context/AuthContext.tsx): central authentication state provider.
- [frontend/src/api/auth.ts](frontend/src/api/auth.ts) and [frontend/src/api/client.ts](frontend/src/api/client.ts): auth API wrappers.

## Backend Services and Business Logic

- [backend/src/services/auth.service.ts](backend/src/services/auth.service.ts) exposes the registration, verification, login, OTP, and lockout logic. The implementation currently includes: ${authServiceSymbols.join(', ')}.
- [backend/src/middleware/auth.middleware.ts](backend/src/middleware/auth.middleware.ts) validates the JWT session cookie.
- [backend/src/config/cosmos.ts](backend/src/config/cosmos.ts) initializes the Cosmos DB containers used by the app.

## Environment Variables

| Variable | Source | Notes |
| --- | --- | --- |
| PORT | [.env](.env) | Backend local development port |
| COSMOS_ENDPOINT | [.env](.env) | Cosmos DB endpoint |
| COSMOS_KEY | [.env](.env) | Cosmos DB access key |
| COSMOS_DATABASE | [.env](.env) | Cosmos DB database name |
| JWT_SECRET | [.env](.env) | JWT signing secret |
| GOOGLE_PLACES_API_KEY | [.env](.env) | Placeholder for future location integrations |
| WGER_API_BASE | [.env](.env) | Placeholder for future WGER data integration |

## External Integrations

- Azure Cosmos DB via the @azure/cosmos SDK
- Nodemailer SMTP transport with development fallback
- jsonwebtoken for signed session tokens
- argon2 for password hashing
- axios for frontend-to-backend requests

## Build and Deployment Process

### Local development
- Root: \`npm run dev\`
- Backend: \`npm --prefix backend run dev\`
- Frontend: \`npm --prefix frontend run start\`

### Production build
- Backend: \`npm --prefix backend run build\`
- Frontend: \`npm --prefix frontend run build\`

## Current Features

- Two-step registration flow
- Email verification before account activation
- OTP-based MFA sign-in
- Password visibility toggles and validation
- Protected dashboard route and authenticated session handling

## Known Issues, Limitations, and TODOs

- ${knownIssues.join('\n- ')}
- The current codebase does not yet expose workout-domain data beyond placeholder dashboard content.

## Documentation Maintenance

### How documentation generation works
- Run \`npm run docs:generate\` to regenerate the file from the repository snapshot.
- Run \`npm run docs:watch\` to monitor the workspace and refresh the document automatically.

### How automatic updates work
- The generator stores file snapshots in [scripts/docs-state.json](scripts/docs-state.json) and compares them on future runs.
- The change log section is refreshed from create/update/delete activity.

### How to add manual sections
- Insert custom content between the manual markers below. These sections are preserved across regeneration.

${manualStart}
${manualContent}
${manualEnd}

## Change Log

| File path | Change type | Timestamp | Summary |
| --- | --- | --- | --- |
${changeLog.length ? changeLog.map((entry) => `| ${entry.path} | ${entry.type} | ${timestamp} | ${entry.summary} |`).join('\n') : '| None | None | - | No changes detected. |'}
`;
}

function writeDocumentation(content) {
  fs.writeFileSync(docsPath, content, 'utf8');
}

function loadState() {
  if (!fs.existsSync(statePath)) return {};
  try {
    return JSON.parse(readText(statePath));
  } catch {
    return {};
  }
}

function saveState(snapshot) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(snapshot, null, 2), 'utf8');
}

function generateDocs() {
  const files = walkFiles(rootDir);
  const currentState = snapshotFiles(files);
  const previousState = loadState().files || {};
  const content = buildDocumentation(files, currentState, previousState);
  writeDocumentation(content);
  saveState({ generatedAt: new Date().toISOString(), files: currentState });
  return content;
}

if (require.main === module) {
  generateDocs();
  console.log(`Documentation generated at ${normalizePath(path.relative(rootDir, docsPath))}`);
}

module.exports = { generateDocs };
