import { readFileSync, lstatSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type * as RDF from '@rdfjs/types';
import { Parser } from 'n3';
import { DataLoader, type IDataLoaderArgs } from './DataLoader';

export class DataLoaderFilesystem extends DataLoader {
  private readonly prefix: string = 'file://';
  private readonly ignorePattern: RegExp | undefined;

  private paths: string[];
  private readonly quads: RDF.Quad[];

  public constructor(args: IDataLoaderFilesystemArgs) {
    super(args);
    this.ignorePattern = args.ignorePattern ? new RegExp(args.ignorePattern, 'u') : undefined;
    this.paths = [];
    this.quads = [];
  }

  public load(uri: string): RDF.Quad[] {
    this.paths.push(uri.replace(this.prefix, ''));
    this.loadDataFromPaths();
    return this.quads;
  }

  private loadDataFromPaths(): void {
    while (this.paths.length > 0) {
      const path = this.paths[0];
      if (!this.ignorePattern?.test(path)) {
        const stat = lstatSync(path);
        if (stat.isDirectory()) {
          const entries = readdirSync(path, { encoding: 'utf8', recursive: false });
          for (const entry of entries) {
            this.paths.push(join(path, entry));
          }
        } else if (stat.isFile()) {
          // eslint-disable-next-line no-console
          console.log(`Reading: ${path}`);
          const parser = new Parser();
          const contents = readFileSync(path, { encoding: 'utf8' });
          this.quads.push(...parser.parse(contents));
        }
      }
      this.paths = this.paths.length > 1 ? this.paths.slice(1) : [];
    }
  }
}

export interface IDataLoaderFilesystemArgs extends IDataLoaderArgs {
  /**
   * Regular expression for paths to ignore.
   */
  ignorePattern: string;
}
