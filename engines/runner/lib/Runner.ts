import { resolve } from 'node:path';
import type { IDatasetSummaryGenerator } from '@solidlab/catalogue-dataset-summary-generator';
import { ComponentsManager } from 'componentsjs';

const DEFAULT_GENERATOR = 'urn:catalogue:generator:default';

function getConfigPath(): string {
  const configPathArgIndex: number = process.argv.indexOf('--config') + 1;
  const configPathArg: string | undefined = configPathArgIndex > 0 ? process.argv.at(configPathArgIndex) : undefined;
  if (configPathArg === undefined) {
    throw new Error('Configuration file path not provided');
  }
  return resolve(configPathArg);
}

export function runAppSync(): void {
  // eslint-disable-next-line no-console
  runApp().then().catch(console.log);
}

export async function runApp(): Promise<void> {
  const mainModulePath: string = resolve(__dirname);
  const configPath: string = getConfigPath();
  const manager = await ComponentsManager.build({
    // Path to npm package's root
    mainModulePath,
    typeChecking: false,
  });
  // eslint-disable-next-line no-console
  console.log(`Using configuration: ${configPath}`);
  await manager.configRegistry.register(configPath);
  const generator: IDatasetSummaryGenerator = await manager.instantiate(DEFAULT_GENERATOR);
  // eslint-disable-next-line no-console
  console.log(`Running with class: ${generator.constructor.name}`);
  await generator.run();
}
