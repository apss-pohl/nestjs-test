import electron from 'electron';
import { spawn, ChildProcess } from 'node:child_process';
import chalk from 'chalk';
import { build } from 'esbuild';
import { createEsbuildOptions } from './esbuild.options';
import { ResolvedViteElectronBuilderOptions } from './types';

function runMainProcess(mainFile: string): ChildProcess {
  return spawn(electron as any, [mainFile], { stdio: 'inherit' });
}

export async function handleWatch(
  options: ResolvedViteElectronBuilderOptions,
): Promise<ChildProcess> {
  const { mainFile } = options;
  const esbuildOptions = createEsbuildOptions(options);

  let child: ChildProcess;

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

      console.log(chalk.yellow('Skipped app bundling.'));

      console.log(chalk.green('Main Process Build Succeeded.'));
    })
    .catch((error) => {
      console.log(`\n${chalk.red('Main Process Build Failed')}\n`, error, '\n');
    });
}
