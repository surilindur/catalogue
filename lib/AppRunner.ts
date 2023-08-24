import { ComponentsManager } from 'componentsjs';
import type { DatasetSummaryGenerator } from './DatasetSummaryGenerator';

export async function runApp(): Promise<void> {
  const config = process.argv[process.argv.indexOf('--config') + 1];
  const manager = await ComponentsManager.build({
    mainModulePath: __dirname,
  });
  await manager.configRegistry.register(config);
  const generator = await manager.instantiate<DatasetSummaryGenerator>('urn:solidbench-summaries:generator');
  await generator.run();
}

export function runAppSync(): void {
  runApp().then().catch(error => {
    throw error;
  });
}
