import { writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { resolve, join } from 'node:path';
import type * as RDF from '@rdfjs/types';
import { DataSerializer, type IDataSerializerArgs } from '@solidlab/catalogue-data-serializer';
import { Writer } from 'n3';

export class DataSerializerFilesystem extends DataSerializer {
  private readonly format: string;
  private readonly prefixes: Record<string, string> | undefined;
  private readonly path: string;
  private readonly dryrun: boolean;
  private readonly overwrite: boolean;

  public constructor(args: IDataSerializerFilesystemArgs) {
    super(args);
    this.format = args.format;
    this.prefixes = args.prefixes;
    this.path = args.path;
    this.dryrun = args.dryrun;
    this.overwrite = args.overwrite;
  }

  public async serialize(target: string, data: RDF.Quad[]): Promise<boolean> {
    const serializationPath = resolve(join(target, this.path));
    if (!this.dryrun && existsSync(serializationPath)) {
      if (!this.overwrite) {
        throw new Error(`Target already exists: ${serializationPath}`);
      } else {
        // eslint-disable-next-line no-console
        console.log(`Delete: ${serializationPath}`);
        unlinkSync(serializationPath);
      }
    }
    const writer: Writer = new Writer({ format: this.format, prefixes: this.prefixes });
    const output: string = writer.quadsToString(data);
    if (this.dryrun) {
      // eslint-disable-next-line no-console
      console.log(serializationPath, output.split('\n'));
    } else {
      // eslint-disable-next-line no-console
      console.log(`Serialize: ${serializationPath}`);
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
  overwrite: boolean;
}
