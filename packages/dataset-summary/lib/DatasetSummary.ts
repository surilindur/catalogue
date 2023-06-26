import type * as RDF from '@rdfjs/types';

export interface IDatasetSummary {
  add: (...quads: RDF.Quad[]) => void;
  reset: () => void;
  toRdf: (dataset: string) => RDF.Quad[];
}

export interface IDatasetSummaryArgs {}
