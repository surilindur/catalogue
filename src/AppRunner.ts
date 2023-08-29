import { ComponentsManager } from 'componentsjs';
import type { SummaryGenerator } from './SummaryGenerator';

export async function runApp(): Promise<void> {
  const config = process.argv[process.argv.indexOf('--config') + 1];
  const target = process.argv[process.argv.indexOf('--target') + 1];
  const manager = await ComponentsManager.build({
    mainModulePath: __dirname,
  });
  await manager.configRegistry.register(config);
  const generator = await manager.instantiate<SummaryGenerator>(`urn:solidbench-summaries:generator:${target}`);
  await generator.run();
}

export function runAppSync(): void {
  runApp().then().catch(error => {
    throw error;
  });
}
