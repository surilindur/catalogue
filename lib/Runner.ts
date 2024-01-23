import type { Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type * as RDF from '@rdfjs/types';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { DatasetSolidBenchPod } from './DatasetSolidBenchPod';
import type { IDatasetSummary } from './DatasetSummary';
import { DatasetSummaryBloom } from './DatasetSummaryBloom';
import { DatasetSummaryVoID } from './DatasetSummaryVoID';

const podRoodRegex = new RegExp(/^.*\/(https?)\/([_a-x-]+)_(\d+)\/(.*)\/?/u, 'u');
const podRootReplacement = '$1://$2:$3/$4/';

export async function generateSummariesForPod(
  pod: Dirent,
  voidDescription: boolean,
  bloomFilter: boolean,
  filterSize: number,
  filterSlices: number,
): Promise<void> {
  const podUri = new URL(join(pod.path, pod.name).replace(podRoodRegex, podRootReplacement));
  const dataset = new DatasetSolidBenchPod({ path: pod, uri: podUri });
  const datasetQuads = await dataset.load();
  const summaries: IDatasetSummary[] = [
    ...voidDescription ? [ new DatasetSummaryVoID({ dataset: podUri }) ] : [],
    ...bloomFilter ? [ new DatasetSummaryBloom({ dataset: podUri, filterSize, filterSlices }) ] : [],
  ];
  return new Promise((resolve, reject) => {
    datasetQuads
      .on('data', (quad: RDF.Quad) => summaries.forEach(summary => summary.register(quad)))
      .on('end', () => {
        const metadata: RDF.Quad[] = summaries.flatMap(summary => summary.toQuads());
        dataset.setMetadata(metadata, 'N-Quads').then(resolve).catch(reject);
      })
      .on('error', reject);
  });
}

export async function runApp(): Promise<void> {
  const args = await yargs(hideBin(process.argv)).options({
    pods: {
      type: 'string',
      demandOption: true,
      description: 'The path to SolidBench-generated pods',
    },
    voidDescription: {
      type: 'boolean',
      default: false,
      description: 'Generate VoID dataset descriptions',
    },
    bloomFilter: {
      type: 'boolean',
      default: false,
      description: 'Generate Bloom filters',
    },
    bloomFilterSize: {
      type: 'number',
      default: 1_024,
      description: 'The filter size for Bloem library',
    },
    bloomFilterSlices: {
      type: 'number',
      default: 4,
      description: 'The slices count for Bloem library',
    },
  }).help().parse();
  const pods = await readdir(args.pods, { recursive: false, encoding: 'utf8', withFileTypes: true });
  console.log(`Generating for pods in <file://${args.pods}>`);
  for (let i = 0; i < pods.length; i++) {
    const pod = pods[i];
    const podPath = join(pod.path, pod.name);
    console.log(`Processing ${i + 1} / ${pods.length} <file://${podPath}>`);
    if (pod.isDirectory() && podRoodRegex.test(podPath)) {
      try {
        await generateSummariesForPod(
          pod,
          args.voidDescription,
          args.bloomFilter,
          args.bloomFilterSize,
          args.bloomFilterSlices,
        );
      } catch (error: unknown) {
        console.log('Error:', error);
      }
    }
  }
  console.log(`Generation finished`);
}

export function runAppSync(): void {
  runApp().then().catch(error => {
    throw new Error(error);
  });
}
