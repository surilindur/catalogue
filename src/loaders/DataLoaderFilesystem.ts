import { readFileSync, lstatSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type * as RDF from '@rdfjs/types';
import { Parser } from 'n3';
import { DataLoader, type IDataLoaderArgs } from './DataLoader';

export class DataLoaderFilesystem extends DataLoader {
  private readonly prefix: string = 'file://';
  private readonly ignorePattern: RegExp | undefined;
  private readonly datasetPattern: RegExp;
  private readonly datasetPatternReplacement: string;
  private readonly datasetQuads: Map<string, RDF.Quad[]>;

  private paths: string[];

  public constructor(args: IDataLoaderFilesystemArgs) {
    super(args);
    this.ignorePattern = args.ignorePattern ? new RegExp(args.ignorePattern, 'u') : undefined;
    this.datasetPattern = new RegExp(args.datasetPattern, 'u');
    this.datasetPatternReplacement = args.datasetPatternReplacement;
    this.datasetQuads = new Map();
    this.paths = [];
  }

  public load(uri: string): Map<string, RDF.Quad[]> {
    this.paths.push(uri.replace(this.prefix, ''));
    this.loadDataFromPaths();
    return this.datasetQuads;
  }

  private loadDataFromPaths(): void {
    let previousDataset = '';
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
          const dataset = path.replace(this.datasetPattern, this.datasetPatternReplacement);
          if (dataset !== previousDataset) {
            previousDataset = dataset;
            // eslint-disable-next-line no-console
            console.log(`Reading for dataset: ${dataset}`);
          }
          const parser = new Parser();
          const contents = readFileSync(path, { encoding: 'utf8' });
          const quads = parser.parse(contents);
          if (!this.datasetQuads.has(dataset)) {
            this.datasetQuads.set(dataset, quads);
          } else {
            this.datasetQuads.get(dataset)!.push(...quads);
          }
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
  ignorePattern: string | undefined;
  /**
   * Regular expression and replacement value to use for getting dataset URI from the document URI.
   */
  datasetPattern: string;
  datasetPatternReplacement: string;
}
