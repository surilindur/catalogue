import type { IDataLoader } from './DataLoader';
import type { IDataSerializer } from './DataSerializer';
import type { ISummaryCollector } from './SummaryCollector';

export class SummaryGenerator implements ISummaryGenerator {
  private readonly loader: IDataLoader;
  private readonly serializer: IDataSerializer;
  private readonly collector: ISummaryCollector;
  private readonly uri: string;

  public constructor(args: ISummaryGeneratorArgs) {
    this.loader = args.loader;
    this.serializer = args.serializer;
    this.collector = args.collector;
    this.uri = args.uri;
  }

  public async run(): Promise<void> {
    const stream = await this.loader.load(this.uri);
    const summaries = await this.collector.load(stream);
    const outputPaths = await this.serializer.serialize(summaries);
    // eslint-disable-next-line no-console
    console.log(`Wrote a total of ${outputPaths.length} files`);
  }
}

export interface ISummaryGenerator {
  run: (uri: string) => Promise<void>;
}

export interface ISummaryGeneratorArgs {
  loader: IDataLoader;
  serializer: IDataSerializer;
  collector: ISummaryCollector;
  uri: string;
}