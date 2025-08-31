const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add the browser field to the resolver
config.resolver.resolverMainFields = ['browser', 'main'];

module.exports = config;