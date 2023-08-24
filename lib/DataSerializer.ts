import type * as RDF from '@rdfjs/types';

export abstract class DataSerializer implements IDataSerializer {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
  public constructor(args: IDataSerializerArgs) {}
  public abstract serialize(target: string, data: RDF.Quad[]): Promise<boolean>;
}

export interface IDataSerializer {
  serialize: (target: string, data: RDF.Quad[]) => Promise<boolean>;
}

export interface IDataSerializerArgs {}
