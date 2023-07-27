import { Configuration as ElectronBuilderConfiguration } from 'electron-builder';

export interface ViteElectronBuilderOptions {
  root?: string;
  outDirectory?: string;
  mainFile?: string;
  entryFile?: string[];
  tsconfig?: string;
  external?: string[];
  electronBuilderConfig?: { config: ElectronBuilderConfiguration; targets: Map<any, any> };
  afterEsbuildBuild?: () => Promise<void>;
}

export interface ResolvedViteElectronBuilderOptions extends Required<ViteElectronBuilderOptions> {
  env: Record<string, any>;
  command: 'build' | 'serve';
}
