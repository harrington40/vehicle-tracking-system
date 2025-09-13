import * as fs from 'fs';
import * as path from 'path';

function loadEnv(appEnv: string) {
  const envPath = path.join(process.cwd(), `.env.${appEnv}`);
  if (fs.existsSync(envPath)) {
    const dotenv = require('dotenv');
    const dotenvExpand = require('dotenv-expand');
    const out = dotenv.config({ path: envPath });
    dotenvExpand.expand(out);
  }
}

export default () => {
  const APP_ENV = process.env.APP_ENV || 'test';
  loadEnv(APP_ENV);
  return {
    name: process.env.APP_NAME || 'VTracking',
    slug: 'vehicle-tracking-system',
    scheme: 'vtracking',
    extra: {
      APP_ENV,
      APP_NAME: process.env.APP_NAME,
      API_BASE_URL: process.env.API_BASE_URL
    },
    platforms: ['ios','android','web'],
    ios: {
      bundleIdentifier:
        APP_ENV === 'production'
          ? 'com.transtech.vtracking'
          : APP_ENV === 'staging'
          ? 'com.transtech.vtracking.staging'
          : 'com.transtech.vtracking.test'
    },
    android: {
      package:
        APP_ENV === 'production'
          ? 'com.transtech.vtracking'
          : APP_ENV === 'staging'
          ? 'com.transtech.vtracking.staging'
          : 'com.transtech.vtracking.test'
    },
    web: { bundler: 'metro', output: 'static' }
  };
};
