import { join } from 'node:path';
import { ComponentsManager } from 'componentsjs';
import type { SummaryGenerator } from './SummaryGenerator';

export async function runApp(): Promise<void> {
  const config = process.argv[process.argv.indexOf('--config') + 1];
  const targetIndex = process.argv.indexOf('--target');
  const target = targetIndex > 0 ? process.argv[targetIndex + 1] : 'urn:solidbench-summaries:generator:default';
  const manager = await ComponentsManager.build({
    mainModulePath: join(__dirname, '..'),
    typeChecking: false,
  });
  await manager.configRegistry.register(config);
  const generator = await manager.instantiate<SummaryGenerator>(target);
  await generator.run();
}

export function runAppSync(): void {
  runApp().then().catch(error => {
    throw error;
  });
}
