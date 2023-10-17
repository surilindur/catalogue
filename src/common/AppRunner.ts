import { resolve } from 'node:path';
import { ComponentsManager } from 'componentsjs';
import yargs from 'yargs/yargs';
import type { SummaryGenerator } from './SummaryGenerator';

export async function runApp(): Promise<void> {
  const args = await yargs(process.argv).options({
    pods: {
      description: 'The IRI of the pods from SolidBench',
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
  const podsUri = new URL(args.pods + (args.pods.endsWith('/') ? '' : '/'));
  await manager.configRegistry.register(args.config);
  const generator = await manager.instantiate<SummaryGenerator>(args.instanceIri);
  await generator.run(podsUri);
}

export function runAppSync(): void {
  runApp().then().catch(error => {
    throw error;
  });
}
