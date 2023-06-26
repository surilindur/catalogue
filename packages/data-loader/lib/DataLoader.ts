import type * as RDF from '@rdfjs/types';

export abstract class DataLoader implements IDataLoader {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
  public constructor(args: IDataLoaderArgs) {}
  public abstract load(): Promise<Map<string, RDF.Quad[]>>;
}

export interface IDataLoader {
  load: () => Promise<Map<string, RDF.Quad[]>>;
}

export interface IDataLoaderArgs {}