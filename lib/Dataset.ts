import type * as RDF from '@rdfjs/types';

export interface IDataset {
  uri: URL;
  load: () => Promise<RDF.Stream>;
  setMetadata: (quads: RDF.Quad[], format: string) => Promise<void>;
}

export interface IDatasetArgs {
  uri: URL;
}
