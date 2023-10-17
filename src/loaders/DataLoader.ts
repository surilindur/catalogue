import type * as RDF from '@rdfjs/types';
import type { AsyncIterator } from 'asynciterator';

export type QuadWithSource = RDF.Quad & { source: string };

export interface IDataLoader {
  test: (uri: URL) => Promise<boolean>;
  load: (uri: URL) => Promise<AsyncIterator<QuadWithSource>>;
}

export interface IDataLoaderArgs {}
