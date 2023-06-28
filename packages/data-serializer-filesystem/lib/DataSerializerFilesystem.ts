import { writeFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import type * as RDF from '@rdfjs/types';
import { DataSerializer, type IDataSerializerArgs } from '@solidlab/catalogue-data-serializer';
import { Writer } from 'n3';

export class DataSerializerFilesystem extends DataSerializer {
  private readonly format: string;
  private readonly prefixes: Record<string, string> | undefined;
  private readonly path: string;
  private readonly dryrun: boolean;

  public constructor(args: IDataSerializerFilesystemArgs) {
    super(args);
    this.format = args.format;
    this.prefixes = args.prefixes;
    this.path = args.path;
    this.dryrun = args.dryrun;
  }

  public async serialize(target: string, data: RDF.Quad[]): Promise<boolean> {
    const serializationPath = resolve(join(target, this.path));
    if (!this.dryrun && existsSync(serializationPath)) {
      throw new Error(`Target already exists: ${serializationPath}`);
    }
    const writer: Writer = new Writer({ format: this.format, prefixes: this.prefixes });
    const output: string = writer.quadsToString(data);
    if (this.dryrun) {
      // eslint-disable-next-line no-console
      console.log(serializationPath, output);
    } else {
      writeFileSync(serializationPath, output);
    }
    return true;
  }
}

export interface IDataSerializerFilesystemArgs extends IDataSerializerArgs {
  format: string;
  prefixes?: Record<string, string>;
  path: string;
  dryrun: boolean;
}
