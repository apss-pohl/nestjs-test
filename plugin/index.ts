import electron from 'electron';
import { spawn, ChildProcess } from 'node:child_process';
import chalk from 'chalk';
import { build as electronBuilder } from 'electron-builder';
import { build } from 'esbuild';
import _ from 'lodash';
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { createEsbuildOptions } from './esbuild.options';
//import { handleWatch as handleWatch, handleBuild } from './handle'; DEPRECATED: Former handling
import { resolveOptions } from './options';
import {
  ResolvedViteElectronBuilderOptions,
  ViteElectronBuilderOptions,
} from './types';

// eslint-disable-next-line no-var
var child: ChildProcess;

function runMainProcess(mainFile: string): ChildProcess {
  return spawn(electron as any, [mainFile], { stdio: 'inherit' });
}

export async function handleWatch(
  options: ResolvedViteElectronBuilderOptions,
): Promise<ChildProcess> {
  const { mainFile } = options;
  const esbuildOptions = createEsbuildOptions(options);

  //let child: ChildProcess;

  const bla = await build({
    ...esbuildOptions,
    watch: {
      onRebuild(error) {
        if (error) {
          console.error(chalk.red('Rebuild Failed:'), error);
        } else {
          if (child) child.kill();
          child = runMainProcess(mainFile);
          console.log(chalk.green('Rebuild Succeeded. PID: ' + child.pid));

          return child;
          //console.log(child);
        }
      },
    },
  }).then(() => {
    console.log(chalk.yellowBright('⚡Main Process Running'));
    if (child) child.kill();
    child = runMainProcess(mainFile);
    //  console.log(child);

    return child;
  });

  return bla;
}

export function handleBuild(options: ResolvedViteElectronBuilderOptions) {
  const { electronBuilderConfig } = options;
  const esbuildOptions = createEsbuildOptions(options);

  build(esbuildOptions)
    .then(async () => {
      await options.afterEsbuildBuild();

      //console.log(process.env.BUILD_ELECTRON);

      console.log(chalk.green('Main Process Build Succeeded.'));
    })
    .catch((error) => {
      console.log(`\n${chalk.red('Main Process Build Failed')}\n`, error, '\n');
    });
}

export function VitePluginElectronBuilder(
  userOptions: Partial<ViteElectronBuilderOptions> = {},
): Plugin {
  let viteConfig: ResolvedConfig;
  let options: ResolvedViteElectronBuilderOptions;

  return {
    name: 'vite-plugin-electron-builder',
    configResolved(config) {
      viteConfig = config;
      options = resolveOptions(userOptions, viteConfig);
    },
    configureServer: ({ httpServer }: ViteDevServer) => {
      httpServer?.on('listening', () => {
        //const address: any = httpServer.address();

        handleWatch(options).then((newChild) => {
          console.log(chalk.green('⚡PID Updated: ' + newChild.pid));
          child = newChild;
        });
      });
    },
    closeBundle: () => {
      // console.log(child);
      console.log(
        chalk.red('⚡SIGTERM Kill PID: ' + (_.isNil(child) ? '' : child.pid)),
      );
      handleBuild(options);
      if (child) child.kill();
    },
  };
}
