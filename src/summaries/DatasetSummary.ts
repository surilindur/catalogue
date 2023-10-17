import type * as RDF from '@rdfjs/types';
import type { AsyncIterator } from 'asynciterator';
import type { QuadWithSource } from '../loaders/DataLoader';

export abstract class DatasetSummary implements IDatasetSummary {
  private readonly datasetRegex: RegExp;
  private readonly datasetRegexReplacement: string;

  public constructor(args: IDatasetSummaryArgs) {
    this.datasetRegex = new RegExp(args.datasetRegex, 'u');
    this.datasetRegexReplacement = args.datasetRegexReplacement;
  }

  public abstract from(stream: AsyncIterator<QuadWithSource>): Promise<AsyncIterator<RDF.Quad>>;

  protected sourceToDataset(source: string): string | undefined {
    if (this.datasetRegex.test(source)) {
      return source.replace(this.datasetRegex, this.datasetRegexReplacement);
    }
  }
}

export interface IDatasetSummary {
  from: (stream: AsyncIterator<QuadWithSource>) => Promise<AsyncIterator<RDF.Quad>>;
}

export interface IDatasetSummaryArgs {
  datasetRegex: string;
  datasetRegexReplacement: string;
}

