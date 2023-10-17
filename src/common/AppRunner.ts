import { resolve } from 'node:path';
import { ComponentsManager } from 'componentsjs';
import yargs from 'yargs/yargs';
import type { SummaryGenerator } from './SummaryGenerator';

export async function runApp(): Promise<void> {
  const args = await yargs(process.argv).options({
    target: {
      description: 'The target IRI to generate summaries for',
      demandOption: true,
      type: 'string',
    },
    config: {
      description: 'The Components.js configuration file to use',
      type: 'string',
      default: resolve(__dirname, '..', '..', 'config', 'default.json'),
    },
    mainModulePath: {
      description: 'The mainModulePath to use for Components.js ComponentsManager',
      type: 'string',
      default: resolve(__dirname, '..', '..'),
    },
    instanceIri: {
      description: 'The IRI of the instance to create from the configuration file',
      type: 'string',
      default: 'urn:catalogue:generator',
    },
  }).parse();
  const manager = await ComponentsManager.build({
    mainModulePath: args.mainModulePath,
    typeChecking: false,
  });
  await manager.configRegistry.register(args.config);
  const generator = await manager.instantiate<SummaryGenerator>(args.instanceIri);
  await generator.run(args.target);
}

export function runAppSync(): void {
  runApp().then().catch(error => {
    throw error;
  });
}
