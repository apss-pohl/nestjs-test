import { execSync } from 'node:child_process';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import * as builder from 'electron-builder';
import _ from 'lodash';
import rimraf from 'rimraf';
import * as pjson from './package.json' assert { type: 'json' };
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Some preparations
 */
/** Directories */
const DIR_APP_ROOT = path.join(__dirname, '..', '..', '..');
const DIR_APP_ENV = DIR_APP_ROOT + '/config/env';
const DIR_APP_OUT = DIR_APP_ROOT + '/release/';
/** Variables */
const Platform = builder.Platform;
const now = new Date();
const date = now.getFullYear();
const VERSION = {};
const dateRev = now
  .toLocaleString('en-US', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  })
  .replace(/(\d+)\/(\d+)\/(\d+)/, '$3$1$2');
let revision = 'service';
revision = execSync('git rev-parse HEAD').toString().trim().slice(0, 7);
VERSION.ELECTRON_APP_VERSION =
  pjson.default.version + '-' + dateRev + '.' + revision;
VERSION.ELECTRON_VERSION = '2';
VERSION.DESCRIPTION = pjson.default.description;
const COPYRIGHT = 'Copyright © ' + date + ' APS Services GmbH';
const DEVAPP = 'DEVAPP';
/**
 * Initial variables will point towards local dev app for "yarn electron"
 */
let appEnvironment = '.env.pos';
let TITLE = DEVAPP;
const cmdArguments = process.argv.slice(4);
const cmdObject = {
  app: cmdArguments[0],
  os: [cmdArguments[1], cmdArguments[2], cmdArguments[3]],
};

/**
 * Switch application build types
 */
switch (cmdObject.app) {
  case 'lights': {
    TITLE = 'Lights';
    appEnvironment = '.env.lights';

    break;
  }

  case 'service': {
    TITLE = 'Service';
    appEnvironment = '.env.service';

    break;
  }

  case 'pos': {
    TITLE = 'Pos';
    appEnvironment = '.env.pos';
    break;
  }

  case 'receipt': {
    TITLE = 'Receipt';
    appEnvironment = '.env.receipt';
    break;
  }

  case DEVAPP: {
    TITLE = DEVAPP;
    appEnvironment = '.env.devapp';
    break;
  }

  default: {
    TITLE = 'Pos';
    cmdObject.app = 'pos';
    appEnvironment = '.env.pos';
  }
}

/**
 * Load relevant environments
 */
dotenv.config({
  override: true,
  path: DIR_APP_ENV + '/' + appEnvironment,
});
dotenv.config({
  override: true,
  path: DIR_APP_ENV + '/' + appEnvironment + '.build',
});

console.log('BUNDLE MODE: ' + TITLE);
const BUILD_ASAR = process.env.BUILD_ASAR;

// Let's get that intellisense working
/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: 'com.apsservices.' + TITLE.toLowerCase(),
  copyright: COPYRIGHT,
  asar: BUILD_ASAR,
  productName: 'APSS ' + TITLE,
  // publisherName: 'APS Services GmbH',
  mac: {
    category: 'public.app-category.utilities',
  },
  win: {
    target: 'nsis',
    icon: DIR_APP_ROOT + '/apps/render/src/public/img/app/webclimber.ico',
    files: [
      DIR_APP_ROOT + '/apps/main/dist/main',
      '!**/node_modules/argon2/lib/binding/napi-v3/*',
      {
        from: DIR_APP_ROOT + '/apps/main/build/argon2',
        to: 'node_modules/argon2/lib/binding/napi-v3',
      },
    ],
  },
  linux: {
    artifactName: '${productName}-${version}.${ext}',
    target: ['AppImage'], //  ['AppImage', 'deb'],
    icon: DIR_APP_ROOT + '/apps/render/src/public/img/app/webclimber.icns',
  },
  nsis: {
    oneClick: true,
    perMachine: true,
    allowToChangeInstallationDirectory: false,
    runAfterFinish: false,
  },
  files: [
    DIR_APP_ROOT + '/apps/main/dist/main',
    {
      from: DIR_APP_ROOT + '/apps/main/dist/main',
      to: 'dist/main',
    },
    {
      from: DIR_APP_ROOT + '/apps/render/.output/public',
      to: 'dist/render',
    },
    {
      from: DIR_APP_ROOT + '/config/cert',
      to: 'dist/cert',
      filter: ['apss.key', 'apss.crt'],
    },
    {
      from: DIR_APP_ROOT + '/apps/main/prisma/dist',
      to: 'dist',
    },
    {
      from: DIR_APP_ROOT + '/apps/main/prisma/dist',
      to: 'dist/main',
      filter: ['**/*.prisma'],
    },
    {
      from: DIR_APP_ROOT + '/apps/main/src',
      to: 'dist/main',
      filter: ['**/*.graphql'],
    },
    {
      from: DIR_APP_ENV,
      to: 'dist/main',
      filter: [appEnvironment],
    },
    {
      from: DIR_APP_ROOT + '/apps/main/src/@generated',
      to: 'dist/main',
      filter: ['i18n.generated.ts'],
    },
  ],
  directories: {
    output: DIR_APP_OUT + TITLE,
  },
  forceCodeSigning: false,
  compression: BUILD_ASAR ? 'normal' : 'store',
  electronVersion: VERSION.ELECTRON_VERSION,
  extraMetadata: {
    version: VERSION.ELECTRON_APP_VERSION,
    name: 'APSS ' + TITLE,
    description: 'APSS Description for ' + TITLE,
    homepage: 'https://www.freeclimber-kassensystem.de/',
    license: 'Licence by APSS',
    author: { name: 'APS Services GmbH' },
  },
  extraFiles: [
    {
      from: DIR_APP_ROOT + '/apps/main/src',
      to: 'resources/gql',
      filter: ['**/*.graphql'],
    },
    {
      from: DIR_APP_ROOT + '/apps/main/src',
      to: 'resources/gql',
      filter: ['**/graphql.ts'],
    },
  ],
  npmRebuild: true,
  //nodeGypRebuild: false,
  buildDependenciesFromSource: true,
};
/**
 * Clear the output directory
 */
rimraf.sync(DIR_APP_OUT + TITLE);

/**
 * Prepare the targets
 */
const targets = new Map();
for (const currentOs of cmdObject.os) {
  if (
    _.isNil(currentOs) ||
    !['LINUX', 'MAC', 'WINDOWS'].includes(currentOs.toUpperCase())
  ) {
    continue;
  }

  targets.set(Platform[currentOs.toUpperCase()], new Map());
}

if (targets.size === 0) {
  targets.set(Platform['LINUX'], new Map());
}

export default { config, targets };
