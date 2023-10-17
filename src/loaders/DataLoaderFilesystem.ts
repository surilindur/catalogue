import { lstat, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type * as RDF from '@rdfjs/types';
import { AsyncIterator, UnionIterator } from 'asynciterator';
import rdfDereference from 'rdf-dereference';
import type { IDataLoader, IDataLoaderArgs, QuadWithSource } from './DataLoader';

export class DataLoaderFilesystem implements IDataLoader {
  private readonly ignorePattern: RegExp | undefined;

  public constructor(args: IDataLoaderFilesystemArgs) {
    this.ignorePattern = args.ignorePattern ? new RegExp(args.ignorePattern, 'u') : undefined;
  }

  public async test(uri: URL): Promise<boolean> {
    return uri.protocol === 'file';
  }

  public async load(uri: URL): Promise<AsyncIterator<QuadWithSource>> {
    const iterators: AsyncIterator<QuadWithSource>[] = [];

    const pathsToProcess: string[] = [
      resolve(uri.toString().replace('file://', '')),
    ];

    while (pathsToProcess.length > 0) {
      const path = pathsToProcess.shift()!;
      if (!this.ignorePattern?.test(path)) {
        const stat = await lstat(path);
        if (stat.isDirectory()) {
          const entries = await readdir(path, { encoding: 'utf8', recursive: false });
          for (const entry of entries) {
            pathsToProcess.push(join(path, entry));
          }
        } else if (stat.isFile()) {
          const pathUrl = new URL(`file://${path}`).toString();
          const iterator = new AsyncIterator<QuadWithSource>();
          const { data } = await rdfDereference.dereference(path, { localFiles: true });
          data
            .on('data', (quad: RDF.Quad) => {
              iterator.append([{ ...quad, source: pathUrl }]);
            })
            .on('close', () => iterator.close())
            .on('end', () => iterator.emit('end'))
            .on('error', error => iterator.emit('error', error));
          iterators.push(iterator);
        }
      }
    }

    return new UnionIterator(iterators, { destroySources: true, autoStart: false });
  }
}

export interface IDataLoaderFilesystemArgs extends IDataLoaderArgs {
  /**
   * Regular expression for paths to ignore.
   */
  ignorePattern: string | undefined;
}
