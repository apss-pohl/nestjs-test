import { builtinModules } from 'node:module';

import _ from 'lodash';
import { defineConfig, UserConfig } from 'vite';

export const PACKAGE_ROOT = __dirname + '/../';

export const EXTERNAL_PACKAGES = [
  '@nestjs',
  '@serialport',
  'graphql-scalars',
  'prisma',
  'argon2',
  'electron-devtools-installer',
  'hbs',
  'pnpapi',
  'jsdom',
  ...builtinModules.flatMap((p) => [p, `node:${p}`]),
];

/**
 *  MASTER CONFIG
 *
 */
export function getViteMainConfig(options: any): UserConfig {
  /**
   * 1. We clone the environment that migth have been intentionaly set in package.json using "cross-env"
   * 2. We load the .env the vite way and merge it with process.env
   * 3. We overwrite the process.env with the stored values from 1.
   */

  const finalConfig = {
    root: PACKAGE_ROOT,
    envDir: PACKAGE_ROOT,
    publicDir: false,
    resolve: {
      alias: {
        '@root/': PACKAGE_ROOT,
        '@m/': PACKAGE_ROOT + 'apps/main/src/',
        '@r/': PACKAGE_ROOT + 'apps/render/src/',
      },
    },
    define: {
      // We need them for the RENDER dev process
      'process.env': {},
      'process.env.RUN_RENDER_USE_HTTP': JSON.stringify(
        process.env.RUN_RENDER_USE_HTTP,
      ),
      'process.env.VITE_DEV': JSON.stringify(process.env.VITE_DEV),
    },
    server: {
      hmr: {
        //port: process.env[options.port],
        //clientPort: process.env[options.port],
        protocol: 'wss',
        host: process.env.DEV_RUN_RENDER_HOST,
      },
      port: process.env[options.port],
    },
    optimizeDeps: {
      exclude: EXTERNAL_PACKAGES,
      // include: [],
    },
    build: {
      chunkSizeWarningLimit: 2000,
      sourcemap: true,
      // target: options.target === 'node' ? options.target + node : 'chrome' + chrome,
      minify: false,

      rollupOptions: {
        //external: ['argon2'], // Leads to import "node:crypto"; issue
        external: EXTERNAL_PACKAGES,
        output: {
          sourcemap: true,
        },
      },
      emptyOutDir: false,
      brotliSize: false,
    },
    // esbuild: {
    //   external: EXTERNAL_PACKAGES,
    // },
  };
  const cleanConfig = _.isNil(options.mergeConfig)
    ? finalConfig
    : _.merge(finalConfig, options.mergeConfig);

  return defineConfig(cleanConfig) as UserConfig;
}
