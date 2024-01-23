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
    // The setMaxListeners is there because of the piping, which causes a lot of listeners to be added for some reason.
    // Ideally, it should be replaced with something that handles the listener stuff better.
    const parser = new StreamParser({ format: 'N-Quads' }).setMaxListeners(1_000);
    const fileStreams = (await readdir(join(this.path.path, this.path.name), {
      recursive: true,
      encoding: 'utf8',
      withFileTypes: true,
    }))
      .filter(path => path.name !== '.meta' && (path.isFile() || path.isSymbolicLink()))
      .map(path => createReadStream(join(path.path, path.name)));
    let previousStream: Stream | undefined;
    for (const stream of fileStreams) {
      if (previousStream) {
        previousStream.on('end', () => {
          stream.pipe(parser, { end: false });
        });
      } else {
        stream.pipe(parser, { end: false });
      }
      previousStream = stream;
    }
    if (previousStream) {
      previousStream.on('end', () => parser.end());
    }
    return parser;
  }

  public async setMetadata(quads: RDF.Quad[], format = 'application/n-quads'): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const metaPath = join(this.path.path, this.path.name, '.meta');
      const writer = new Writer({ format });
      writer.addQuads(quads);
      writer.end((err, result) => err ? reject(err) : writeFile(metaPath, result).then(resolve).catch(reject));
    });
  }
}

export interface IDatasetSolidBenchPodArgs extends IDatasetArgs {
  path: Dirent;
}
