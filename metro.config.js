const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add better error handling for anonymous files
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

// Use the default transformer (don't override it)
// config.transformer.babelTransformerPath is already set by getDefaultConfig

// Add source extensions if not already present
const sourceExts = [...config.resolver.sourceExts];
if (!sourceExts.includes('js')) sourceExts.push('js');
if (!sourceExts.includes('jsx')) sourceExts.push('jsx');
if (!sourceExts.includes('ts')) sourceExts.push('ts');
if (!sourceExts.includes('tsx')) sourceExts.push('tsx');

config.resolver.sourceExts = sourceExts;

// Add resolver alias to help with path issues
config.resolver.alias = {
  'react-native': 'react-native',
};

module.exports = config;