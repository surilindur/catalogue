import { resolve } from 'node:path';
import { ComponentsManager } from 'componentsjs';
import yargs from 'yargs/yargs';
import type { SummaryGenerator } from './SummaryGenerator';

export async function runApp(): Promise<void> {
  const args = await yargs(process.argv).options({
    config: {
      description: 'The Components.js configuration file to use',
      demandOption: true,
      type: 'string',
    },
    target: {
      description: 'The target IRI to instantiate from the configuration file',
      demandOption: true,
      type: 'string',
    },
    mainModulePath: {
      description: 'The mainModulePath to use for Components.js ComponentsManager',
      demandOption: true,
      type: 'string',
      default: resolve(__dirname, '..', '..'),
    },
  }).parse();
  const manager = await ComponentsManager.build({
    mainModulePath: args.mainModulePath,
    typeChecking: false,
  });
  await manager.configRegistry.register(args.config);
  const generator = await manager.instantiate<SummaryGenerator>(args.target);
  await generator.run();
}

export function runAppSync(): void {
  runApp().then().catch(error => {
    throw error;
  });
}
