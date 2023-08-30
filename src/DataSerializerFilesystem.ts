import { writeFileSync, existsSync, unlinkSync } from 'node:fs';
import type * as RDF from '@rdfjs/types';
import { Writer } from 'n3';
import { DataSerializer, type IDataSerializerArgs } from './DataSerializer';

export class DataSerializerFilesystem extends DataSerializer {
  private readonly format: string;
  private readonly prefixes: Record<string, string> | undefined;
  private readonly pathPattern: RegExp;
  private readonly pathPatternReplacement: string;
  private readonly listonly: boolean;
  private readonly overwrite: boolean;

  public constructor(args: IDataSerializerFilesystemArgs) {
    super(args);
    this.format = args.format;
    this.prefixes = args.prefixes;
    this.pathPattern = new RegExp(args.pathPattern, 'u');
    this.pathPatternReplacement = args.pathPatternReplacement;
    this.listonly = args.listonly;
    this.overwrite = args.overwrite;
  }

  public serialize(datasetSummaries: Map<string, RDF.Quad[]>): string[] {
    const writtenPaths: string[] = [];
    for (const [ dataset, quads ] of datasetSummaries) {
      const serializationPath = dataset.replace(this.pathPattern, this.pathPatternReplacement);
      const serializationNotes = [];
      if (this.listonly) {
        serializationNotes.push('listonly');
      } else if (existsSync(serializationPath)) {
        serializationNotes.push('exists');
        serializationNotes.push(this.overwrite ? 'overwrite' : 'skip');
      }
      const serializationNotesString = serializationNotes.length > 0 ? `(${serializationNotes.join(',')}) ` : '';
      // eslint-disable-next-line no-console
      console.log(`Serialize ${serializationNotesString}${serializationPath}`);
      if (!this.listonly) {
        if (existsSync(serializationPath) && this.overwrite) {
          unlinkSync(serializationPath);
        }
        const writer: Writer = new Writer({ format: this.format, prefixes: this.prefixes });
        const output: string = writer.quadsToString(quads);
        writeFileSync(serializationPath, output);
        writtenPaths.push(serializationPath);
      }
    }
    return writtenPaths;
  }
}

export interface IDataSerializerFilesystemArgs extends IDataSerializerArgs {
  pathPattern: string;
  pathPatternReplacement: string;
  format: string;
  prefixes?: Record<string, string>;
  listonly: boolean;
  overwrite: boolean;
}
