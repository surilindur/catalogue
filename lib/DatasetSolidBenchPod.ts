import type { Dirent } from 'node:fs';
import { createReadStream } from 'node:fs';
import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Stream } from 'node:stream';
import type * as RDF from '@rdfjs/types';
import { StreamParser, Writer } from 'n3';

import type { IDataset, IDatasetArgs } from './Dataset';

export class DatasetSolidBenchPod implements IDataset {
  protected readonly path: Dirent;
  public readonly uri: URL;

  public constructor(args: IDatasetSolidBenchPodArgs) {
    this.path = args.path;
    this.uri = args.uri;
  }

  public async load(): Promise<RDF.Stream> {
    const backlog = [ this.path ];
    let stream: Stream | undefined;
    const parser = new StreamParser();
    while (backlog.length > 0) {
      const path = backlog.shift();
      if (path) {
        if (path.isDirectory()) {
          backlog.push(...await readdir(path.path, { recursive: true, encoding: 'utf8', withFileTypes: true }));
        } else if (path.isFile()) {
          stream = createReadStream(path.path).pipe(parser, { end: false });
        }
      }
    }
    if (stream) {
      stream.on('end', () => parser.end());
    }
    return parser;
  }

  public async setMetadata(quads: RDF.Quad[], format = 'application/n-quads'): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const metaPath = join(this.path.path, '.meta');
      const writer = new Writer({ format });
      writer.addQuads(quads);
      writer.end((err, result) => err ? reject(err) : writeFile(metaPath, result).then(resolve).catch(reject));
    });
  }
}

export interface IDatasetSolidBenchPodArgs extends IDatasetArgs {
  path: Dirent;
}
