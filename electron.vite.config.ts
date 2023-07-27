import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin, swcPlugin } from 'electron-vite';
import { builtinModules } from 'node:module';

const alias = {
  '@root': __dirname,
  '@m/': __dirname + '/apps/main/src/',
  '@r/': __dirname + '/apps/render/src/',
};

export const EXTERNAL_PACKAGES = [
  '@nestjs',
  'argon2',
  'pnpapi',
  '@nestjs/websockets/socket-module',
  '@nestjs/microservices/microservices-module',
  'class-transformer',
  ...builtinModules.flatMap((p) => [p, `node:${p}`]),
];

export default defineConfig((viteArguments) => {
  console.log(viteArguments);
  console.log(resolve(__dirname, './dist/main'));

  const options = {
    main: {
      root: resolve(__dirname, '.'),
      envDir: resolve(__dirname, '.'),
      resolve: {
        alias,
      },
      plugins: [externalizeDepsPlugin(), swcPlugin()],
      build: {
        outDir: resolve(__dirname, './dist/main'),
        rollupOptions: {
          external: EXTERNAL_PACKAGES,
          input: {
            index: resolve(__dirname, 'apps/main/src/main.ts'),
          },
        },
      },
      optimizeDeps: {
        exclude: EXTERNAL_PACKAGES,
      },
    },
    preload: {
      plugins: [externalizeDepsPlugin(), swcPlugin()],
      build: {
        outDir: resolve(__dirname, './dist/preload'),
        rollupOptions: {
          input: {
            index: resolve(__dirname, './apps/preload/index.ts'),
          },
        },
      },
    },
    renderer: {
      resolve: {
        alias: {
          '@renderer': resolve(__dirname, './apps/renderer/src'),
        },
      },
      plugins: [],
    },
  };

  // console.log(options);
  return options;
});
