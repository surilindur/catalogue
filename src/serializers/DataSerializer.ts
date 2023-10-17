import type * as RDF from '@rdfjs/types';

export abstract class DataSerializer implements IDataSerializer {
  private readonly targetPattern: RegExp;
  private readonly targetPatternReplacement: string;

  public constructor(args: IDataSerializerArgs) {
    this.targetPattern = new RegExp(args.targetPattern, 'u');
    this.targetPatternReplacement = args.targetPatternReplacement;
  }

  public abstract serialize(pods: URL, stream: RDF.Stream): Promise<URL[]>;

  protected subjectToOutputUri(pods: URL, subject: RDF.Term): URL | undefined {
    if (subject.termType === 'NamedNode') {
      return new URL(subject.value.replace(this.targetPattern, this.targetPatternReplacement), pods);
    }
  }
}

export interface IDataSerializer {
  serialize: (pods: URL, stream: RDF.Stream) => Promise<URL[]>;
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
