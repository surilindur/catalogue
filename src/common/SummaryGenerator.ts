import { PassThrough } from 'node:stream';
import type * as RDF from '@rdfjs/types';
import type { IDataLoader } from '../loaders/DataLoader';
import type { IDataSerializer } from '../serializers/DataSerializer';
import type { IDatasetSummary } from '../summaries/DatasetSummary';

export class SummaryGenerator implements ISummaryGenerator {
  private readonly loaders: IDataLoader[];
  private readonly serializers: IDataSerializer[];
  private readonly summaries: IDatasetSummary[];

  public constructor(args: ISummaryGeneratorArgs) {
    this.loaders = args.loaders;
    this.serializers = args.serializers;
    this.summaries = args.summaries;
  }

  public async run(pods: URL): Promise<void> {
    const loader = this.loaders.find(ld => ld.test(pods));
    if (!loader) {
      throw new Error(`No available loaders for target ${pods}`);
    }
    const dataStream = await loader.load(pods);
    const dataPassThrough = this.passThroughFromRdfStream(dataStream);
    for (const summary of this.summaries) {
      const summaryInput = new PassThrough({ objectMode: true });
      dataPassThrough.pipe(summaryInput);
      const summaryOutput = await summary.from(summaryInput);
      const serializationPassThrough = this.passThroughFromRdfStream(summaryOutput);
      for (const serializer of this.serializers) {
        const serializationInput = new PassThrough({ objectMode: true });
        serializationPassThrough.pipe(serializationInput);
        await serializer.serialize(pods, serializationInput);
      }
    }
  }

  private passThroughFromRdfStream(stream: RDF.Stream): PassThrough {
    const passThrough = new PassThrough({ objectMode: true });
    stream
      .on('data', data => passThrough.write(data))
      .on('end', () => passThrough.end())
      .on('error', error => passThrough.destroy(error));
    return passThrough;
  }
}

export interface ISummaryGenerator {
  run: (pods: URL) => Promise<void>;
}

export interface ISummaryGeneratorArgs {
  loaders: IDataLoader[];
  serializers: IDataSerializer[];
  summaries: IDatasetSummary[];
}
