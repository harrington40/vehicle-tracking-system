const { getDefaultConfig } = require('expo/metro-config');
 

const config = getDefaultConfig(__dirname);

// Add better error handling for anonymous files
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

// Add source extensions if not already present
const sourceExts = [...config.resolver.sourceExts];
if (!sourceExts.includes('js')) sourceExts.push('js');
if (!sourceExts.includes('jsx')) sourceExts.push('jsx');
if (!sourceExts.includes('ts')) sourceExts.push('ts');
if (!sourceExts.includes('tsx')) sourceExts.push('tsx');
config.resolver.sourceExts = sourceExts;

// Optional alias passthrough
config.resolver.alias = {
  'react-native': 'react-native',
};

// Web-only alias for react-native-maps -> shim
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      type: 'sourceFile',
      filePath: require.resolve('./shims/react-native-maps.web.js'),
    };
  }
  return originalResolveRequest
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;