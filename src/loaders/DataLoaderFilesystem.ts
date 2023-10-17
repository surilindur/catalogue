import { lstat, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { PassThrough } from 'node:stream';
import type * as RDF from '@rdfjs/types';
import rdfDereference from 'rdf-dereference';
import type { IDataLoader, IDataLoaderArgs } from './DataLoader';

export class DataLoaderFilesystem implements IDataLoader {
  private readonly ignorePattern: RegExp | undefined;

  public constructor(args: IDataLoaderFilesystemArgs) {
    this.ignorePattern = args.ignorePattern ? new RegExp(args.ignorePattern, 'u') : undefined;
  }

  public async test(uri: URL): Promise<boolean> {
    return uri.protocol === 'file';
  }

  public async load(uri: URL): Promise<RDF.Stream> {
    const stream = new PassThrough({ objectMode: true });

    const pathsToProcess: string[] = [
      resolve(uri.toString().replace('file://', '')),
    ];

    let counter = 10;

    while (pathsToProcess.length > 0 && counter > 0) {
      const path = pathsToProcess.shift()!;
      if (!this.ignorePattern?.test(path)) {
        const stat = await lstat(path);
        if (stat.isDirectory()) {
          const entries = await readdir(path, { encoding: 'utf8', recursive: false });
          for (const entry of entries) {
            pathsToProcess.push(join(path, entry));
          }
        } else if (stat.isFile()) {
          counter--;
          const pathUrl = new URL(`file://${path}`).toString();
          // eslint-disable-next-line no-console
          console.log(`Parse <${pathUrl}>`);
          const { data } = await rdfDereference.dereference(path, { localFiles: true });
          data
            .on('data', (quad: RDF.Quad) => {
              (<any>quad).source = path;
              stream.write(quad);
            })
            .on('error', error => stream.destroy(error));
        }
      }
    }

    return stream;
  }
}

export interface IDataLoaderFilesystemArgs extends IDataLoaderArgs {
  /**
   * Regular expression for paths to ignore.
   */
  ignorePattern: string | undefined;
}
