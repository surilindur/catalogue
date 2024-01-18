import type { Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';
import type * as RDF from '@rdfjs/types';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { DatasetSolidBenchPod } from './DatasetSolidBenchPod';
import type { IDatasetSummary } from './DatasetSummary';
import { DatasetSummaryBloom } from './DatasetSummaryBloom';
import { DatasetSummaryVoID } from './DatasetSummaryVoID';

const podRoodRegex = new RegExp(/^.*\/(https?)\/([_a-x-]+)_(\d+)\/(.*)\//u, 'u');
const podRootReplacement = '$1://$2:$3/$4/';

export async function generateSummariesForPod(
  podPath: Dirent,
  voidDescription: boolean,
  bloomFilter: boolean,
  filterSize: number,
  filterSlices: number,
): Promise<void> {
  const podUri = new URL(podPath.path.replace(podRoodRegex, podRootReplacement));
  const dataset = new DatasetSolidBenchPod({ path: podPath, uri: podUri });
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
      default: 32,
      description: 'The filter size for Bloem library',
    },
    bloomFilterSlices: {
      type: 'number',
      default: 4,
      description: 'The slices count for Bloem library',
    },
  }).help().parse();
  const pods = await readdir(args.pods, { recursive: false, encoding: 'utf8', withFileTypes: true });
  console.log(`Generating for ${pods.length} pods from "${args.pods}"`);
  for (const pod of pods) {
    if (pod.isDirectory() && podRoodRegex.test(pod.path)) {
      await generateSummariesForPod(
        pod,
        args.voidDescription,
        args.bloomFilter,
        args.bloomFilterSize,
        args.bloomFilterSlices,
      );
    }
  }
  console.log(`Generation finished`);
}

export function runAppSync(): void {
  runApp().then().catch(error => {
    throw new Error(error);
  });
}
