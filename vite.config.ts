import { join } from 'node:path';
import chalk from 'chalk';
import { defineConfig } from 'vite';
import { getViteMainConfig, EXTERNAL_PACKAGES } from './vite.global.config';
import config from './bundle-electron.mjs';
import { VitePluginElectronBuilder } from './plugin';

export default defineConfig((viteArguments) => {
  //console.log(config, './build/electron-builder.config.js');
  const options = {
    vite: viteArguments,
    port: 'DEV_RUN_MAIN_PORT',
    target: 'node',
    mergeConfig: {
      root: __dirname, // We dont want to watch all the source..
      // base: './',
      build: {
        // lib: {
        //   entry: __dirname + '/src/main.ts',
        //   formats: ['cjs'],
        // },
        // esbuild: {
        //   external: EXTERNAL_PACKAGES,
        // },
        outDir: join(__dirname, 'dist/main'),
        // rollupOptions: {
        //   input: resolve(__dirname, './src/main.preload.ts'), // Moved preload into main, no need to the mock line above anymore

        //   //external: ['@aps-services/shared'],
        //   output: {
        //     entryFileNames: '[name].cjs',
        //   },
        // },
      },
      plugins: [
        VitePluginElectronBuilder({
          root: process.cwd(),
          tsconfig: './tsconfig.build.json',
          electronBuilderConfig: config,
          external: EXTERNAL_PACKAGES,
          afterEsbuildBuild: async () => {
            console.log(chalk.yellow('Skipped service bundling.'));
          },
        }),
      ],
    },
  };
  const finalViteConfig = getViteMainConfig(options);
  //console.log(finalViteConfig);

  return finalViteConfig;
});
