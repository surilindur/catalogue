import { createWriteStream, constants } from 'node:fs';
import { access } from 'node:fs/promises';
import { resolve as resolvePath } from 'node:path';
import type * as RDF from '@rdfjs/types';
import type { AsyncIterator } from 'asynciterator';
import { StreamWriter } from 'n3';
import { DataSerializer, type IDataSerializerArgs } from './DataSerializer';

const FORMAT_EXTENSIONS: Record<string, string> = {
  'application/n-quads': 'nq',
  'text/turtle': 'ttl',
};

export class DataSerializerFilesystem extends DataSerializer {
  private readonly format: string;
  private readonly prefixes: Record<string, string> | undefined;
  private readonly listonly: boolean;
  private readonly overwrite: boolean;

  public constructor(args: IDataSerializerFilesystemArgs) {
    super(args);
    this.format = args.format;
    this.prefixes = args.prefixes;
    this.listonly = args.listonly;
    this.overwrite = args.overwrite;
  }

  public async serialize(stream: AsyncIterator<RDF.Quad>): Promise<URL[]> {
    return new Promise((resolve, reject) => {
      const writers: Map<URL, StreamWriter> = new Map();
      stream.on('data', (quad: RDF.Quad) => {
        const outputUri = this.subjectToOutputUri(quad.subject);
        if (outputUri) {
          const existingWriter = writers.get(outputUri);
          if (existingWriter) {
            existingWriter.push(quad);
          } else {
            this.outputUriToStreamWriter(outputUri).then(writer => {
              writers.set(outputUri, writer);
              writer.push(quad);
            }).catch(reject);
          }
        }
      }).on('end', () => {
        for (const [ outputUri, writer ] of writers) {
          // eslint-disable-next-line no-console
          console.log(`Closing writer for <${outputUri}>`);
          writer.end();
        }
        resolve([ ...writers.keys() ]);
      }).on('error', reject);
    });
  }

  private async outputUriToStreamWriter(uri: URL): Promise<StreamWriter> {
    const path = resolvePath(`${uri.toString().replace('file://', '')}.${FORMAT_EXTENSIONS[this.format]}`);
    const writer = new StreamWriter({ format: this.format, prefixes: this.prefixes });
    if (!this.listonly) {
      let createWriter = false;
      try {
        // Check if the file exists, and if it does, do not create the writer unless
        // the overwrite option has been set to true
        await access(path, constants.F_OK);
        createWriter = this.overwrite;
      } catch {
        // The file does not exist, so can create writer always
        createWriter = true;
      }
      if (createWriter) {
        const stream = createWriteStream(path, { encoding: 'utf-8' });
        writer.pipe(stream);
      }
    }
    return writer;
  }
}

export interface IDataSerializerFilesystemArgs extends IDataSerializerArgs {
  /**
   * @default {application/n-quads}
   */
  format: string;
  /**
   * @default {true}
   */
  listonly: boolean;
  /**
   * @default {false}
   */
  overwrite: boolean;
  /**
   * Optional record of prefixes to use in writer
   */
  prefixes?: Record<string, string>;
}
