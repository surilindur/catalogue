import type * as RDF from '@rdfjs/types';

export type QuadWithSource = RDF.Quad & { source: string };

export interface IDataLoader {
  test: (uri: URL) => Promise<boolean>;
  load: (uri: URL) => Promise<RDF.Stream>;
}

export interface IDataLoaderArgs {}
