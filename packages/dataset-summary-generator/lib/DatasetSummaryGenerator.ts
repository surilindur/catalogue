import type * as RDF from '@rdfjs/types';
import type { IDataLoader } from '@solidlab/catalogue-data-loader';
import type { IDataSerializer } from '@solidlab/catalogue-data-serializer';
import type { IDatasetSummary } from '@solidlab/catalogue-dataset-summary';

export class DatasetSummaryGenerator implements IDatasetSummaryGenerator {
  private readonly loader: IDataLoader;
  private readonly serializer: IDataSerializer;
  private readonly summary: IDatasetSummary;

  public constructor(args: IDatasetSummaryGeneratorArgs) {
    this.loader = args.loader;
    this.serializer = args.serializer;
    this.summary = args.summary;
  }

  public async run(): Promise<void> {
    const data: Map<string, RDF.Quad[]> = await this.loader.load();
    // eslint-disable-next-line no-console
    console.log(data);
    for (const [ dataset, quads ] of data) {
      this.summary.reset();
      this.summary.add(...quads);
      const output: RDF.Quad[] = this.summary.toRdf(dataset);
      // eslint-disable-next-line no-console
      console.log(output);
      await this.serializer.serialize(dataset, output);
    }
  }
}

export interface IDatasetSummaryGenerator {
  run: () => Promise<void>;
}

export interface IDatasetSummaryGeneratorArgs {
  loader: IDataLoader;
  serializer: IDataSerializer;
  summary: IDatasetSummary;
}
