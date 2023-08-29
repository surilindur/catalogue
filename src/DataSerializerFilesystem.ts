import { writeFileSync, existsSync, unlinkSync } from 'node:fs';
import type * as RDF from '@rdfjs/types';
import { Writer } from 'n3';
import { DataSerializer, type IDataSerializerArgs } from './DataSerializer';

export class DataSerializerFilesystem extends DataSerializer {
  private readonly format: string;
  private readonly prefixes: Record<string, string> | undefined;
  private readonly pathPattern: string;
  private readonly pathReplacement: string;
  private readonly dryrun: boolean;
  private readonly overwrite: boolean;

  public constructor(args: IDataSerializerFilesystemArgs) {
    super(args);
    this.format = args.format;
    this.prefixes = args.prefixes;
    this.pathPattern = args.pathPattern;
    this.pathReplacement = args.pathReplacement;
    this.dryrun = args.dryrun;
    this.overwrite = args.overwrite;
  }

  public serialize(data: RDF.Quad[]): string[] {
    const quadsByPath: Map<string, RDF.Quad[]> = new Map();
    const writtenPaths: string[] = [];
    for (const quad of data) {
      const path = quad.subject.value.replace(this.pathPattern, this.pathReplacement);
      if (quadsByPath.has(path)) {
        quadsByPath.get(path)!.push(quad);
      } else {
        quadsByPath.set(path, [ quad ]);
      }
    }
    for (const [ path, quads ] of quadsByPath) {
      if (!this.dryrun && existsSync(path)) {
        if (!this.overwrite) {
          throw new Error(`Target already exists: ${path}`);
        } else {
          // eslint-disable-next-line no-console
          console.log(`Delete: ${path}`);
          unlinkSync(path);
        }
      }
      const writer: Writer = new Writer({ format: this.format, prefixes: this.prefixes });
      const output: string = writer.quadsToString(data);
      if (this.dryrun) {
        // eslint-disable-next-line no-console
        console.log(path, output.split('\n'));
      } else {
        // eslint-disable-next-line no-console
        console.log(`Serialize: ${path}`);
        writeFileSync(path, output);
        writtenPaths.push(path);
      }
    }
    return writtenPaths;
  }
}

export interface IDataSerializerFilesystemArgs extends IDataSerializerArgs {
  pathPattern: string;
  pathReplacement: string;
  format: string;
  prefixes?: Record<string, string>;
  dryrun: boolean;
  overwrite: boolean;
}
