const { getDefaultConfig } = require('expo/metro-config');

// Expo auto-detects the npm workspaces root and configures watchFolders /
// nodeModulesPaths accordingly (SDK 52+) — this file just makes that explicit.
module.exports = getDefaultConfig(__dirname);
