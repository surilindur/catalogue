import type * as RDF from '@rdfjs/types';
import type { QuadWithSource } from '../loaders/DataLoader';

export abstract class DatasetSummary implements IDatasetSummary {
  private readonly datasetRegex: RegExp;
  private readonly datasetRegexReplacement: string;

  public constructor(args: IDatasetSummaryArgs) {
    this.datasetRegex = new RegExp(args.datasetRegex, 'u');
    this.datasetRegexReplacement = args.datasetRegexReplacement;
  }

  public abstract from(stream: RDF.Stream<QuadWithSource>): Promise<RDF.Stream>;

  protected sourceToDataset(source: string): string | undefined {
    if (this.datasetRegex.test(source)) {
      return source.replace(this.datasetRegex, this.datasetRegexReplacement);
    }
  }
}

export interface IDatasetSummary {
  from: (stream: RDF.Stream<QuadWithSource>) => Promise<RDF.Stream>;
}

export interface IDatasetSummaryArgs {
  datasetRegex: string;
  datasetRegexReplacement: string;
}

