import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { DataSerializer, type IDataSerializerArgs } from '@catalogue/data-serializer';
import type * as RDF from '@rdfjs/types';
import { Writer } from 'n3';

export class DataSerializerFilesystem extends DataSerializer {
  private readonly format: string;
  private readonly prefixes: Record<string, string> | undefined;

  public constructor(args: IDataSerializerFilesystemArgs) {
    super(args);
    this.format = args.format;
    this.prefixes = args.prefixes;
  }

  public async serialize(target: string, data: RDF.Quad[]): Promise<boolean> {
    const path = resolve(target);
    if (existsSync(path)) {
      throw new Error(`Target already exists: ${path}`);
    }
    const writer: Writer = new Writer({ format: this.format, prefixes: this.prefixes });
    const output: string = writer.quadsToString(data);
    writeFileSync(path, output);
    return true;
  }
}

export interface IDataSerializerFilesystemArgs extends IDataSerializerArgs {
  format: string;
  prefixes: Record<string, string> | undefined;
}
