const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for monorepo - watch the shared folder
config.watchFolders = [
  __dirname,
  '../shared'
];

module.exports = config;
