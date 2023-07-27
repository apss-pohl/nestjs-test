import { builtinModules } from 'node:module';
import { join } from 'node:path';
import { ResolvedConfig } from 'vite';
import {
  ResolvedViteElectronBuilderOptions,
  ViteElectronBuilderOptions,
} from './types';

export function resolveOptions(
  options: Partial<ViteElectronBuilderOptions>,
  viteConfig: ResolvedConfig,
) {
  const root = options.root || process.cwd();
  const external = [
    ...new Set([
      ...builtinModules.filter(
        (x) => !/^_|^(internal|v8|node-inspect)\/|\//.test(x),
      ),
      'electron',
      ...(Array.isArray(options.external) ? options.external : []),
    ]),
  ];

  const {
    mainFile = join(root, 'dist/main/main.cjs'),
    outDirectory = join(root, 'dist/main'),
    //entryFile = join(root, 'src/main.ts'),
    entryFile = [join(root, 'src/main.ts')],
    tsconfig,
    electronBuilderConfig,
    afterEsbuildBuild = async () => {
      console.log('afterEsbuildBuild');
    },
  } = options;

  const { env, command } = viteConfig;

  const resolvedViteElectronBuilderOptions: ResolvedViteElectronBuilderOptions =
    {
      root,
      mainFile,
      outDirectory,
      entryFile,
      tsconfig,
      electronBuilderConfig,
      env,
      command,
      external,
      afterEsbuildBuild,
    };

  return resolvedViteElectronBuilderOptions;
}
