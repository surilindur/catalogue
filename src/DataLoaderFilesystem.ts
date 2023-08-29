import { createReadStream } from 'node:fs';
import { lstat, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type * as RDF from '@rdfjs/types';
import { StreamParser } from 'n3';
import { DataLoader, type IDataLoaderArgs } from './DataLoader';

export class DataLoaderFilesystem extends DataLoader {
  private readonly prefix: string = 'file://';
  private readonly ignore: RegExp | undefined;

  public constructor(args: IDataLoaderFilesystemArgs) {
    super(args);
    this.ignore = args.ignore ? new RegExp(args.ignore, 'u') : undefined;
  }

  public async load(uri: string): Promise<RDF.Stream> {
    const path = uri.replace(this.prefix, '');
    const parser = new StreamParser();
    await this.loadFilesystemPath(path, parser);
    return parser;
  }

  private async loadFilesystemPath(path: string, parser: StreamParser): Promise<void> {
    if (!this.ignore?.test(path)) {
      const stat = await lstat(path);
      if (stat.isDirectory()) {
        const entries = await readdir(path, { recursive: false });
        for (const entry of entries) {
          await this.loadFilesystemPath(join(path, entry), parser);
        }
      } else if (stat.isFile()) {
        const stream = createReadStream(path);
        stream.pipe(parser);
      }
    }
  }
}

export interface IDataLoaderFilesystemArgs extends IDataLoaderArgs {
  /**
   * Regular expression for paths to ignore.
   */
  ignore: string;
}
