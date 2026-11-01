const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo so workspace packages are watched and bundled
config.watchFolders = [monorepoRoot];

// 2. Resolve packages from mobile app node_modules, then monorepo root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Make sure Metro resolves symlinks correctly
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
