import { join, resolve } from 'node:path';
import type { ISummaryGenerator } from '@catalogue/dataset-summary-generator';
import { ComponentsManager } from 'componentsjs';

const DEFAULT_CONFIG = '../config/void.json';
const DEFAULT_GENERATOR = 'urn:catalogue:generator:default';

export async function runApp(): Promise<void> {
  const mainModulePath: string = resolve(__dirname);
  const configPath: string = join(mainModulePath, DEFAULT_CONFIG);
  const manager = await ComponentsManager.build({
    // Path to npm package's root
    mainModulePath,
  });
  // eslint-disable-next-line no-console
  console.log(mainModulePath);
  // eslint-disable-next-line no-console
  console.log(configPath);
  await manager.configRegistry.register(configPath);
  const generator: ISummaryGenerator = await manager.instantiate<ISummaryGenerator>(DEFAULT_GENERATOR);
  await generator.run();
}
