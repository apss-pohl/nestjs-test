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

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({ exclude: ['@nestjs/websockets/socket-module'] }),
      swcPlugin(),
    ],
    build: {
      rollupOptions: {
        //external: EXTERNAL_PACKAGES,
        input: {
          index: resolve(__dirname, 'apps/main/src/main.ts'),
        },
        output: {
          manualChunks(id) {
            //console.log(id);
            if (id.includes('@nestjs/websockets/socket-module')) {
              return '@nestjs/websockets/socket-module';
            }
          },
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'apps/preload/index.ts'),
        },
      },
    },
  },
  renderer: {
    root: './apps/renderer',
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'apps/renderer/index.html'),
        },
      },
    },
  },
});
