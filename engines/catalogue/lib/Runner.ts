import { join } from 'node:path';
import type { ISummaryGenerator } from '@catalogue/dataset-summary-generator';
import { ComponentsManager } from 'componentsjs';

const DEFAULT_CONFIG = 'config/void.json';
const DEFAULT_GENERATOR = 'urn:solidbench-summaries:default:generator';

export async function runApp(): Promise<void> {
  const manager = await ComponentsManager.build({
    // Path to npm package's root
    mainModulePath: join(__dirname, '..', 'lib'),
  });
  // eslint-disable-next-line no-console
  console.log(join(__dirname, '..', 'lib'));
  await manager.configRegistry.register(DEFAULT_CONFIG);
  const generator: ISummaryGenerator = await manager.instantiate(DEFAULT_GENERATOR);
  await generator.run();
}

