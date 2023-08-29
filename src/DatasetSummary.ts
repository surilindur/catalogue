import type * as RDF from '@rdfjs/types';

export abstract class DatasetSummary {
  protected readonly dataset: string;

  public constructor(args: IDatasetSummaryArgs) {
    this.dataset = args.dataset;
  }

  public abstract register(quad: RDF.Quad): void;
  public abstract quads(): RDF.Quad[];
}

export interface IDatasetSummaryArgs {
  dataset: string;
}

