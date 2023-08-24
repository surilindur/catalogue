import type * as RDF from '@rdfjs/types';

export abstract class DatasetSummary implements IDatasetSummary {
  private readonly keyReplacementPattern: RegExp;
  private readonly keyReplacementValue: string;

  public constructor(args: IDatasetSummaryArgs) {
    this.keyReplacementPattern = new RegExp(args.keyReplacementPattern, 'u');
    this.keyReplacementValue = args.keyReplacementValue;
  }

  public abstract add(...quads: RDF.Quad[]): void;
  public abstract reset(): void;
  public abstract toRdf(dataset: string): RDF.Quad[];

  protected replaceDatasetKeyValues(key: string): string {
    return key.replace(this.keyReplacementPattern, this.keyReplacementValue);
  }
}

export interface IDatasetSummary {
  add: (...quads: RDF.Quad[]) => void;
  reset: () => void;
  toRdf: (dataset: string) => RDF.Quad[];
}

export interface IDatasetSummaryArgs {
  keyReplacementPattern: string;
  keyReplacementValue: string;
}
