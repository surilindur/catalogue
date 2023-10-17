import type * as RDF from '@rdfjs/types';
import type { AsyncIterator } from 'asynciterator';

export abstract class DataSerializer implements IDataSerializer {
  private readonly targetPattern: RegExp;
  private readonly targetPatternReplacement: string;

  public constructor(args: IDataSerializerArgs) {
    this.targetPattern = new RegExp(args.targetPattern, 'u');
    this.targetPatternReplacement = args.targetPatternReplacement;
  }

  public abstract serialize(strean: AsyncIterator<RDF.Quad>): Promise<URL[]>;

  protected subjectToOutputUri(subject: RDF.Term): URL | undefined {
    if (subject.termType === 'NamedNode') {
      return new URL(subject.value.replace(this.targetPattern, this.targetPatternReplacement));
    }
  }
}

export interface IDataSerializer {
  serialize: (stream: AsyncIterator<RDF.Quad>) => Promise<URL[]>;
}

export interface IDataSerializerArgs {
  /**
   * @default {^(.*out-fragments\/(?<protocol>[a-z]+)\/(?<host>[a-z-]+)_(?<port>[0-9]+)\/.*)}
   */
  targetPattern: string;
  /**
   * @default {$protocol://$host:$port/}
   */
  targetPatternReplacement: string;
}
