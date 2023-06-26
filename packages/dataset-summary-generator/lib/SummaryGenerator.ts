import type { IDataLoader } from '@catalogue/data-loader';
import type * as RDF from '@rdfjs/types';
import type { IDatasetSummary } from './DatasetSummary';

export class SummaryGenerator implements ISummaryGenerator {
  private readonly loader: IDataLoader;
  private readonly summary: IDatasetSummary;

  public constructor(args: ISummaryGeneratorArgs) {
    this.loader = args.loader;
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
    }
  }
}

export interface ISummaryGenerator {
  run: () => Promise<void>;
}

export interface ISummaryGeneratorArgs {
  loader: IDataLoader;
  summary: IDatasetSummary;
}
