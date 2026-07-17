#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { generateDocs } = require('./generate-docs');

const rootDir = path.resolve(__dirname, '..');
const watchRoots = [path.join(rootDir, 'backend'), path.join(rootDir, 'frontend', 'src'), path.join(rootDir, 'frontend', 'public'), path.join(rootDir, 'scripts'), path.join(rootDir, 'package.json'), path.join(rootDir, 'README.md')];

function shouldIgnore(name) {
  return name.startsWith('.') || name === 'build' || name === 'node_modules' || name === 'docs-state.json' || name === 'Overload_Documentation.md';
}

function watchDirectory(dirPath) {
  try {
    fs.watch(dirPath, { persistent: true }, (eventType, filename) => {
      if (!filename) return;
      const name = filename.toString();
      if (shouldIgnore(name)) return;
      console.log(`[docs] ${eventType}: ${name}`);
      generateDocs();
    });
  } catch (error) {
    console.warn(`[docs] Unable to watch ${dirPath}: ${error.message}`);
  }
}

function walkDirectories(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const fullPath = path.join(dirPath, entry.name);
    if (['.git', 'node_modules', 'backend/dist', 'frontend/build', 'frontend/coverage'].includes(entry.name)) continue;
    watchDirectory(fullPath);
    walkDirectories(fullPath);
  }
}

function main() {
  generateDocs();
  for (const watchRoot of watchRoots) {
    if (fs.existsSync(watchRoot)) {
      if (fs.statSync(watchRoot).isDirectory()) {
        watchDirectory(watchRoot);
        walkDirectories(watchRoot);
      } else {
        watchDirectory(path.dirname(watchRoot));
      }
    }
  }
  console.log('[docs] Watching for source changes. Press Ctrl+C to stop.');
}

main();
