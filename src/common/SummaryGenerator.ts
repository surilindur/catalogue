import { UnionIterator } from 'asynciterator';
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

  public async run(target: string): Promise<void> {
    const uri = new URL(target);
    const loader = this.loaders.find(ld => ld.test(uri));
    if (!loader) {
      throw new Error(`No available loaders for target ${uri}`);
    }
    const dataStream = await loader.load(uri);
    const summaryStreams = await Promise.all(this.summaries.map(summary => summary.from(dataStream.clone())));
    const summaryStream = new UnionIterator(summaryStreams);
    for (const serializer of this.serializers) {
      await serializer.serialize(summaryStream.clone());
    }
    dataStream.destroy();
    summaryStream.destroy();
  }
}

export interface ISummaryGenerator {
  run: (target: string) => Promise<void>;
}

export interface ISummaryGeneratorArgs {
  loaders: IDataLoader[];
  serializers: IDataSerializer[];
  summaries: IDatasetSummary[];
}
