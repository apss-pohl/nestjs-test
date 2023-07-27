import { esbuildDecorators } from '@anatine/esbuild-decorators';
import { BuildOptions } from 'esbuild';
import { ResolvedViteElectronBuilderOptions } from './types';

export function createEsbuildOptions(
  options: ResolvedViteElectronBuilderOptions,
): BuildOptions {
  // const define = Object.fromEntries(
  //   Object.entries(options.env).map(([key, value]) => [
  //     `process.env.${key}`,
  //     JSON.stringify(value),
  //   ]),
  // );
  const define = {};
  //const { entryFile, mainFile, outDir, tsconfig, external } = options;
  const { entryFile, outDirectory, tsconfig, external } = options;
  //console.log(define);

  return {
    entryPoints: entryFile,
    target: 'es2020',
    //outfile: mainFile,
    outdir: outDirectory,
    outbase: 'src',
    outExtension: { '.js': '.cjs' },
    format: 'cjs',
    bundle: true,
    platform: 'node',
    minify: false,
    sourcemap: true,
    define,
    tsconfig,
    plugins: [esbuildDecorators({ tsconfig })],
    external,
  };
}
